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

const addEmailRegExp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]{2,}$/;

@Injectable()
@Scene('ADD_EMAIL_SCENE')
export class AddEmailScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('ADD_EMAIL_SCENE');
  }

  private addEmailStartMessageId: number;
  private addEmailChoiceMessageId: number;

  private async addEmailStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть Вашу електронну адресу</b>
      \n<i> ( Формат запису: mymail@example.com )</i>`,
    );

    this.addEmailStartMessageId = startMessage.message_id;

    return startMessage;
  }
  private async addEmailChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.addEmailChoiceMessageId &&
      (await ctx.deleteMessage(this.addEmailChoiceMessageId));
    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви вказали таку електронну адресу:</b>
      \n"<i>${ctx.session.__scenes.state.email}</i>"
      \n${Emoji.attention} ( Для зміни email - введіть новий )`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_phone_number',
          ),
        ],
      ]),
    );

    this.addEmailChoiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterAddEmailScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    this.addEmailStartMessageId &&
      (await ctx.deleteMessage(this.addEmailStartMessageId));
    await this.addEmailStartMarkup(ctx);
  }

  @On('text')
  async onAddEmail(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateWithoutEnterScene(
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

    if (!addEmailRegExp.test(message)) {
      await ctx.replyWithHTML(
        `<b>${Emoji.reject} Ви ввели некоректне значення</b>`,
      );

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
  }

  @Action('go-forward_to_phone_number')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'ADD_EMAIL_SCENE') {
      return;
    }
    await ctx.scene.enter('ADD_PHONE_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
