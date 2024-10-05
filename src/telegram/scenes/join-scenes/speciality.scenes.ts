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
import { StringLength } from '../common-enums.scenes/strlength.enum';

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
    await this.deleteMessage(ctx, this.specialityChoiceMessageId);

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
    await this.deleteMessage(ctx, this.specialityStartMessageId);

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

    const msg = ctx.text.trim();

    const message = this.modifyMessageLength(msg, StringLength.medium);

    dangerRegexp.lastIndex = 0;
    if (dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, this.alertMessageId);

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

    await this.deleteMessage(ctx, this.alertMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
