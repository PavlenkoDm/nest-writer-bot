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
@Scene('SPECIALITY_SCENE')
export class SpecialityScene extends CommonJoinClass {
  constructor() {
    super('SPECIALITY_SCENE');
  }
  private specialityStartMessageId: number;
  private specialityChoiceMessageId: number;
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;

  private async specialityStartMarkup(
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

    this.specialityStartMessageId = startMessage.message_id;

    return startMessage;
  }
  private async specialityChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.specialityChoiceMessageId) {
      await ctx.deleteMessage(this.specialityChoiceMessageId);
      this.specialityChoiceMessageId = 0;
    }

    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Додана така інформація про освіту:</b>
      \n"<i>${ctx.session.__scenes.state.speciality}</i>"
      \n${Emoji.attention} - Для зміни інформації про освіту введіть нові дані.`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            `go-forward_to_photo_load`,
          ),
        ],
      ]),
    );

    this.specialityChoiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterSpecialityScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.specialityStartMessageId) {
      await ctx.deleteMessage(this.specialityStartMessageId);
      this.specialityStartMessageId = 0;
    }
    await this.specialityStartMarkup(ctx);
    return;
  }

  @On('text')
  async onSpeciality(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'SPECIALITY_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (ctx.session.__scenes.state.speciality) {
        await this.specialityChoiseMarkup(ctx);
        return;
      } else {
        await await ctx.scene.enter(
          'SPECIALITY_SCENE',
          ctx.session.__scenes.state,
        );
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

      if (!ctx.session.__scenes.state.speciality) {
        await ctx.scene.enter('SPECIALITY_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.specialityChoiseMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.speciality = message;
    } else {
      ctx.session.__scenes.state.speciality = message;
    }

    await this.specialityChoiseMarkup(ctx);
    return;
  }

  @Action(`go-forward_to_photo_load`)
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (
      ctx.scene.current.id !== 'SPECIALITY_SCENE' ||
      !ctx.session.__scenes.state.speciality
    ) {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
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
