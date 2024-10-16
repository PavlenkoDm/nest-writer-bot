import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { IOrderSceneState } from './scenes/order-scenes/order.config';
import {
  onFillTypeOfWork,
  WorkType,
  WorkTypeAbbreviations,
} from './helpers-telegram/work-type.helper';
import { Emoji } from './emoji/emoji';
import { IJoinSceneState } from './scenes/join-scenes/join.config';
import {
  ExpertiseArea,
  onFillDisciplineBranch,
} from './helpers-telegram/discipline.helper';
import {
  ExecutionTime,
  onFillTimeLimit,
} from './helpers-telegram/time-limit.helper';
import { mapGetter, mapSetter, toDeleteMapKey } from './utils/map.utils';

type Scenario = 'order' | 'join';

interface IncomingData {
  command?: Scenario;
  workType?: WorkType;
  a?: ExpertiseArea;
  // frontTheme?: string;
  u?: string;
  c?: string;
  t?: ExecutionTime;
  w?: WorkTypeAbbreviations;
}

export type MyOrderJoinContext = IOrderSceneState & IJoinSceneState;

enum Message {
  userMessageId = 'userMessageId',
  userStartMessageId = 'userStartMessageId',
  startJoinMessageId = 'startJoinMessageId',
  startOrderMessageId = 'startOrderMessageId',
  choosenWorkTypeMessageId = 'choosenWorkTypeMessageId',
}

@Injectable()
@Update()
export class TelegramService extends Telegraf<Context> {
  constructor(
    private readonly configService: ConfigService,
    // @InjectBot() private readonly bot: Telegraf<Context>,
  ) {
    super(configService.get('BOT_TOKEN'));
    this.setupBotCommands();
    this.msgIdMap = new Map<string, number>();
  }

  private msgIdMap: Map<string, number>;
  // private userMessageId: number;
  // private userStartMessageId: number;
  // private startJoinMessageId: number;
  // private startOrderMessageId: number;
  // private choosenWorkTypeMessageId: number;

  private setupBotCommands() {
    this.telegram.setMyCommands([
      {
        command: '/start_order',
        description: ` ${Emoji.shoppingCart} Замовити роботу`,
      },
      {
        command: '/start_join',
        description: `${Emoji.joinTeam} Приєднатися до команди виконавців`,
      },
    ]);
  }

  private async onStartJoinMarkup(ctx: SceneContext<IJoinSceneState>) {
    const startJoinMessage = await ctx.replyWithHTML(
      `<b>Вітаю, ${ctx.from.username}!</b>${Emoji.greeting}
      \nДякуємо, що вирішили приєднатися до нашої команди виконавців. Будь ласка, дайте відповіді на наступні запитання, щоб ми могли додати Вас до нашої бази виконавців.
      \nТисніть   ${Emoji.pushGo} "Join"   і починаємо.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.go} Join`, `go_join`),
      ]),
    );

    const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    mapSetter(this.msgIdMap, startJoinMessageId, startJoinMessage.message_id);

    return startJoinMessage;
  }

  private async onStartOrderMarkup(ctx: SceneContext<IOrderSceneState>) {
    const startOrderMessage = await ctx.replyWithHTML(
      `<b>Вітаю, ${ctx.from.username}!</b>${Emoji.greeting}
      \nДякуємо, що обрали наш сервіс для замовлення роботи!
      \nМи цінуємо вашу довіру і час, тому...
      \nТисніть   ${Emoji.pushGo} "Go"   і починаємо.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.go} Go`, `go_order`),
      ]),
    );

    const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    mapSetter(this.msgIdMap, startOrderMessageId, startOrderMessage.message_id);

    return startOrderMessage;
  }

  private async onChoosenWorkTypeMarkup(ctx: SceneContext<IOrderSceneState>) {
    const choosenWorkTypeMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибраний(попередньо) тип роботи:</b>
        \n"<i>${ctx.session.__scenes.state.typeOfWork}</i>"`,
    );

    const choosenWorkTypeMessageId = `${Message.choosenWorkTypeMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    mapSetter(
      this.msgIdMap,
      choosenWorkTypeMessageId,
      choosenWorkTypeMessage.message_id,
    );

    return choosenWorkTypeMessage;
  }

  private async deleteMessage(
    ctx: SceneContext<MyOrderJoinContext>,
    mapName: Map<string, number>,
    msgIdMapKey: string,
    msgIdMapValue: number,
  ) {
    try {
      if (!!msgIdMapValue) {
        await ctx.deleteMessage(msgIdMapValue);
        toDeleteMapKey(mapName, msgIdMapKey);
      } else {
        toDeleteMapKey(mapName, msgIdMapKey);
        return;
      }
    } catch (error) {
      if (error.response && error.response.error_code === 400) {
        // console.log(`Message does not exist. Initiator: ${ctx.from.username}`);
        return;
      }
      console.error('Error:', error);
      return;
    }
  }

  @Start()
  async onStart(@Ctx() ctx: SceneContext<MyOrderJoinContext>) {
    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    } else {
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    }

    const userStartMessageId = `${Message.userStartMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    mapSetter(this.msgIdMap, userStartMessageId, ctx.message.message_id);

    const startPayload = ctx.text.trim().split(' ')[1];

    if (!startPayload) {
      return;
    }

    const decodedPayload = Buffer.from(startPayload, 'base64').toString(
      'utf-8',
    );
    if (!decodedPayload) {
      ctx.session.__scenes.state.isScenario = true;

      await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);

      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        userStartMessageId,
        mapGetter(this.msgIdMap, userStartMessageId),
      );
      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        startOrderMessageId,
        mapGetter(this.msgIdMap, startOrderMessageId),
      );
      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        startJoinMessageId,
        mapGetter(this.msgIdMap, startJoinMessageId),
      );

      return;
    }

    const orderData: IncomingData = await JSON.parse(decodedPayload);

    const { command, workType, a, u, c, t, w } = orderData;

    if (command && command === 'order') {
      if (!workType) await this.onStartOrder(ctx);

      if (workType && !a) {
        ctx.session.__scenes.state.isScenario = true;

        if (!ctx.session.__scenes.state.typeOfWork) {
          ctx.session.__scenes.state.typeOfWork = onFillTypeOfWork(workType);
        } else {
          ctx.session.__scenes.state.typeOfWork = onFillTypeOfWork(workType);
        }

        await this.onStartOrder(ctx);

        await this.deleteMessage(
          ctx,
          this.msgIdMap,
          userStartMessageId,
          mapGetter(this.msgIdMap, userStartMessageId),
        );

        return;
      }
    }

    if (c && c === 'ord') {
      ctx.session.__scenes.state.isScenario = true;
      ctx.session.__scenes.state.fromCalculation = true;
      ctx.session.__scenes.state.disciplineFlag = true;

      if (!ctx.session.__scenes.state.typeOfWork) {
        ctx.session.__scenes.state.typeOfWork = onFillTypeOfWork(w);
      } else {
        ctx.session.__scenes.state.typeOfWork = onFillTypeOfWork(w);
      }

      if (!ctx.session.__scenes.state.discipline) {
        ctx.session.__scenes.state.discipline = {};
        ctx.session.__scenes.state.discipline.branch =
          onFillDisciplineBranch(a);
      } else {
        ctx.session.__scenes.state.discipline.branch =
          onFillDisciplineBranch(a);
      }

      // if (frontTheme) {
      //   if (!ctx.session.__scenes.state.theme) {
      //     ctx.session.__scenes.state.theme = frontTheme;
      //   } else {
      //     ctx.session.__scenes.state.theme = frontTheme;
      //   }
      // }

      if (u && +u !== 0) {
        const frontUniqueness = +u;
        if (!ctx.session.__scenes.state.uniqueness) {
          ctx.session.__scenes.state.uniquenessFlag = true;
          ctx.session.__scenes.state.uniqueness = frontUniqueness;
        } else {
          ctx.session.__scenes.state.uniquenessFlag = true;
          ctx.session.__scenes.state.uniqueness = frontUniqueness;
        }
      }

      if (!ctx.session.__scenes.state.timeLimit) {
        ctx.session.__scenes.state.timeLimit = onFillTimeLimit(t);
      } else {
        ctx.session.__scenes.state.timeLimit = onFillTimeLimit(t);
      }

      await this.onStartOrder(ctx);

      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        userStartMessageId,
        mapGetter(this.msgIdMap, userStartMessageId),
      );

      return;
    }

    if (command && command === 'join') {
      await this.onStartJoin(ctx);

      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        userStartMessageId,
        mapGetter(this.msgIdMap, userStartMessageId),
      );

      return;
    }
  }

  @Command('start_order')
  async onStartOrder(@Ctx() ctx: SceneContext<IOrderSceneState>) {
    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    } else {
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    }

    const userMessageId = `userMessageId${ctx.session.__scenes.state.userTelegramId}`;
    const startJoinMessageId = `startJoinMessageId${ctx.session.__scenes.state.userTelegramId}`;
    const startOrderMessageId = `startOrderMessageId${ctx.session.__scenes.state.userTelegramId}`;
    const userStartMessageId = `userStartMessageId${ctx.session.__scenes.state.userTelegramId}`;

    mapSetter(this.msgIdMap, userMessageId, ctx.message.message_id);

    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startJoinMessageId,
      mapGetter(this.msgIdMap, startJoinMessageId),
    );
    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startOrderMessageId,
      mapGetter(this.msgIdMap, startOrderMessageId),
    );

    await this.onStartOrderMarkup(ctx);

    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      userMessageId,
      mapGetter(this.msgIdMap, userMessageId),
    );
    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      userStartMessageId,
      mapGetter(this.msgIdMap, userStartMessageId),
    );

    return;
  }

  @Command('start_join')
  async onStartJoin(@Ctx() ctx: SceneContext<IJoinSceneState>) {
    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    } else {
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    }

    const userMessageId = `${Message.userMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const userStartMessageId = `${Message.userStartMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    mapSetter(this.msgIdMap, userMessageId, ctx.message.message_id);

    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startJoinMessageId,
      mapGetter(this.msgIdMap, startJoinMessageId),
    );
    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startOrderMessageId,
      mapGetter(this.msgIdMap, startOrderMessageId),
    );

    await this.onStartJoinMarkup(ctx);

    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      userMessageId,
      mapGetter(this.msgIdMap, userMessageId),
    );
    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      userStartMessageId,
      mapGetter(this.msgIdMap, userStartMessageId),
    );

    return;
  }

  @On('text')
  onReturnIdHandler(@Ctx() ctx: Context) {
    // console.log(ctx.text, ctx.message.from.id);
    if (ctx.text === 'admin_my_id') {
      ctx.reply(`Your Telegram ID is ${ctx.message.from.id}`);
    }
  }

  @Action(`go_order`)
  async onGoOrder(@Ctx() ctx: SceneContext<IOrderSceneState>) {
    function deleteMessageDelayed(
      ctx: SceneContext<IOrderSceneState>,
      mapName: Map<string, number>,
      msgIdMapKey: string,
      msgIdMapValue: number,
      delay: number,
    ) {
      return setTimeout(
        (async () => {
          try {
            if (!!msgIdMapValue) {
              await ctx.deleteMessage(msgIdMapValue);
              toDeleteMapKey(mapName, msgIdMapKey);
            } else {
              toDeleteMapKey(mapName, msgIdMapKey);
              return;
            }
          } catch (error) {
            if (error.response && error.response.error_code === 400) {
              // console.log(
              //   `Message does not exist. Initiator: ${ctx.from.username}`,
              // );
              return;
            }
            console.error('Error:', error);
            return;
          }
        }).bind(ctx),
        delay,
      );
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.isScenario = true;
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();

      await ctx.answerCbQuery();
      await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);

      const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
      const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;

      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        startOrderMessageId,
        mapGetter(this.msgIdMap, startOrderMessageId),
      );
      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        startJoinMessageId,
        mapGetter(this.msgIdMap, startJoinMessageId),
      );

      return;
    }

    if (
      ctx.session.__scenes.state.typeOfWork &&
      !ctx.session.__scenes.state.timeLimit
    ) {
      await ctx.answerCbQuery();
      await this.onChoosenWorkTypeMarkup(ctx);

      const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
      const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;
      const choosenWorkTypeMessageId = `${Message.choosenWorkTypeMessageId}${ctx.session.__scenes.state.userTelegramId}`;

      deleteMessageDelayed(
        ctx,
        this.msgIdMap,
        startOrderMessageId,
        mapGetter(this.msgIdMap, startOrderMessageId),
        1000,
      );
      deleteMessageDelayed(
        ctx,
        this.msgIdMap,
        startJoinMessageId,
        mapGetter(this.msgIdMap, startJoinMessageId),
        1000,
      );
      deleteMessageDelayed(
        ctx,
        this.msgIdMap,
        choosenWorkTypeMessageId,
        mapGetter(this.msgIdMap, choosenWorkTypeMessageId),
        10000,
      );

      await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);

      return;
    }

    if (
      ctx.session.__scenes.state.typeOfWork &&
      ctx.session.__scenes.state.timeLimit
    ) {
      await ctx.answerCbQuery();
      await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);

      const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
      const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;

      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        startOrderMessageId,
        mapGetter(this.msgIdMap, startOrderMessageId),
      );
      await this.deleteMessage(
        ctx,
        this.msgIdMap,
        startJoinMessageId,
        mapGetter(this.msgIdMap, startJoinMessageId),
      );

      return;
    }

    ctx.session.__scenes.state.isScenario = true;
    ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();

    await ctx.answerCbQuery();
    await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);

    const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startOrderMessageId,
      mapGetter(this.msgIdMap, startOrderMessageId),
    );
    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startJoinMessageId,
      mapGetter(this.msgIdMap, startJoinMessageId),
    );

    return;
  }

  @Action(`go_join`)
  async onGoJoin(@Ctx() ctx: SceneContext<IJoinSceneState>) {
    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.isJoinScenario = true;
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    } else {
      ctx.session.__scenes.state.isJoinScenario = true;
      ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);

    const startOrderMessageId = `${Message.startOrderMessageId}${ctx.session.__scenes.state.userTelegramId}`;
    const startJoinMessageId = `${Message.startJoinMessageId}${ctx.session.__scenes.state.userTelegramId}`;

    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startOrderMessageId,
      mapGetter(this.msgIdMap, startOrderMessageId),
    );
    await this.deleteMessage(
      ctx,
      this.msgIdMap,
      startJoinMessageId,
      mapGetter(this.msgIdMap, startJoinMessageId),
    );

    return;
  }
}
