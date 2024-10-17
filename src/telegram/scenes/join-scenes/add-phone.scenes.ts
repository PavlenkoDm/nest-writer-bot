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
import { CommonJoinClass, Forbidden, JoinMsg } from './common-join.abstract';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';

const addPhoneRegExp = /^\+\d{1,3}\d{7,14}$/; // /^\+\d+\s?\(\d+\)\s?\d+-\d+-\d+$/;

enum JoinAddPhoneMsg {
  addPhoneStartMessageId = 'addPhoneStartMessageId',
  addPhoneChoiceMessageId = 'addPhoneChoiceMessageId',
}

@Injectable()
@Scene('ADD_PHONE_SCENE')
export class AddPhoneScene extends CommonJoinClass {
  constructor() {
    super('ADD_PHONE_SCENE');
  }

  private async addPhoneStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть ваш номер телефону.</b>
      \n${Emoji.attention} - Увага! Формат запису: 
      \n+380970010203`,
    );

    this.setterForJoinMap(
      ctx,
      JoinAddPhoneMsg.addPhoneStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async addPhoneChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, JoinAddPhoneMsg.addPhoneChoiceMessageId);

    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви вказали такий номер телефону:</b>
      \n<i>${ctx.session.__scenes.state.phoneNumber}</i>
      \n${Emoji.attention} - Для зміни номера введіть новий.`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            `go-forward_to_personal_info`,
          ),
        ],
      ]),
    );

    this.setterForJoinMap(
      ctx,
      JoinAddPhoneMsg.addPhoneChoiceMessageId,
      message.message_id,
    );

    return message;
  }

  @SceneEnter()
  async onEnterAddPhoneScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await this.deleteMessage(ctx, JoinAddPhoneMsg.addPhoneStartMessageId);

    await this.addPhoneStartMarkup(ctx);
    return;
  }

  @On('text')
  async onAddPhone(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'ADD_PHONE_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.phoneNumber) {
        await ctx.scene.enter('ADD_PHONE_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.addPhoneChoiseMarkup(ctx);
        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (!addPhoneRegExp.test(message) || dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, JoinMsg.alertMessageId);

      await this.onCreateAlertMessage(ctx);

      if (!ctx.session.__scenes.state.phoneNumber) {
        await ctx.scene.enter('ADD_PHONE_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.addPhoneChoiseMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.phoneNumber = message;
    } else {
      ctx.session.__scenes.state.phoneNumber = message;
    }

    await this.addPhoneChoiseMarkup(ctx);
    return;
  }

  @Action(`go-forward_to_personal_info`)
  async goToPersonalInfoForward(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (
      ctx.scene.current.id !== 'ADD_PHONE_SCENE' ||
      !ctx.session.__scenes.state.phoneNumber
    ) {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('PERSONAL_INFO_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, JoinMsg.alertMessageId);
    await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
