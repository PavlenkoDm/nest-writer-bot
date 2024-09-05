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
        [Markup.button.callback(`${Emoji.skip} Пропустити`, 'skip_comment')],
      ]),
    );

    this.commentStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async commentChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, this.commentChoiceMessageId);

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Доданий коментар:</b>  <i>"${ctx.session.__scenes.state.comment}"</i>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_privacy_policy',
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
    await this.deleteMessage(ctx, this.commentStartMessageId);

    await this.commentStartMarkup(ctx);

    return;
  }

  @On('text')
  async onComment(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, this.userMessageId);

    this.userMessageId = ctx.message.message_id;

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'COMMENT_SCENE',
      Forbidden.enterCommands,
    );

    if (gate) {
      if (!ctx.session.__scenes.state.comment) {
        await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);

        await this.deleteMessage(ctx, this.userMessageId);
        await this.deleteMessage(ctx, this.alertMessageId);

        return;
      } else {
        await this.commentChoiceMarkup(ctx);

        await this.deleteMessage(ctx, this.userMessageId);
        await this.deleteMessage(ctx, this.alertMessageId);

        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, this.alertMessageId);
      await this.deleteMessage(ctx, this.commandForbiddenMessageId);

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
    await ctx.scene.enter('PRIVACY_POLICY_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.commentStartMessageId);
    await this.deleteMessage(ctx, this.commentChoiceMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);
    await this.deleteMessage(ctx, this.alertMessageId);
    await this.deleteMessage(ctx, this.userMessageId);

    return;
  }

  @Action('go-forward_to_privacy_policy')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'COMMENT_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('PRIVACY_POLICY_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.commentStartMessageId);
    await this.deleteMessage(ctx, this.commentChoiceMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);
    await this.deleteMessage(ctx, this.alertMessageId);
    await this.deleteMessage(ctx, this.userMessageId);

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

    await this.deleteMessage(ctx, this.commentChoiceMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);
    await this.deleteMessage(ctx, this.alertMessageId);
    await this.deleteMessage(ctx, this.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
