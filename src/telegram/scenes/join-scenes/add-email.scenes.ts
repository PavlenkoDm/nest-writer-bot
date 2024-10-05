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
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonJoinClass, Forbidden } from './common-join.abstract';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';

const addEmailRegExp =
  /^(?:"[a-zA-Z0-9żśółąńćźŁęŻŚÓŁĄŃĆŹĘ_.+-]+"|[a-zA-Z0-9żśółąńćźŁęŻŚÓŁĄŃĆŹĘ]+(?:\.[a-zA-Z0-9żśółąńćźŁęŻŚÓŁĄŃĆŹĘ]+)*)@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

@Injectable()
@Scene('ADD_EMAIL_SCENE')
export class AddEmailScene extends CommonJoinClass {
  constructor() {
    super('ADD_EMAIL_SCENE');
  }

  private addEmailStartMessageId: number;
  private addEmailChoiceMessageId: number;
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;

  private async addEmailStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть вашу електронну адресу.</b>
      \n${Emoji.attention} - Увага! Формат запису: 
      \nmymail@example.com`,
    );

    this.addEmailStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async addEmailChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, this.addEmailChoiceMessageId);

    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви вказали таку електронну адресу:</b>
      \n"<i>${ctx.session.__scenes.state.email}</i>"
      \n${Emoji.attention} - Для зміни email введіть новий.`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            `go-forward_to_phone_number`,
          ),
        ],
      ]),
    );

    this.addEmailChoiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterAddEmailScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await this.deleteMessage(ctx, this.addEmailStartMessageId);

    await this.addEmailStartMarkup(ctx);
    return;
  }

  @On('text')
  async onAddEmail(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'ADD_EMAIL_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.email) {
        await ctx.scene.enter('ADD_EMAIL_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.addEmailChoiseMarkup(ctx);
        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (!addEmailRegExp.test(message) || dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, this.alertMessageId);

      await this.onCreateAlertMessage(ctx);

      if (!ctx.session.__scenes.state.email) {
        await ctx.scene.enter('ADD_EMAIL_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.addEmailChoiseMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.email = message;
    } else {
      ctx.session.__scenes.state.email = message;
    }

    await this.addEmailChoiseMarkup(ctx);
    return;
  }

  @Action(`go-forward_to_phone_number`)
  async goToPhoneForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (
      ctx.scene.current.id !== 'ADD_EMAIL_SCENE' ||
      !ctx.session.__scenes.state.email
    ) {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('ADD_PHONE_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.alertMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
