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
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';

enum ExecTime {
  longTerm = 'Довготривалий: від 14 днів і довше',
  mediumTerm = 'Середньотривалий: 4-14 днів',
  urgent = 'Терміновий: 1-3 дні',
}

// const regExpForTimeLimit = /^[1-9]\d{0,2}$/;

@Injectable()
@Scene('TIME_LIMIT_SCENE')
export class TimeLimitScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('TIME_LIMIT_SCENE');
  }

  private async chooseTimeLimit(
    timePeriod: string,
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (!ctx.session.__scenes.state.timeLimit) {
      ctx.session.__scenes.state.timeLimit = timePeriod;
    }

    ctx.session.__scenes.state.timeLimit = timePeriod;

    await ctx.replyWithHTML(
      `<b>❕ Вибраний термін виконання:</b>\n"<i>${ctx.session.__scenes.state.timeLimit}</i>"`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Далі', 'go-forward')],
        [
          Markup.button.callback(
            '🚫 Змінити термін виконання',
            'change_days_amount',
          ),
        ],
      ]),
    );
  }

  @SceneEnter()
  async onEnterTimeLimitScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.replyWithHTML(
      '<b>❔ Введіть термін виконання замовлення</b>', // \n<i>☝️ Це має бути лише ціле число, не більше трьох знаків</i>
      Markup.inlineKeyboard([
        [Markup.button.callback(ExecTime.urgent, 'urgent')],
        [Markup.button.callback(ExecTime.mediumTerm, 'medium-term')],
        [Markup.button.callback(ExecTime.longTerm, 'long-term')],
      ]),
    );
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
  }

  @Action('medium-term')
  async onMediumTerm(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseTimeLimit(ExecTime.mediumTerm, ctx);
  }

  @Action('long-term')
  async onLongTerm(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseTimeLimit(ExecTime.longTerm, ctx);
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_days_amount')
  async changeDaysAmount(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);
  }

  @On('text')
  async onTextInTimeLimitScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'TIME_LIMIT_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
