import { Injectable } from '@nestjs/common';
import {
  Action,
  Ctx,
  On,
  Scene,
  SceneEnter,
  SceneLeave,
} from 'nestjs-telegraf';
import { Markup, Scenes } from 'telegraf';
import { IJoinSceneState } from './join.config';
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { ExecTime } from '../order-scenes/time-limit.scenes';

const regExpForButton = /settimeperiod-(?![\d\s\n^])[^\n]+/;

@Injectable()
@Scene('TIME_PERIOD_SCENE')
export class TimePeriodScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('TIME_PERIOD_SCENE');
  }

  private botMessage: number;

  private async onTimePeriodSet(
    period: string,
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (!ctx.session.__scenes.state.timePeriod) {
      ctx.session.__scenes.state.timePeriod = [];
    }
    const elementIndex = ctx.session.__scenes.state.timePeriod.indexOf(period);
    if (elementIndex !== -1) {
      ctx.session.__scenes.state.timePeriod.splice(elementIndex, 1);
    } else {
      ctx.session.__scenes.state.timePeriod.push(period);
    }
  }

  private onTimePeriodGet(
    timePeriod: string,
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (!ctx.session.__scenes.state.timePeriod) {
      return '';
    }
    const elementIndex =
      ctx.session.__scenes.state.timePeriod.indexOf(timePeriod);
    if (elementIndex !== -1) {
      return Emoji.chosen;
    } else {
      return '';
    }
  }

  private async createStartMurkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const sentMessage = await ctx.reply(
      `<b>${Emoji.question} Oберіть терміни, в які Ви готові виконувати роботи:</b>
      \n  <i>( можна  обрати  не  1  варіант,  а  декілька )</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                `${this.onTimePeriodGet(ExecTime.urgent, ctx)}${ExecTime.urgent}`,
                'settimeperiod-urgent',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onTimePeriodGet(ExecTime.mediumTerm, ctx)}${ExecTime.mediumTerm}`,
                'settimeperiod-mediumTerm',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onTimePeriodGet(ExecTime.longTerm, ctx)}${ExecTime.longTerm}`,
                'settimeperiod-longTerm',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.forward} Далі`,
                'go-forward_to_add_email',
              ),
            ],
          ],
        },
      },
    );
    this.botMessage = sentMessage.message_id;
    return sentMessage;
  }

  @SceneEnter()
  async onEnterTimePeriodScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.botMessage) {
      await ctx.deleteMessage(this.botMessage);
    }
    await this.createStartMurkup(ctx);
  }

  @Action(regExpForButton)
  async onSetTimePeriodHandler(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const { data } = ctx.callbackQuery as CallbackQuery.DataQuery;
    const buttonId = data.split('-')[1];
    const enumEntries = Object.entries(ExecTime);
    const executionPeriod = enumEntries.find((item) => {
      return item[0] === buttonId;
    })[1];
    await this.onTimePeriodSet(executionPeriod, ctx);

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Oберіть терміни, в які Ви готові виконувати роботи:</b>
      \n  <i>( можна  обрати  не  1  варіант,  а  декілька )</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                `${this.onTimePeriodGet(ExecTime.urgent, ctx)}${ExecTime.urgent}`,
                'settimeperiod-urgent',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onTimePeriodGet(ExecTime.mediumTerm, ctx)}${ExecTime.mediumTerm}`,
                'settimeperiod-mediumTerm',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onTimePeriodGet(ExecTime.longTerm, ctx)}${ExecTime.longTerm}`,
                'settimeperiod-longTerm',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.forward} Далі`,
                'go-forward_to_add_email',
              ),
            ],
          ],
        },
      },
    );
  }

  @Action('go-forward_to_add_email')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'TIME_PERIOD_SCENE') {
      return;
    }
    if (
      !ctx.session.__scenes.state.timePeriod ||
      ctx.session.__scenes.state.timePeriod.length === 0
    ) {
      await ctx.replyWithHTML(`${Emoji.reject} Ви не ввели жодного значення!`);
      await ctx.scene.enter('TIME_PERIOD_SCENE', ctx.session.__scenes.state);
      return;
    }
    await ctx.scene.enter('ADD_EMAIL_SCENE', ctx.session.__scenes.state);
    return;
  }

  @On('text')
  async onTextInWorkTypeScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'TIME_PERIOD_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
