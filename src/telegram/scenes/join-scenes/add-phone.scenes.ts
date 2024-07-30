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
  onSceneGateWithoutEnterScene,
} from '../helpers-scenes/scene-gate.helper';
import { Emoji } from 'src/telegram/emoji/emoji';

const addPhoneRegExp = /^\+\d+\s?\(\d+\)\s?\d+-\d+-\d+$/;

@Injectable()
@Scene('ADD_PHONE_SCENE')
export class AddPhoneScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('ADD_PHONE_SCENE');
  }

  private addPhoneStartMessageId: number;
  private addPhoneChoiceMessageId: number;

  private async addPhoneStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть ваш номер телефону</b>
      \n${Emoji.attention} - Увага! Формат запису: 
      \n+38 (097) 111-22-33`,
    );

    this.addPhoneStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async addPhoneChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.addPhoneChoiceMessageId &&
      (await ctx.deleteMessage(this.addPhoneChoiceMessageId));
    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви вказали такий номер телефону:</b>
      \n<i>${ctx.session.__scenes.state.phoneNumber}</i>
      \n${Emoji.attention} - Для зміни номера - введіть новий`,
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
    this.addPhoneStartMessageId &&
      (await ctx.deleteMessage(this.addPhoneStartMessageId));
    await this.addPhoneStartMarkup(ctx);
  }

  @On('text')
  async onAddPhone(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateWithoutEnterScene(
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

    if (!addPhoneRegExp.test(message)) {
      await ctx.replyWithHTML(
        `<b>${Emoji.reject} Ви ввели некоректне значення</b>`,
      );
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
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
