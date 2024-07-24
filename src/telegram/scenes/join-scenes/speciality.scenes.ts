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

@Injectable()
@Scene('SPECIALITY_SCENE')
export class SpecialityScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('SPECIALITY_SCENE');
  }
  private startSpecialityMessageId: number;
  private choiceMessageId: number;

  private async startSpecialityMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Надайте інформацію про вашу освіту:</b>
      \n - спеціальність,
      \n - навчальний заклад,
      \n - рік випуску,
      \n - науковий ступінь (за наявності),
      \n<i> ( Наприклад:  Інженерія програмного забезпечення,  Київський національний університет імені Тараса Шевченка,  2020,  магістр )</i>`,
    );

    this.startSpecialityMessageId = startMessage.message_id;

    return startMessage;
  }

  private async choiseMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    this.choiceMessageId && (await ctx.deleteMessage(this.choiceMessageId));
    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Додана така інформація про освіту:</b>
      \n"<i>${ctx.session.__scenes.state.speciality}</i>"
      \n ( Для зміни інформації про освіту, введіть нові дані )`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_photo_load',
          ),
        ],
      ]),
    );

    this.choiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterSpecialityScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.startSpecialityMessageId &&
      (await ctx.deleteMessage(this.startSpecialityMessageId));
    await this.startSpecialityMarkup(ctx);
    // await ctx.replyWithHTML(
    //   `<b>${Emoji.question} Надайте інформацію про вашу освіту:</b>
    //   \n - спеціальність,
    //   \n - навчальний заклад,
    //   \n - рік випуску,
    //   \n - науковий ступінь (за наявності),
    //   \n<i> ( Наприклад:  Інженерія програмного забезпечення,  Київський національний університет імені Тараса Шевченка,  2020,  магістр )</i>`,
    // );
  }

  @On('text')
  async onSpeciality(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateWithoutEnterScene(
      ctx,
      'SPECIALITY_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.speciality) {
        await await ctx.scene.enter(
          'SPECIALITY_SCENE',
          ctx.session.__scenes.state,
        );
        return;
      } else {
        await this.choiseMarkup(ctx);
      }
      return;
    }

    const message = ctx.text.trim();

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.speciality = message;
    } else {
      ctx.session.__scenes.state.speciality = message;
    }

    await this.choiseMarkup(ctx);

    // await ctx.replyWithHTML(
    //   `<b>${Emoji.answer} Додана така інформація про освіту:</b>
    //   \n"<i>${ctx.session.__scenes.state.speciality}</i>"`,
    //   Markup.inlineKeyboard([
    //     [
    //       Markup.button.callback(
    //         `${Emoji.forward} Далі`,
    //         'go-forward_to_photo_load',
    //       ),
    //     ],
    //     [
    //       Markup.button.callback(
    //         `${Emoji.change} Змінити додану інформацію`,
    //         'change_speciality',
    //       ),
    //     ],
    //   ]),
    // );
  }

  @Action('go-forward_to_photo_load')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'SPECIALITY_SCENE') {
      return;
    }
    await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
  }

  // @Action('change_speciality')
  // async changeTheme(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
  //   if (ctx.scene.current.id !== 'SPECIALITY_SCENE') {
  //     return;
  //   }
  //   await ctx.scene.enter('SPECIALITY_SCENE', ctx.session.__scenes.state);
  // }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
