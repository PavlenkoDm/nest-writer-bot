import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { IOrderSceneState } from './scenes/order-scenes/order.config';
import {
  onFillTypeOfWork,
  WorkType,
} from './helpers-telegram/work-type.helper';

type Scenario = 'order' | 'join';

interface IncomingData {
  command?: Scenario;
  workType?: WorkType;
  expertiseArea?: string;
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
  }

  private setupBotCommands() {
    this.telegram.setMyCommands([
      { command: '/start_order', description: 'Замовити роботу' },
      {
        command: '/start_join',
        description: 'Приєднатися до команди виконавців',
      },
    ]);
  }

  @Start()
  async onStart(@Ctx() ctx: SceneContext<IOrderSceneState>) {
    const startPayload = ctx.text.trim().split(' ')[1];
    if (!startPayload) {
      return;
    }

    const decodedPayload = Buffer.from(startPayload, 'base64').toString(
      'utf-8',
    );
    if (!decodedPayload) {
      if (!ctx.session.__scenes.state) {
        ctx.session.__scenes.state = {};
        ctx.session.__scenes.state.isScenario = true;
      } else {
        ctx.session.__scenes.state.isScenario = true;
      }
      ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
      return;
    }
    const orderData: IncomingData = await JSON.parse(decodedPayload);

    const { command, workType, expertiseArea } = orderData;
    if (command && command === 'order') {
      if (!workType) this.onStartOrder(ctx);
      if (workType && !expertiseArea) {
        if (!ctx.session.__scenes.state) {
          ctx.session.__scenes.state = {};
          ctx.session.__scenes.state.isScenario = true;
        } else {
          ctx.session.__scenes.state.isScenario = true;
        }
        if (!ctx.session.__scenes.state.typeOfWork) {
          ctx.session.__scenes.state.typeOfWork = onFillTypeOfWork(workType);
        } else {
          ctx.session.__scenes.state.typeOfWork = onFillTypeOfWork(workType);
        }
        this.onStartOrder(ctx);
      }
    }

    if (command && command === 'join') {
      this.onStartJoin(ctx);
    }
  }

  @Command('start_order')
  onStartOrder(@Ctx() ctx: SceneContext<IOrderSceneState>) {
    ctx.replyWithHTML(
      `<b>Вітаю ${ctx.from.username}!</b>👋\nЦей бот допоможе\nв замовленні роботи.\nТисніть   👇 "Go"   і починаємо.`,
      Markup.inlineKeyboard([Markup.button.callback('▶️ Go', 'go_order')]),
    );
  }

  @Command('start_join')
  onStartJoin(@Ctx() ctx: SceneContext<IOrderSceneState>) {
    ctx.replyWithHTML(
      `<b>Вітаю ${ctx.from.username}!</b>👋\nЦей бот допоможе відправити запит\nна приєднання до команди виконавців.\nТисніть   👇 "Join"   і починаємо.`,
      Markup.inlineKeyboard([Markup.button.callback('▶️ Join', 'go_join')]),
    );
  }

  @On('text')
  onReturnIdHandler(@Ctx() ctx: Context) {
    // console.log(ctx.text, ctx.message.from.id);
    if (ctx.text === 'admin_my_id') {
      ctx.reply(`Your Telegram ID is ${ctx.message.from.id}`);
    }
  }

  @Action('go_order')
  async onGoOrder(@Ctx() ctx: SceneContext<IOrderSceneState>) {
    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.isScenario = true;
      ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
      return;
    }
    if (
      ctx.session.__scenes.state.typeOfWork &&
      !ctx.session.__scenes.state.uniqueness
    ) {
      await ctx.replyWithHTML(
        `<b>❕ Вибраний(попередньо) тип роботи:</b>\n"<i>${ctx.session.__scenes.state.typeOfWork}</i>"`,
      );
      await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);
      return;
    }
    ctx.scene.enter('TYPE_SCENE');
  }
}
