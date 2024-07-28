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
@Scene('FINAL_JOIN_SCENE')
export class finalJoinScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('FINAL_JOIN_SCENE');
  }
  private finalJoinStartMessageId: number;
  private finalJoinChoiceMessageId: number;

  private async finalJoinStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    let linkToFile: string;
    let linkToPhoto: string;

    const {
      fullName,
      speciality,
      documentPhotoId,
      documentFileId,
      workType,
      techSkills,
      timePeriod,
      email,
      phoneNumber,
      personalInfo,
    } = ctx.session.__scenes.state;

    if (documentFileId) {
      linkToFile = (await ctx.telegram.getFileLink(documentFileId)).href;
    }
    if (documentPhotoId) {
      linkToPhoto = (await ctx.telegram.getFileLink(documentPhotoId)).href;
    }

    const isTechSkills = techSkills ? techSkills : 'не визначено';
    const workTypeCollection = workType.join(', ');
    const isLinkToFile = linkToFile ? linkToFile : linkToPhoto;
    const isSavedFile = linkToFile ? '[зберегти файл]' : '[зберегти фото]';
    const deadlines = timePeriod.join(', ');
    const privacyPolicy = personalInfo ? 'Так' : 'Ні';

    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.alert} Ваша анкета:</b>\n\n
      <b>${Emoji.pin} Повне імʼя та вік:</b>  <i>"${fullName}"</i>\n\n
      <b>${Emoji.pin} Інформація про освіту:</b>  <i>"${speciality}"</i>\n\n
      <b>${Emoji.pin} Фото або скан-копія документа про освіту:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
      <b>${Emoji.pin} Види робіт які я можу виконувати:</b>  <i>"${workTypeCollection}"</i>\n\n
      <b>${Emoji.pin} Технічні навички:</b>  <i>"${isTechSkills}"</i>\n\n
      <b>${Emoji.time} Термін(и) виконання:</b>  <i>"${deadlines}"</i>\n\n
      <b>${Emoji.book} Електронна адреса:</b>  <i>${email}</i>\n\n
      <b>${Emoji.note} Номер телефону:</b>  <i>${phoneNumber}</i>\n\n
      <b>${Emoji.note} Ознайомлений з політикою конфіденційності:</b>  <i>${privacyPolicy}</i>\n\n
      <b>${Emoji.note} Погоджуюсь на обробку персональних даних:</b>  <i>${privacyPolicy}</i>\n\n
      `,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.send} Відправити анкету менеджеру`,
            'send_join_info',
          ),
        ],
        [Markup.button.callback(`${Emoji.restart} Restart`, 'restart')],
        [Markup.button.callback(`${Emoji.change} Відмінити`, 'break_join')],
      ]),
    );

    this.finalJoinStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async specialityChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.specialityChoiceMessageId &&
      (await ctx.deleteMessage(this.specialityChoiceMessageId));
    const message = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Додана така інформація про освіту:</b>
      \n"<i>${ctx.session.__scenes.state.speciality}</i>"
      \n${Emoji.attention} - Для зміни інформації про освіту, введіть нові дані`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_photo_load',
          ),
        ],
      ]),
    );

    this.specialityChoiceMessageId = message.message_id;

    return message;
  }

  @SceneEnter()
  async onEnterFinalJoinScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.finalJoinStartMessageId &&
      (await ctx.deleteMessage(this.finalJoinStartMessageId));
    await this.finalJoinStartMarkup(ctx);
  }

  @On('text') // !!!!!!!!!! stop here
  async onSpeciality(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateWithoutEnterScene(
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

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.speciality = message;
    } else {
      ctx.session.__scenes.state.speciality = message;
    }

    await this.specialityChoiseMarkup(ctx);
  }

  @Action('go-forward_to_photo_load')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'SPECIALITY_SCENE') {
      return;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
