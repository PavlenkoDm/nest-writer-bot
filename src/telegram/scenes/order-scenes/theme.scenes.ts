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
import { TypeOfWork } from './type.scenes';
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';

const needUniqueness = [
  TypeOfWork.coursework,
  TypeOfWork.bachelor,
  TypeOfWork.master,
  TypeOfWork.college_diploma,
  TypeOfWork.science_articles,
];

@Injectable()
@Scene('THEME_SCENE')
export class ThemeScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('THEME_SCENE');
  }

  @SceneEnter()
  async onEnterThemeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.replyWithHTML('<b>❔ Введіть тему роботи</b>');
  }

  @On('text')
  async onEnterTheme(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'THEME_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }

    // if (
    //   !ctx.scene.current.id ||
    //   ctx.scene.current.id !== 'THEME_SCENE' ||
    //   ctx.text.trim().startsWith('/')
    // ) {
    //   if (ctx.session.__scenes.state.typeOfWork) {
    //     await ctx.replyWithHTML('<b>❌ Команди не можуть бути темою!</b>');
    //     await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);
    //   }
    //   return;
    // }
    const message = ctx.text.trim();

    if (!ctx.session.__scenes.state.theme) {
      ctx.session.__scenes.state.theme = message;
    } else {
      ctx.session.__scenes.state.theme = message;
    }

    ctx.replyWithHTML(
      `<b>❕ Вибрана тема роботи:</b>  <i>"${ctx.session.__scenes.state.theme}"</i>`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Далі', 'go-forward')],
        [Markup.button.callback('🚫 Змінити тему', 'change_theme')],
      ]),
    );
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const typeOfWork = ctx.session.__scenes.state.typeOfWork as TypeOfWork;
    if (
      typeOfWork === TypeOfWork.science_articles &&
      needUniqueness.includes(typeOfWork)
    ) {
      if (!ctx.session.__scenes.state.uniqueness) {
        ctx.session.__scenes.state.uniqueness = 100;
      }
      ctx.session.__scenes.state.uniqueness = 100;
      await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);
      return;
    }
    if (needUniqueness.includes(typeOfWork)) {
      await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);
      return;
    }
    await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_theme')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
