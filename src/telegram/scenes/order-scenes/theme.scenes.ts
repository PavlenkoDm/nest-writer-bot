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
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';

const needUniqueness = [
  TypeOfWork.coursework,
  TypeOfWork.bachelor,
  TypeOfWork.master,
  TypeOfWork.college_diploma,
  TypeOfWork.science_articles,
];

@Injectable()
@Scene('THEME_SCENE')
export class ThemeScene extends CommonOrderClass {
  constructor() {
    super('THEME_SCENE');
  }

  private themeStartMessageId: number;
  private themeChoiceMessageId: number;
  protected commandForbiddenMessageId: number;
  protected alertMessageId: number;

  private async themeStartMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть тему роботи.</b>`,
    );

    this.themeStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async themeChoiceMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, this.themeChoiceMessageId);

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибрана тема роботи:</b>  <i>"${ctx.session.__scenes.state.theme}"</i>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_uiqueness',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити тему`,
            'change_theme',
          ),
        ],
      ]),
    );

    this.themeChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  @SceneEnter()
  async onEnterThemeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const { fromCalculation, timeLimit, theme } = ctx.session.__scenes.state;

    if (fromCalculation && timeLimit && theme) {
      await this.goForward(ctx);
      return;
    }

    await this.deleteMessage(ctx, this.themeStartMessageId);

    await this.themeStartMarkup(ctx);
    return;
  }

  @On('text')
  async onEnterTheme(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, this.userMessageId);

    this.userMessageId = ctx.message.message_id;

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'THEME_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.theme) {
        await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);
        await this.deleteMessage(ctx, this.userMessageId);
        await this.deleteMessage(ctx, this.alertMessageId);
        return;
      } else {
        await this.themeChoiceMarkup(ctx);
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

      if (!ctx.session.__scenes.state.theme) {
        await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);
        await this.deleteMessage(ctx, this.userMessageId);
        return;
      } else {
        await this.themeChoiceMarkup(ctx);
        await this.deleteMessage(ctx, this.userMessageId);
        return;
      }
    }

    if (!ctx.session.__scenes.state.theme) {
      ctx.session.__scenes.state.theme = message;
    } else {
      ctx.session.__scenes.state.theme = message;
    }

    await this.themeChoiceMarkup(ctx);

    return;
  }

  @Action('go-forward_to_uiqueness')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'THEME_SCENE') {
      return;
    }

    const typeOfWork = ctx.session.__scenes.state.typeOfWork as TypeOfWork;
    if (
      typeOfWork === TypeOfWork.science_articles &&
      needUniqueness.includes(typeOfWork)
    ) {
      if (!ctx.session.__scenes.state.uniqueness) {
        ctx.session.__scenes.state.uniqueness = 100;
      } else {
        ctx.session.__scenes.state.uniqueness = 100;
      }

      await ctx.answerCbQuery();
      await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);

      await this.deleteMessage(ctx, this.themeStartMessageId);
      await this.deleteMessage(ctx, this.themeChoiceMessageId);
      await this.deleteMessage(ctx, this.commandForbiddenMessageId);
      await this.deleteMessage(ctx, this.alertMessageId);
      await this.deleteMessage(ctx, this.userMessageId);

      return;
    }

    if (needUniqueness.includes(typeOfWork)) {
      await ctx.answerCbQuery();
      await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);

      await this.deleteMessage(ctx, this.themeStartMessageId);
      await this.deleteMessage(ctx, this.themeChoiceMessageId);
      await this.deleteMessage(ctx, this.commandForbiddenMessageId);
      await this.deleteMessage(ctx, this.alertMessageId);
      await this.deleteMessage(ctx, this.userMessageId);

      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.themeStartMessageId);
    await this.deleteMessage(ctx, this.themeChoiceMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);
    await this.deleteMessage(ctx, this.alertMessageId);
    await this.deleteMessage(ctx, this.userMessageId);

    return;
  }

  @Action('change_theme')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'THEME_SCENE') {
      return;
    }

    ctx.session.__scenes.state.theme = '';

    await ctx.answerCbQuery();
    await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.themeChoiceMessageId);
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
