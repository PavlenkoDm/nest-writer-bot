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

const addPhoneRegExp = /^\+\d+\s?\(\d+\)\s?\d+-\d+-\d+$/;

@Injectable()
@Scene('ADD_PHONE_SCENE')
export class AddPhoneScene extends CommonJoinClass {
  constructor() {
    super('ADD_PHONE_SCENE');
  }

  private addPhoneStartMessageId: number;
  private addPhoneChoiceMessageId: number;
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;

  private async addPhoneStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть ваш номер телефону.</b>
      \n${Emoji.attention} - Увага! Формат запису: 
      \n+38 (097) 111-22-33`,
    );

    this.addPhoneStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async addPhoneChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.addPhoneChoiceMessageId) {
      await ctx.deleteMessage(this.addPhoneChoiceMessageId);
      this.addPhoneChoiceMessageId = 0;
    }

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

    this.addPhoneChoiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterAddPhoneScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (this.addPhoneStartMessageId) {
      await ctx.deleteMessage(this.addPhoneStartMessageId);
      this.addPhoneStartMessageId = 0;
    }
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
      if (this.alertMessageId) {
        await ctx.deleteMessage(this.alertMessageId);
        this.alertMessageId = 0;
      }

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
    if (this.alertMessageId) {
      await ctx.deleteMessage(this.alertMessageId);
      this.alertMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
