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
import { IOrderSceneState } from './order.config';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';
import { ExecTime } from '../common-enums.scenes/time-limit.enum';

// const regExpForTimeLimit = /^[1-9]\d{0,2}$/;

@Injectable()
@Scene('TIME_LIMIT_SCENE')
export class TimeLimitScene extends CommonOrderClass {
  constructor() {
    super('TIME_LIMIT_SCENE');
  }

  private timeLimitStartMessageId: number;
  private timeLimitChoiceMessageId: number;
  protected commandForbiddenMessageId: number;

  private async timeLimitStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть термін виконання замовлення:</b>`,
      Markup.inlineKeyboard([
        [Markup.button.callback(ExecTime.urgent, 'urgent')],
        [Markup.button.callback(ExecTime.mediumTerm, 'medium_term')],
        [Markup.button.callback(ExecTime.longTerm, 'long_term')],
      ]),
    );

    this.timeLimitStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async timeLimitChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, this.timeLimitChoiceMessageId);

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибраний термін виконання:</b>
      \n"<i>${ctx.session.__scenes.state.timeLimit}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_file_load',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити термін виконання`,
            'change_days_amount',
          ),
        ],
      ]),
    );

    this.timeLimitChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  private async chooseTimeLimit(
    timePeriod: string,
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (!ctx.session.__scenes.state.timeLimit) {
      ctx.session.__scenes.state.timeLimit = timePeriod;
    }

    ctx.session.__scenes.state.timeLimit = timePeriod;

    await ctx.answerCbQuery();
    await this.timeLimitChoiceMarkup(ctx);

    return;
  }

  @SceneEnter()
  async onEnterTimeLimitScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const { fromCalculation, timeLimit } = ctx.session.__scenes.state;

    if (fromCalculation && timeLimit) {
      await this.goForward(ctx);
      return;
    }

    await this.deleteMessage(ctx, this.timeLimitStartMessageId);

    await this.timeLimitStartMarkup(ctx);

    return;
  }

  // @Hears(regExpForTimeLimit)
  // async onTimeLimitScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
  //   if (!ctx.scene.current.id || ctx.scene.current.id !== 'TIME_LIMIT_SCENE') {
  //     return;
  //   }
  //   const message = ctx.text.trim();
  //   const daysAmount = parseInt(message, 10);

  //   if (!ctx.session.__scenes.state.timeLimit) {
  //     ctx.session.__scenes.state.timeLimit = daysAmount;
  //   }

  //   ctx.session.__scenes.state.timeLimit = daysAmount;

  //   ctx.replyWithHTML(
  //     `<b>❕ Вибрана кількість днів:</b>  <i>${ctx.session.__scenes.state.timeLimit}</i>`,
  //     Markup.inlineKeyboard([
  //       [Markup.button.callback('✅ Далі', 'go-forward')],
  //       [
  //         Markup.button.callback(
  //           '🚫 Змінити кількість днів',
  //           'change_days_amount',
  //         ),
  //       ],
  //     ]),
  //   );
  // }

  @Action('urgent')
  async onUrgent(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseTimeLimit(ExecTime.urgent, ctx);
    return;
  }

  @Action('medium_term')
  async onMediumTerm(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseTimeLimit(ExecTime.mediumTerm, ctx);
    return;
  }

  @Action('long_term')
  async onLongTerm(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseTimeLimit(ExecTime.longTerm, ctx);
    return;
  }

  @Action('go-forward_to_file_load')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'TIME_LIMIT_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.timeLimitStartMessageId);
    await this.deleteMessage(ctx, this.timeLimitChoiceMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);

    return;
  }

  @Action('change_days_amount')
  async changeDaysAmount(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'TIME_LIMIT_SCENE') {
      return;
    }

    ctx.session.__scenes.state.timeLimit = '';

    await ctx.answerCbQuery();
    await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.timeLimitChoiceMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);

    return;
  }

  @On('text')
  async onTextInTimeLimitScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    this.userMessageId = ctx.message.message_id;

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'TIME_LIMIT_SCENE',
      Forbidden.enterCommands,
    );

    if (gate) {
      if (!ctx.session.__scenes.state.timeLimit) {
        await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);
        await this.deleteMessage(ctx, this.userMessageId);
        return;
      } else {
        await this.timeLimitChoiceMarkup(ctx);
        await this.deleteMessage(ctx, this.userMessageId);
        return;
      }
    }

    await this.deleteMessage(ctx, this.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
