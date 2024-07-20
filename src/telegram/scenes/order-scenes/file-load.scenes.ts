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
import { IOrderSceneState } from './order.config';
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';
import { Message } from 'telegraf/typings/core/types/typegram';
import { Emoji } from 'src/telegram/emoji/emoji';

const allowedMimeTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'text/plain',
];

@Injectable()
@Scene('FILE_LOAD_SCENE')
export class FileLoadScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('FILE_LOAD_SCENE');
  }

  @SceneEnter()
  async onEnterFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Завантажте методичні матеріали по темі</b> <i> (Опціональна дія)</i>
      \n${Emoji.attention} Файли для завантаження мають бути формата:\n    - .doc,\n    - .docx,\n    - .xls,\n    - .xlsx,\n    - .pdf,\n   - .txt`,
      Markup.inlineKeyboard([[Markup.button.callback('Пропустити', 'skip')]]),
    );
  }

  @On('text')
  async onEnterTextInFileLoad(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'FILE_LOAD_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }
  }

  @On('document')
  async onFileLoad(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (!ctx.scene.current.id || ctx.scene.current.id !== 'FILE_LOAD_SCENE') {
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
      await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      await ctx.replyWithHTML(`<b>${Emoji.reject} Невірний формат файла!</b>`);
      await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!ctx.session.__scenes.state.fileId) {
      ctx.session.__scenes.state.fileId = fileId;
    } else {
      ctx.session.__scenes.state.fileId = fileId;
    }

    await ctx.replyWithHTML(
      `<b>${Emoji.answer} Завантажений файл:</b>  "<i>${fileName}</i>"`,
      Markup.inlineKeyboard([
        [Markup.button.callback(`${Emoji.forward} Далі`, 'go-forward')],
        [
          Markup.button.callback(
            `${Emoji.change} Завантажити інший файл`,
            'change_file',
          ),
        ],
      ]),
    );
  }

  @Action('skip')
  async goSkip(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.session.__scenes.state.fileId = '';
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_file')
  async changeFile(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
