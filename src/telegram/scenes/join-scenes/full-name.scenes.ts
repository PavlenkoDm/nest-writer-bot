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
import { dangerRegexp } from '../helpers-scenes/regexps.helper';
import { onCreateAlertMessage } from '../helpers-scenes/alert-message.helper';

@Injectable()
@Scene('FULL_NAME_SCENE')
export class FullNameScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('FULL_NAME_SCENE');
  }

  private fullNameStartMessageId: number;
  private fullNameChoiceMessageId: number;
  private alertMessageId: number;

  private async fullNameStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть ваше повне імʼя та вік.</b>
      \n<i> ( Наприклад:  Іванов  Іван  Іванович,  25 )</i>`,
    );

    this.fullNameStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async fullNameChoiceMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.fullNameChoiceMessageId &&
      (await ctx.deleteMessage(this.fullNameChoiceMessageId));

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Додані повне імʼя та вік:</b>
      \n"<i>${ctx.session.__scenes.state.fullName}</i>"
      \n${Emoji.attention} - Для зміни доданої інформації, введіть нові дані`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            `go-forward_to_speciality`,
          ),
        ],
      ]),
    );

    this.fullNameChoiceMessageId = choiceMessage.message_id;
    return choiceMessage;
  }

  @SceneEnter()
  async onEnterFullNameScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    this.fullNameStartMessageId &&
      (await ctx.deleteMessage(this.fullNameStartMessageId));
    await this.fullNameStartMarkup(ctx);
    return;
  }

  @On('text')
  async onFullName(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateWithoutEnterScene(
      ctx,
      'FULL_NAME_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (ctx.session.__scenes.state.fullName) {
        await this.fullNameChoiceMarkup(ctx);
        return;
      } else {
        await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
        return;
      }
    }

    const message = ctx.text.trim();

    if (dangerRegexp.test(message)) {
      console.log('!!!!!!!!!');
      this.alertMessageId && (await ctx.deleteMessage(this.alertMessageId));
      await onCreateAlertMessage(ctx, this.alertMessageId);
      // await ctx.replyWithHTML(
      //   `<b>${Emoji.reject} Ви ввели некоректне значення</b>`,
      // );

      if (!ctx.session.__scenes.state.fullName) {
        await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.fullNameChoiceMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.fullName = message;
    } else {
      ctx.session.__scenes.state.fullName = message;
    }

    await this.fullNameChoiceMarkup(ctx);
    return;
  }

  @Action(`go-forward_to_speciality`)
  async goToSpecialityForward(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (
      ctx.scene.current.id !== 'FULL_NAME_SCENE' ||
      !ctx.session.__scenes.state.fullName
    ) {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('SPECIALITY_SCENE', ctx.session.__scenes.state);
    this.fullNameStartMessageId &&
      (await ctx.deleteMessage(this.fullNameStartMessageId));
    this.fullNameChoiceMessageId &&
      (await ctx.deleteMessage(this.fullNameChoiceMessageId));
    return;
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
    return;
  }
}
