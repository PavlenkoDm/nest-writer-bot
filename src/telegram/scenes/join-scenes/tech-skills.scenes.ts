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

@Injectable()
@Scene('TECH_SKILLS_SCENE')
export class TechSkillsScene extends CommonJoinClass {
  constructor() {
    super('TECH_SKILLS_SCENE');
  }

  private techSkillsStartMessageId: number;
  private techSkillsChoiceMessageId: number;
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;

  private async techSkillsStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть програми (мови програмування, фреймворки), з якими ви працюєте і які стосуються вашої технічної спеціальності:</b>
      \n<i> ( Наприклад:  AutoCAD,  MATLAB,  SolidWorks,  JavaScript,  React )</i>
      \n${Emoji.attention} - Пропустіть даний пункт, якщо у вас нетехнічна спеціальність.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.skip} Пропустити`, `skip_tech_skills`),
      ]),
    );

    this.techSkillsStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async techSkillsChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.techSkillsChoiceMessageId) {
      await ctx.deleteMessage(this.techSkillsChoiceMessageId);
      this.techSkillsChoiceMessageId = 0;
    }

    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви працюєте з такими програмами (мовами програмування, фреймворками):</b>
      \n"<i>${ctx.session.__scenes.state.techSkills}</i>"
      \n${Emoji.attention} - Для зміни доданої інформації введіть нові дані.`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            `go-forward_to_time_period`,
          ),
        ],
      ]),
    );

    this.techSkillsChoiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterTechSkillsScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.techSkillsStartMessageId) {
      await ctx.deleteMessage(this.techSkillsStartMessageId);
      this.techSkillsStartMessageId = 0;
    }
    await this.techSkillsStartMarkup(ctx);
    return;
  }

  @On('text')
  async onTechSkills(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'TECH_SKILLS_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.techSkills) {
        await ctx.scene.enter('TECH_SKILLS_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.techSkillsChoiseMarkup(ctx);
        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (dangerRegexp.test(message)) {
      if (this.alertMessageId) {
        await ctx.deleteMessage(this.alertMessageId);
        this.alertMessageId = 0;
      }

      await this.onCreateAlertMessage(ctx);

      if (!ctx.session.__scenes.state.techSkills) {
        await ctx.scene.enter('TECH_SKILLS_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.techSkillsChoiseMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.techSkills = message;
    } else {
      ctx.session.__scenes.state.techSkills = message;
    }

    await this.techSkillsChoiseMarkup(ctx);
    return;
  }

  @Action(`go-forward_to_time_period`)
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (
      ctx.scene.current.id !== 'TECH_SKILLS_SCENE' ||
      !ctx.session.__scenes.state.techSkills
    ) {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('TIME_PERIOD_SCENE', ctx.session.__scenes.state);
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

  @Action(`skip_tech_skills`)
  async onSkip(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'TECH_SKILLS_SCENE') {
      return;
    }
    ctx.session.__scenes.state.techSkills = '';
    await ctx.answerCbQuery();
    await ctx.scene.enter('TIME_PERIOD_SCENE', ctx.session.__scenes.state);
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
