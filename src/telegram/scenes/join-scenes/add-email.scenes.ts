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
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';
import { Emoji } from 'src/telegram/emoji/emoji';

const addEmailRegExp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

@Injectable()
@Scene('ADD_EMAIL_SCENE')
export class AddEmailScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('ADD_EMAIL_SCENE');
  }

  @SceneEnter()
  async onEnterAddEmailScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть Вашу електронну адресу</b>
      \n<i> ( Формат запису: mymail@example.com )</i>`,
    );
  }

  @On('text')
  async onAddEmail(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'ADD_EMAIL_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }

    const message = ctx.text.trim();

    if (!addEmailRegExp.test(message)) {
      await ctx.replyWithHTML(
        `<b>${Emoji.reject} Ви ввели некоректне значення</b>`,
      );
      await ctx.scene.enter('ADD_EMAIL_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.email = message;
    } else {
      ctx.session.__scenes.state.email = message;
    }

    ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви вказали таку електронну адресу:</b>
      \n"<i>${ctx.session.__scenes.state.email}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_phone_number',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити електронну адресу`,
            'change_email',
          ),
        ],
      ]),
    );
  }

  @Action('go-forward_to_phone_number')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'ADD_EMAIL_SCENE') {
      return;
    }
    await ctx.scene.enter('TIME_PERIOD_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_email')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'ADD_EMAIL_SCENE') {
      return;
    }
    await ctx.scene.enter('ADD_EMAIL_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
