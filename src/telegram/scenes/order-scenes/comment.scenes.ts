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
import { dangerRegexp } from '../helpers-scenes/regexps.helper';

@Injectable()
@Scene('COMMENT_SCENE')
export class CommentScene extends CommonOrderClass {
  constructor() {
    super('COMMENT_SCENE');
  }

  private commentStartMessageId: number;
  private commentChoiceMessageId: number;
  protected commandForbiddenMessageId: number;
  protected alertMessageId: number;

  private async commentStartMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Додайте коментар до замовлення</b> <i>(Опціональна дія)</i>`,
      Markup.inlineKeyboard([
        [Markup.button.callback('Пропустити', 'skip_comment')],
      ]),
    );

    this.commentStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async commentChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.commentChoiceMessageId) {
      await ctx.deleteMessage(this.commentChoiceMessageId);
      this.commentChoiceMessageId = 0;
    }

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Доданий коментар:</b>  <i>"${ctx.session.__scenes.state.comment}"</i>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_final_order',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити коментар`,
            'change_comment',
          ),
        ],
      ]),
    );

    this.commentChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  @SceneEnter()
  async onEnterCommentScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (this.commentStartMessageId) {
      await ctx.deleteMessage(this.commentStartMessageId);
      this.commentStartMessageId = 0;
    }
    await this.commentStartMarkup(ctx);
    return;
  }

  @On('text')
  async onComment(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'COMMENT_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.comment) {
        await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.commentChoiceMarkup(ctx);
        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (dangerRegexp.test(message)) {
      if (this.alertMessageId) {
        await ctx.deleteMessage(this.alertMessageId);
        this.alertMessageId = 0;
      }

      await this.onCreateAlertMessage(ctx);

      if (!ctx.session.__scenes.state.comment) {
        await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.commentChoiceMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state.comment) {
      ctx.session.__scenes.state.comment = message;
    } else {
      ctx.session.__scenes.state.comment = message;
    }

    await this.commentChoiceMarkup(ctx);
    return;
  }

  @Action('skip_comment')
  async goSkipComment(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'COMMENT_SCENE') {
      return;
    }
    ctx.session.__scenes.state.comment = '';
    await ctx.answerCbQuery();
    await ctx.scene.enter('FINAL_ORDER_SCENE', ctx.session.__scenes.state);

    if (this.commentStartMessageId) {
      await ctx.deleteMessage(this.commentStartMessageId);
      this.commentStartMessageId = 0;
    }
    if (this.commentChoiceMessageId) {
      await ctx.deleteMessage(this.commentChoiceMessageId);
      this.commentChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.alertMessageId) {
      await ctx.deleteMessage(this.alertMessageId);
      this.alertMessageId = 0;
    }
    return;
  }

  @Action('go-forward_to_final_order')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'COMMENT_SCENE') {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('FINAL_ORDER_SCENE', ctx.session.__scenes.state);

    if (this.commentStartMessageId) {
      await ctx.deleteMessage(this.commentStartMessageId);
      this.commentStartMessageId = 0;
    }
    if (this.commentChoiceMessageId) {
      await ctx.deleteMessage(this.commentChoiceMessageId);
      this.commentChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.alertMessageId) {
      await ctx.deleteMessage(this.alertMessageId);
      this.alertMessageId = 0;
    }
    return;
  }

  @Action('change_comment')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'COMMENT_SCENE') {
      return;
    }

    ctx.session.__scenes.state.comment = '';
    await ctx.answerCbQuery();
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);

    if (this.commentChoiceMessageId) {
      await ctx.deleteMessage(this.commentChoiceMessageId);
      this.commentChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.alertMessageId) {
      await ctx.deleteMessage(this.alertMessageId);
      this.alertMessageId = 0;
    }
    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
