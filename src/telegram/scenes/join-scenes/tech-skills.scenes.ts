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
@Scene('TECH_SKILLS_SCENE')
export class TechSkillsScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('TECH_SKILLS_SCENE');
  }

  @SceneEnter()
  async onEnterTechSkillsScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Вкажіть програми (мови програмування, фреймворки) з якими ви працюєте і які стосуються вашої технічної спеціальності:</b>
      \n<i> ( Наприклад:  AutoCAD,  MATLAB,  SolidWorks,  JavaScript,  React )</i>
      \n${Emoji.attention} Пропускайте даний пункт якщо у вас не технічна спеціальність.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.skip} Пропустити`, 'skip_tech_skills'),
      ]),
    );
  }

  @On('text')
  async onTechSkills(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'TECH_SKILLS_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }

    const message = ctx.text.trim();

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.techSkills = message;
    } else {
      ctx.session.__scenes.state.techSkills = message;
    }

    ctx.replyWithHTML(
      `<b>${Emoji.answer} Ви працюєте з такими програмами (мовами програмування, фреймворками):</b>
      \n"<i>${ctx.session.__scenes.state.techSkills}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_time_period',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити додану інформацію`,
            'change_tech_skills',
          ),
        ],
      ]),
    );
  }

  @Action('go-forward_to_time_period')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'TECH_SKILLS_SCENE') {
      return;
    }
    await ctx.scene.enter('TIME_PERIOD_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_tech_skills')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'TECH_SKILLS_SCENE') {
      return;
    }
    await ctx.scene.enter('TECH_SKILLS_SCENE', ctx.session.__scenes.state);
  }

  @Action('skip_tech_skills')
  async onSkip(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'TECH_SKILLS_SCENE') {
      return;
    }
    ctx.session.__scenes.state.techSkills = '';
    await ctx.scene.enter('TIME_PERIOD_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
