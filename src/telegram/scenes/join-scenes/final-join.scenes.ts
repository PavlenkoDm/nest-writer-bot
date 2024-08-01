import { Inject, Injectable } from '@nestjs/common';
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
import { ConfigService } from '@nestjs/config';

@Injectable()
@Scene('FINAL_JOIN_SCENE')
export class FinalJoinScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super('FINAL_JOIN_SCENE');
    this.chatId = configService.get('MANAGER_ID');
  }
  private readonly chatId: number;
  private finalJoinStartMessageId: number;

  private async commonFinalJoinMarkup(
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

    const startMessage = `<b>${Emoji.pin} Повне імʼя та вік:</b>  <i>"${fullName}"</i>\n\n
      <b>${Emoji.pin} Інформація про освіту:</b>  <i>"${speciality}"</i>\n\n
      <b>${Emoji.pin} Фото або скан-копія документа про освіту:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
      <b>${Emoji.pin} Види робіт, які я можу виконувати:</b>  <i>"${workTypeCollection}"</i>\n\n
      <b>${Emoji.pin} Технічні навички:</b>  <i>"${isTechSkills}"</i>\n\n
      <b>${Emoji.time} Термін(и) виконання:</b>  <i>"${deadlines}"</i>\n\n
      <b>${Emoji.email} Електронна адреса:</b>  <i>${email}</i>\n\n
      <b>${Emoji.telephone} Номер телефону:</b>  <i>${phoneNumber}</i>\n\n
      <b>${Emoji.note} Ознайомлений з політикою конфіденційності:</b>  <i>${privacyPolicy}</i>\n\n
      <b>${Emoji.note} Погоджуюсь на обробку персональних даних:</b>  <i>${privacyPolicy}</i>
      `;

    return startMessage;
  }

  private async initialFinalJoinStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const commonMarkup = await this.commonFinalJoinMarkup(ctx);
    const initialFinalJoinMessage = await ctx.replyWithHTML(
      `<b>${Emoji.alert} Ваша анкета:</b>\n\n
      ${commonMarkup}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.send} Відправити анкету менеджеру`,
            `send_join_info`,
          ),
        ],
        [Markup.button.callback(`${Emoji.restart} Restart`, `restart_join`)],
        [Markup.button.callback(`${Emoji.change} Відмінити`, `break_join`)],
      ]),
    );

    this.finalJoinStartMessageId = initialFinalJoinMessage.message_id;

    return initialFinalJoinMessage;
  }

  private async messageToSend(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const commonMarkup = await this.commonFinalJoinMarkup(ctx);
    const message = `
    <b>Замовлення від:</b>  <i>@${ctx.from.username}</i>\n\n
    ${commonMarkup}
    `;

    return message;
  }

  @SceneEnter()
  async onEnterFinalJoinScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    this.finalJoinStartMessageId &&
      (await ctx.deleteMessage(this.finalJoinStartMessageId));

    await this.initialFinalJoinStartMarkup(ctx);
  }

  @On('text')
  async onFinalJoin(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'FINAL_JOIN_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }
  }

  @Action(`send_join_info`)
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_JOIN_SCENE') {
      return;
    }
    const message = await this.messageToSend(ctx);
    await ctx.answerCbQuery();
    await ctx.telegram.sendMessage(this.chatId, message, {
      parse_mode: 'HTML',
    });
    await ctx.replyWithHTML(
      `<b>${Emoji.answer} Дякуємо за надану інформацію!</b>
      \n${Emoji.time} Чекайте на зв’язок з менеджером`,
    );
    await ctx.scene.leave();
  }

  @Action(`restart_join`)
  async onRestart(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_JOIN_SCENE') {
      return;
    }
    ctx.session.__scenes.state = {};
    ctx.session.__scenes.state.isJoinScenario = true;
    await ctx.answerCbQuery();
    await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
    return;
  }

  @Action(`break_join`)
  async onBreakJoin(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_JOIN_SCENE') {
      return;
    }
    ctx.session.__scenes.state = {};
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.sad} На жаль, процедура приєднання до команди виконавців була відмінена</b>
      \n${Emoji.wink} Але... Якщо захочете пройти опитування знову - тисніть /start_join`,
      {
        parse_mode: 'HTML',
      },
    );
    await ctx.scene.leave();
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
