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
import { CommonOrderClass, Forbidden, OrderMsg } from './common-order.abstract';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';
import { StringLength } from '../common-enums.scenes/strlength.enum';

enum OrderCommentMsg {
  commentStartMessageId = 'commentStartMessageId',
  commentChoiceMessageId = 'commentChoiceMessageId',
}

@Injectable()
@Scene('COMMENT_SCENE')
export class CommentScene extends CommonOrderClass {
  constructor() {
    super('COMMENT_SCENE');
  }

  private async commentStartMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Додайте коментар.</b><i> (Опціональна дія)</i>
      \nТут ви можете вказати додаткові побажання, наприклад:
      \n - деталізувати терміни виконання;
      \n - вказати уточнення по темі роботи;
      \n - поставити питання щодо замовлення та інше.
      \n${Emoji.monocle} Якщо у вас немає коментарів, ви можете пропустити цей крок.
      `,
      Markup.inlineKeyboard([
        [Markup.button.callback(`${Emoji.skip} Пропустити`, 'skip_comment')],
      ]),
    );

    this.setterForOrderMap(
      ctx,
      OrderCommentMsg.commentStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async commentChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, OrderCommentMsg.commentChoiceMessageId);

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

    this.setterForOrderMap(
      ctx,
      OrderCommentMsg.commentChoiceMessageId,
      choiceMessage.message_id,
    );

    return choiceMessage;
  }

  @SceneEnter()
  async onEnterCommentScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, OrderCommentMsg.commentStartMessageId);

    await this.commentStartMarkup(ctx);

    return;
  }

  @On('text')
  async onComment(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    this.setterForOrderMap(ctx, OrderMsg.userMessageId, ctx.message.message_id);

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'COMMENT_SCENE',
      Forbidden.enterCommands,
    );

    if (gate) {
      if (!ctx.session.__scenes.state.comment) {
        await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);

        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        await this.deleteMessage(ctx, OrderMsg.alertMessageId);

        return;
      } else {
        await this.commentChoiceMarkup(ctx);

        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        await this.deleteMessage(ctx, OrderMsg.alertMessageId);

        return;
      }
    }

    const msg = ctx.text.trim();

    const message = this.modifyMessageLength(msg, StringLength.medium);

    dangerRegexp.lastIndex = 0;
    if (dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, OrderMsg.alertMessageId);
      await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

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

    await this.deleteMessage(ctx, OrderCommentMsg.commentStartMessageId);
    await this.deleteMessage(ctx, OrderCommentMsg.commentChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.alertMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @Action('go-forward_to_privacy_policy')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'COMMENT_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('PRIVACY_POLICY_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderCommentMsg.commentStartMessageId);
    await this.deleteMessage(ctx, OrderCommentMsg.commentChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.alertMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

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

    await this.deleteMessage(ctx, OrderCommentMsg.commentChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.alertMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
