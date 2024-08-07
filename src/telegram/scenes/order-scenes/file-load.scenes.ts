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
import { Message } from 'telegraf/typings/core/types/typegram';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';

const allowedMimeTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'text/plain',
];

enum RejectMsg {
  loadFileFailure = 'Файл не завантажено!',
  incorrectFileFormat = 'Невірний формат файла!',
}

@Injectable()
@Scene('FILE_LOAD_SCENE')
export class FileLoadScene extends CommonOrderClass {
  constructor() {
    super('FILE_LOAD_SCENE');
  }

  private fileLoadStartMessageId: number;
  private fileLoadChoiceMessageId: number;
  private incorrectFormatMessageId: number;
  private loadFileFailureMessageId: number;
  protected commandForbiddenMessageId: number;

  private fileName: string;

  private async fileLoadStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Завантажте методичні матеріали по темі</b> <i> (Опціональна дія)</i>
      \n${Emoji.attention} Файли для завантаження мають бути формата:
      \n    - .doc,
      \n    - .docx,
      \n    - .xls,
      \n    - .xlsx,
      \n    - .pdf,
      \n    - .txt`,
      Markup.inlineKeyboard([
        [Markup.button.callback('Пропустити', 'skip_file_load')],
      ]),
    );

    this.fileLoadStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async fileLoadChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    fileName: string,
  ) {
    if (this.fileLoadChoiceMessageId) {
      await ctx.deleteMessage(this.fileLoadChoiceMessageId);
      this.fileLoadChoiceMessageId = 0;
    }

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Завантажений файл:</b>  "<i>${fileName}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_comment',
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

    this.fileLoadChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  private async incorrectFormatLoadFailureMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msg: string,
    command: string,
  ) {
    if (command === 'format') {
      if (this.incorrectFormatMessageId) {
        await ctx.deleteMessage(this.incorrectFormatMessageId);
        this.incorrectFormatMessageId = 0;
      }

      const incorrectFormatMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.incorrectFormatMessageId = incorrectFormatMessage.message_id;
      return incorrectFormatMessage;
    }
    if (command === 'load') {
      if (this.loadFileFailureMessageId) {
        await ctx.deleteMessage(this.loadFileFailureMessageId);
        this.loadFileFailureMessageId = 0;
      }

      const loadFileFailureMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.loadFileFailureMessageId = loadFileFailureMessage.message_id;
      return loadFileFailureMessage;
    }

    return await ctx.replyWithHTML(`<b>${Emoji.reject}</b>`);
  }

  @SceneEnter()
  async onEnterFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.fileLoadStartMessageId) {
      await ctx.deleteMessage(this.fileLoadStartMessageId);
      this.fileLoadStartMessageId = 0;
    }
    await this.fileLoadStartMarkup(ctx);
    return;
  }

  @On('text')
  async onEnterTextInFileLoad(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'FILE_LOAD_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.fileId) {
        await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.fileLoadChoiceMarkup(ctx, this.fileName);
        return;
      }
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
      await this.incorrectFormatLoadFailureMarkup(
        ctx,
        RejectMsg.loadFileFailure,
        'load',
      );
      await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      await this.incorrectFormatLoadFailureMarkup(
        ctx,
        RejectMsg.incorrectFileFormat,
        'format',
      );
      await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
      return;
    }

    if (!ctx.session.__scenes.state.fileId) {
      ctx.session.__scenes.state.fileId = fileId;
    } else {
      ctx.session.__scenes.state.fileId = fileId;
    }

    if (fileName) {
      this.fileName = fileName;
    }

    await this.fileLoadChoiceMarkup(ctx, fileName);
    return;
  }

  @Action('skip_file_load')
  async goSkip(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FILE_LOAD_SCENE') {
      return;
    }
    ctx.session.__scenes.state.fileId = '';

    await ctx.answerCbQuery();
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);

    if (this.fileLoadStartMessageId) {
      await ctx.deleteMessage(this.fileLoadStartMessageId);
      this.fileLoadStartMessageId = 0;
    }
    if (this.fileLoadChoiceMessageId) {
      await ctx.deleteMessage(this.fileLoadChoiceMessageId);
      this.fileLoadChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.incorrectFormatMessageId) {
      await ctx.deleteMessage(this.incorrectFormatMessageId);
      this.incorrectFormatMessageId = 0;
    }
    if (this.loadFileFailureMessageId) {
      await ctx.deleteMessage(this.loadFileFailureMessageId);
      this.loadFileFailureMessageId = 0;
    }
    return;
  }

  @Action('go-forward_to_comment')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FILE_LOAD_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);

    if (this.fileLoadStartMessageId) {
      await ctx.deleteMessage(this.fileLoadStartMessageId);
      this.fileLoadStartMessageId = 0;
    }
    if (this.fileLoadChoiceMessageId) {
      await ctx.deleteMessage(this.fileLoadChoiceMessageId);
      this.fileLoadChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.incorrectFormatMessageId) {
      await ctx.deleteMessage(this.incorrectFormatMessageId);
      this.incorrectFormatMessageId = 0;
    }
    if (this.loadFileFailureMessageId) {
      await ctx.deleteMessage(this.loadFileFailureMessageId);
      this.loadFileFailureMessageId = 0;
    }

    return;
  }

  @Action('change_file')
  async changeFile(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FILE_LOAD_SCENE') {
      return;
    }
    ctx.session.__scenes.state.fileId = '';
    await ctx.answerCbQuery();
    await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);

    if (this.fileLoadChoiceMessageId) {
      await ctx.deleteMessage(this.fileLoadChoiceMessageId);
      this.fileLoadChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.incorrectFormatMessageId) {
      await ctx.deleteMessage(this.incorrectFormatMessageId);
      this.incorrectFormatMessageId = 0;
    }
    if (this.loadFileFailureMessageId) {
      await ctx.deleteMessage(this.loadFileFailureMessageId);
      this.loadFileFailureMessageId = 0;
    }
    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
