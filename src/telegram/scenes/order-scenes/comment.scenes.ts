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

@Injectable()
@Scene('COMMENT_SCENE')
export class CommentScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('COMMENT_SCENE');
  }

  @SceneEnter()
  async onEnterCOMMENTScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.replyWithHTML(
      '<b>❔ Додайте коментар до замовлення</b><i> (Опціональна дія)</i>',
      Markup.inlineKeyboard([[Markup.button.callback('Пропустити', 'skip')]]),
    );
  }

  @On('text')
  async onCOMMENTS(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'COMMENT_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }

    const message = ctx.text.trim();

    if (!ctx.session.__scenes.state.comment) {
      ctx.session.__scenes.state.comment = message;
    } else {
      ctx.session.__scenes.state.comment = message;
    }

    ctx.replyWithHTML(
      `<b>❕ Доданий коментар:</b>  <i>"${ctx.session.__scenes.state.comment}"</i>`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Далі', 'go-forward')],
        [Markup.button.callback('🚫 Змінити коментар', 'change_comment')],
      ]),
    );
  }

  @Action('skip')
  async goSkip(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.session.__scenes.state.comment = '';
    await ctx.scene.enter('FINAL_ORDER_SCENE', ctx.session.__scenes.state);
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('FINAL_ORDER_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_comment')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
