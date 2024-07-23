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
import { Message } from 'telegraf/typings/core/types/typegram';
import { Emoji } from 'src/telegram/emoji/emoji';

const allowedMimeTypes = ['application/pdf', 'image/jpeg'];

@Injectable()
@Scene('PHOTOFILE_LOAD_SCENE')
export class PhotoFileLoadScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('PHOTOFILE_LOAD_SCENE');
  }

  @SceneEnter()
  async onEnterPhotoFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Прикріпіть фото або скан-копію документа, що засвідчує вашу освіту</b>
      \n${Emoji.attention} Файли для завантаження мають бути формата:\n    - .pdf,\n    - .jpg`,
    );
  }

  @On('text')
  async onEnterTextInFileLoad(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'PHOTOFILE_LOAD_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
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
      // file_unique_id: fileUniqueId,
      // file_size: fileSize,
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

    await ctx.replyWithHTML(
      `<b>${Emoji.answer} Завантажений файл:</b>  "<i>${fileName}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_work_type',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Завантажити інший файл`,
            'change_file',
          ),
        ],
      ]),
    );
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
    const { file_id } = lagestPhoto;

    if (!file_id) {
      await ctx.replyWithHTML(`<b>${Emoji.reject} Фото не завантажено!</b>`);
      await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!ctx.session.__scenes.state.documentPhotoId) {
      ctx.session.__scenes.state.documentPhotoId = file_id;
    } else {
      ctx.session.__scenes.state.documentPhotoId = file_id;
    }
    await ctx.replyWithPhoto(file_id, {
      caption: `${Emoji.answer} Завантажене фото`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${Emoji.forward} Далі`,
              callback_data: 'go-forward_to_work_type',
            },
          ],
        ],
      },
    });
    // await ctx.replyWithHTML(
    //   `<b>${Emoji.answer} Фото завантажено</b>`,
    //   Markup.inlineKeyboard([
    //     [
    //       Markup.button.callback(
    //         `${Emoji.forward} Далі`,
    //         'go-forward_to_work_type',
    //       ),
    //     ],
    //     [
    //       Markup.button.callback(
    //         `${Emoji.change} Завантажити інше фото`,
    //         'change_file',
    //       ),
    //     ],
    //   ]),
    // );
  }

  @Action('go-forward_to_work_type')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'PHOTOFILE_LOAD_SCENE') {
      return;
    }
    await ctx.scene.enter('WORK_TYPE_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_file')
  async changeFile(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'PHOTOFILE_LOAD_SCENE') {
      return;
    }
    await ctx.scene.enter('PHOTOFILE_LOAD_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
