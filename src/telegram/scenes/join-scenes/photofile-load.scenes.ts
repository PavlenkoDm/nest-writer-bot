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
import { Message } from 'telegraf/typings/core/types/typegram';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonJoinClass, Forbidden, JoinMsg } from './common-join.abstract';

const allowedMimeTypes = ['application/pdf', 'image/jpeg'];

enum RejectMsg {
  loadFileFailure = 'Файл не завантажено!',
  incorrectFileFormat = 'Невірний формат файла!',
  loadPhotoFailure = 'Фото не завантажено!',
}

enum JoinPhotoFMsg {
  photofileLoadStartMessageId = 'photofileLoadStartMessageId',
  photofileLoadChoiceMessageId = 'photofileLoadChoiceMessageId',
  incorrectFormatMessageId = 'incorrectFormatMessageId',
  loadFileFailureMessageId = 'loadFileFailureMessageId',
  loadPhotoFailureMessageId = 'loadPhotoFailureMessageId',
}

@Injectable()
@Scene('PHOTOFILE_LOAD_SCENE')
export class PhotoFileLoadScene extends CommonJoinClass {
  constructor() {
    super('PHOTOFILE_LOAD_SCENE');
  }

  private async photofileLoadStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Прикріпіть фото або скан-копію документа, що засвідчує вашу освіту.</b>
      \n${Emoji.attention} Увага! Файли для завантаження мають бути наступного формату:
      \n    - .pdf,
      \n    - .jpg`,
    );

    this.setterForJoinMap(
      ctx,
      JoinPhotoFMsg.photofileLoadStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async photofileLoadChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    fileName: string,
    photoId: string,
  ) {
    await this.deleteMessage(ctx, JoinPhotoFMsg.photofileLoadChoiceMessageId);

    if (fileName) {
      const fileChoiceMessage = await ctx.replyWithHTML(
        `<b>${Emoji.answer} Завантажений файл:</b>  "<i>${fileName}</i>"
        \n${Emoji.attention} - Для зміни - прикріпіть новий файл.`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              `${Emoji.forward} Далі`,
              `go-forward_to_work_type`,
            ),
          ],
        ]),
      );
      this.setterForJoinMap(
        ctx,
        JoinPhotoFMsg.photofileLoadChoiceMessageId,
        fileChoiceMessage.message_id,
      );

      return fileChoiceMessage;
    }

    if (photoId) {
      const photoChoiceMessage = await ctx.replyWithPhoto(photoId, {
        caption: `${Emoji.answer} Ви завантажили таке фото... ${Emoji.arrowTop}
        \n${Emoji.attention} - Для зміни - прикріпіть нове фото.`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${Emoji.forward} Далі`,
                callback_data: `go-forward_to_work_type`,
              },
            ],
          ],
        },
      });

      this.setterForJoinMap(
        ctx,
        JoinPhotoFMsg.photofileLoadChoiceMessageId,
        photoChoiceMessage.message_id,
      );

      return photoChoiceMessage;
    }
    return null;
  }

  private async incorrectFormatLoadFailureMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    msg: string,
    command: string,
  ) {
    if (command === 'format') {
      await this.deleteMessage(ctx, JoinPhotoFMsg.incorrectFormatMessageId);

      const incorrectFormatMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.setterForJoinMap(
        ctx,
        JoinPhotoFMsg.incorrectFormatMessageId,
        incorrectFormatMessage.message_id,
      );

      return incorrectFormatMessage;
    }

    if (command === 'load') {
      await this.deleteMessage(ctx, JoinPhotoFMsg.loadFileFailureMessageId);

      const loadFileFailureMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );
      this.setterForJoinMap(
        ctx,
        JoinPhotoFMsg.loadFileFailureMessageId,
        loadFileFailureMessage.message_id,
      );

      return loadFileFailureMessage;
    }

    if (command === 'load-photo') {
      await this.deleteMessage(ctx, JoinPhotoFMsg.loadPhotoFailureMessageId);

      const loadPhotoFailureMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );
      this.setterForJoinMap(
        ctx,
        JoinPhotoFMsg.loadPhotoFailureMessageId,
        loadPhotoFailureMessage.message_id,
      );

      return loadPhotoFailureMessage;
    }

    return await ctx.replyWithHTML(`<b>${Emoji.reject}</b>`);
  }

  @SceneEnter()
  async onEnterPhotoFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, JoinPhotoFMsg.photofileLoadStartMessageId);

    await this.photofileLoadStartMarkup(ctx);

    return;
  }

  @On('text')
  async onEnterTextInFileLoad(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'PHOTOFILE_LOAD_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (ctx.session.__scenes.state.documentFileId) {
        await this.photofileLoadChoiseMarkup(
          ctx,
          ctx.session.__scenes.state.loadedFileName,
          '',
        );
        return;
      } else if (ctx.session.__scenes.state.documentPhotoId) {
        await this.photofileLoadChoiseMarkup(
          ctx,
          '',
          ctx.session.__scenes.state.loadedPhotoId,
        );
        return;
      } else {
        await ctx.scene.enter(
          'PHOTOFILE_LOAD_SCENE',
          ctx.session.__scenes.state,
        );
        return;
      }
    }
  }

  @On('document') // to complete
  async onFileLoad(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (
      !ctx.scene.current.id ||
      ctx.scene.current.id !== 'PHOTOFILE_LOAD_SCENE'
    ) {
      return;
    }

    const message = ctx.message as Message.DocumentMessage;

    const {
      file_id: fileId,
      mime_type: mimeType,
      file_name: fileName,
    } = message.document;

    if (!fileId) {
      await this.incorrectFormatLoadFailureMarkup(
        ctx,
        RejectMsg.loadFileFailure,
        'load',
      );
      await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);

      return;
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      await this.incorrectFormatLoadFailureMarkup(
        ctx,
        RejectMsg.incorrectFileFormat,
        'format',
      );
      await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!ctx.session.__scenes.state.documentFileId) {
      ctx.session.__scenes.state.documentFileId = fileId;
    } else {
      ctx.session.__scenes.state.documentFileId = fileId;
    }

    if (ctx.session.__scenes.state.documentPhotoId) {
      ctx.session.__scenes.state.documentPhotoId = '';
    }

    if (!ctx.session.__scenes.state.loadedFileName) {
      ctx.session.__scenes.state.loadedFileName = fileName;
    } else {
      ctx.session.__scenes.state.loadedFileName = fileName;
    }

    await this.photofileLoadChoiseMarkup(ctx, fileName, '');

    return;
  }

  @On('photo') // to complete
  async onPhotoLoad(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (
      !ctx.scene.current.id ||
      ctx.scene.current.id !== 'PHOTOFILE_LOAD_SCENE'
    ) {
      return;
    }
    const message = ctx.message as Message.PhotoMessage;

    const photos = message.photo;
    const lagestPhoto = photos[photos.length - 1];
    const { file_id: largePhotoId } = lagestPhoto;
    const smallestPhoto = photos[0];
    const { file_id: smallestPhotoId } = smallestPhoto;

    if (!largePhotoId) {
      await this.incorrectFormatLoadFailureMarkup(
        ctx,
        RejectMsg.loadPhotoFailure,
        'load-photo',
      );
      await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);

      return;
    }

    if (!ctx.session.__scenes.state.documentPhotoId) {
      ctx.session.__scenes.state.documentPhotoId = largePhotoId;
    } else {
      ctx.session.__scenes.state.documentPhotoId = largePhotoId;
    }

    if (ctx.session.__scenes.state.documentFileId) {
      ctx.session.__scenes.state.documentFileId = '';
    }

    if (!ctx.session.__scenes.state.loadedPhotoId) {
      ctx.session.__scenes.state.loadedPhotoId = smallestPhotoId;
    } else {
      ctx.session.__scenes.state.loadedPhotoId = smallestPhotoId;
    }

    await this.photofileLoadChoiseMarkup(ctx, '', smallestPhotoId);

    return;
  }

  @Action(`go-forward_to_work_type`)
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'PHOTOFILE_LOAD_SCENE') {
      return;
    }

    if (
      !ctx.session.__scenes.state.documentFileId &&
      !ctx.session.__scenes.state.documentPhotoId
    ) {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('WORK_TYPE_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, JoinPhotoFMsg.incorrectFormatMessageId);
    await this.deleteMessage(ctx, JoinPhotoFMsg.loadPhotoFailureMessageId);
    await this.deleteMessage(ctx, JoinPhotoFMsg.loadFileFailureMessageId);
    await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }

  // @Action('skip_photofile_load')
  // async onSkip(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
  //   if (ctx.scene.current.id !== 'PHOTOFILE_LOAD_SCENE') {
  //     return;
  //   }
  //   ctx.session.__scenes.state.documentPhotoId = '';
  //   ctx.session.__scenes.state.documentFileId = '';
  //   await ctx.answerCbQuery();
  //   await ctx.scene.enter('WORK_TYPE_SCENE', ctx.session.__scenes.state);
  // }
}
