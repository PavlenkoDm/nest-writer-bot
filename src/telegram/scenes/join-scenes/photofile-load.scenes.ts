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
  protected commandForbiddenMessageId: number;

  private async photofileLoadStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Прикріпіть фото або скан-копію документа, що засвідчує вашу освіту.</b>
      \n${Emoji.attention} Увага! Файли для завантаження мають бути наступного формату:
      \n    - .pdf,
      \n    - .jpg`,
      // Markup.inlineKeyboard([
      //   Markup.button.callback(
      //     `${Emoji.skip} Пропустити`,
      //     'skip_photofile_load',
      //   ),
      // ]),
    );

    this.photofileLoadStartMessageId = startMessage.message_id;

    return startMessage;
  }
  private async photofileLoadChoiseMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    fileName: string,
    photoId: string,
  ) {
    if (this.photofileLoadChoiceMessageId) {
      await ctx.deleteMessage(this.photofileLoadChoiceMessageId);
      this.photofileLoadChoiceMessageId = 0;
    }

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

  @SceneEnter()
  async onEnterPhotoFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.photofileLoadStartMessageId) {
      await ctx.deleteMessage(this.photofileLoadStartMessageId);
      this.photofileLoadStartMessageId = 0;
    }
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
      await ctx.replyWithHTML(`<b>${Emoji.reject} Файл не завантажено!</b>`);
      await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      await ctx.replyWithHTML(`<b>${Emoji.reject} Невірний формат файла!</b>`);
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
      await ctx.replyWithHTML(`<b>${Emoji.reject} Фото не завантажено!</b>`);
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
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
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
