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

@Injectable()
@Scene('FULL_NAME_SCENE')
export class FullNameScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('FULL_NAME_SCENE');
  }

  @SceneEnter()
  async onEnterFullNameScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть ваше повне імʼя та вік.</b>
      \n<i> ( Наприклад:  Іванов  Іван  Іванович,  25 )</i>`,
    );
  }

  @On('text')
  async onFullName(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'FULL_NAME_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }

    const message = ctx.text.trim();

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.fullName = message;
    } else {
      ctx.session.__scenes.state.fullName = message;
    }

    ctx.replyWithHTML(
      `<b>${Emoji.answer} Додані повне імʼя та вік:</b>
      \n"<i>${ctx.session.__scenes.state.fullName}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_speciality',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити повне імʼя та вік`,
            'change_full_name',
          ),
        ],
      ]),
    );
  }

  @Action('go-forward_to_speciality')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'FULL_NAME_SCENE') {
      return;
    }
    await ctx.scene.enter('SPECIALITY_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_full_name')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'FULL_NAME_SCENE') {
      return;
    }
    await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
