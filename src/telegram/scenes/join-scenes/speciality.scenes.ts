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
@Scene('SPECIALITY_SCENE')
export class SpecialityScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('SPECIALITY_SCENE');
  }

  @SceneEnter()
  async onEnterSpecialityScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Надайте інформацію про вашу освіту:</b>
      \n - спеціальність,
      \n - навчальний заклад,
      \n - рік випуску,
      \n - науковий ступінь (за наявності),
      \n<i> ( Наприклад:  Інженерія програмного забезпечення,  Київський національний університет імені Тараса Шевченка,  2020,  магістр )</i>`,
    );
  }

  @On('text')
  async onSpeciality(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'SPECIALITY_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }

    const message = ctx.text.trim();

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.speciality = message;
    } else {
      ctx.session.__scenes.state.speciality = message;
    }

    ctx.replyWithHTML(
      `<b>${Emoji.answer} Додана така інформація:</b>
      \n"<i>${ctx.session.__scenes.state.speciality}</i>"`,
      Markup.inlineKeyboard([
        [Markup.button.callback(`${Emoji.forward} Далі`, 'go-forward')],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити додану інформацію`,
            'change_speciality',
          ),
        ],
      ]),
    );
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_speciality')
  async changeTheme(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await ctx.scene.enter('SPECIALITY_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
