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
import { CommonJoinClass, Forbidden } from './common-join.abstract';

const allowedMimeTypes = ['application/pdf', 'image/jpeg'];

enum RejectMsg {
  loadFileFailure = 'Файл не завантажено!',
  incorrectFileFormat = 'Невірний формат файла!',
  loadPhotoFailure = 'Фото не завантажено!',
}

@Injectable()
@Scene('PHOTOFILE_LOAD_SCENE')
export class PhotoFileLoadScene extends CommonJoinClass {
  constructor() {
    super('PHOTOFILE_LOAD_SCENE');
  }
  private loadedFileName: string;
  private loadedPhotoId: string;
  private photofileLoadStartMessageId: number;
  private photofileLoadChoiceMessageId: number;
  private incorrectFormatMessageId: number;
  private loadFileFailureMessageId: number;
  private loadPhotoFailureMessageId: number;
  protected commandForbiddenMessageId: number;

  private async photofileLoadStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Прикріпіть фото або скан-копію документа, що засвідчує вашу освіту.</b>
      \n${Emoji.attention} Увага! Файли для завантаження мають бути наступного формату:
      \n    - .pdf,
      \n    - .jpg`,
    );

    this.photofileLoadStartMessageId = startMessage.message_id;

    return startMessage;
  }
  private async photofileLoadChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    fileName: string,
    photoId: string,
  ) {
    await this.deleteMessage(ctx, this.photofileLoadChoiceMessageId);

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

      this.photofileLoadChoiceMessageId = fileChoiceMessage.message_id;

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

      this.photofileLoadChoiceMessageId = photoChoiceMessage.message_id;

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
      await this.deleteMessage(ctx, this.incorrectFormatMessageId);

      const incorrectFormatMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.incorrectFormatMessageId = incorrectFormatMessage.message_id;

      return incorrectFormatMessage;
    }

    if (command === 'load') {
      await this.deleteMessage(ctx, this.loadFileFailureMessageId);

      const loadFileFailureMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.loadFileFailureMessageId = loadFileFailureMessage.message_id;

      return loadFileFailureMessage;
    }

    if (command === 'load-photo') {
      await this.deleteMessage(ctx, this.loadPhotoFailureMessageId);

      const loadPhotoFailureMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.loadPhotoFailureMessageId = loadPhotoFailureMessage.message_id;

      return loadPhotoFailureMessage;
    }

    return await ctx.replyWithHTML(`<b>${Emoji.reject}</b>`);
  }

  @SceneEnter()
  async onEnterPhotoFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, this.photofileLoadStartMessageId);

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
        await this.photofileLoadChoiseMarkup(ctx, this.loadedFileName, '');
        return;
      } else if (ctx.session.__scenes.state.documentPhotoId) {
        await this.photofileLoadChoiseMarkup(ctx, '', this.loadedPhotoId);
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

  @On('document')
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

    this.loadedFileName = fileName;

    await this.photofileLoadChoiseMarkup(ctx, fileName, '');

    return;
  }

  @On('photo')
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

    this.loadedPhotoId = smallestPhotoId;

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

    await this.deleteMessage(ctx, this.incorrectFormatMessageId);
    await this.deleteMessage(ctx, this.loadPhotoFailureMessageId);
    await this.deleteMessage(ctx, this.loadFileFailureMessageId);
    await this.deleteMessage(ctx, this.commandForbiddenMessageId);

    return;
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

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
