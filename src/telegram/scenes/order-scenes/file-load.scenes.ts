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
import { CommonOrderClass, Forbidden, OrderMsg } from './common-order.abstract';

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

enum OrderFLMsg {
  fileLoadStartMessageId = 'fileLoadStartMessageId',
  fileLoadChoiceMessageId = 'fileLoadChoiceMessageId',
  incorrectFormatMessageId = 'incorrectFormatMessageId',
  loadFileFailureMessageId = 'loadFileFailureMessageId',
}

@Injectable()
@Scene('FILE_LOAD_SCENE')
export class FileLoadScene extends CommonOrderClass {
  constructor() {
    super('FILE_LOAD_SCENE');
  }

  private async fileLoadStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Завантажте методичні матеріали по темі.</b><i> (Опціональна дія)</i>
      \n${Emoji.attention} Файли для завантаження мають бути формата:
      \n    - .doc,
      \n    - .docx,
      \n    - .xls,
      \n    - .xlsx,
      \n    - .pdf,
      \n    - .txt`,
      Markup.inlineKeyboard([
        [Markup.button.callback(`${Emoji.skip} Пропустити`, 'skip_file_load')],
      ]),
    );

    this.setterForOrderMap(
      ctx,
      OrderFLMsg.fileLoadStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async fileLoadChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    fileName: string,
  ) {
    await this.deleteMessage(ctx, OrderFLMsg.fileLoadChoiceMessageId);

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

    this.setterForOrderMap(
      ctx,
      OrderFLMsg.fileLoadChoiceMessageId,
      choiceMessage.message_id,
    );

    return choiceMessage;
  }

  private async incorrectFormatLoadFailureMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msg: string,
    command: string,
  ) {
    if (command === 'format') {
      await this.deleteMessage(ctx, OrderFLMsg.incorrectFormatMessageId);

      const incorrectFormatMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.setterForOrderMap(
        ctx,
        OrderFLMsg.incorrectFormatMessageId,
        incorrectFormatMessage.message_id,
      );

      return incorrectFormatMessage;
    }
    if (command === 'load') {
      await this.deleteMessage(ctx, OrderFLMsg.loadFileFailureMessageId);

      const loadFileFailureMessage = await ctx.replyWithHTML(
        `<b>${Emoji.reject} ${msg}</b>`,
      );

      this.setterForOrderMap(
        ctx,
        OrderFLMsg.loadFileFailureMessageId,
        loadFileFailureMessage.message_id,
      );

      return loadFileFailureMessage;
    }

    return await ctx.replyWithHTML(`<b>${Emoji.reject}</b>`);
  }

  @SceneEnter()
  async onEnterFileLoadScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, OrderFLMsg.fileLoadStartMessageId);

    await this.fileLoadStartMarkup(ctx);

    return;
  }

  @On('text')
  async onEnterTextInFileLoad(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    this.setterForOrderMap(ctx, OrderMsg.userMessageId, ctx.message.message_id);

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'FILE_LOAD_SCENE',
      Forbidden.enterCommands,
    );

    if (gate) {
      if (!ctx.session.__scenes.state.fileId) {
        await ctx.scene.enter('FILE_LOAD_SCENE', ctx.session.__scenes.state);
        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        return;
      } else {
        await this.fileLoadChoiceMarkup(
          ctx,
          ctx.session.__scenes.state.fileName,
        );
        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        return;
      }
    }

    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @On('document')
  async onFileLoad(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    if (!ctx.scene.current.id || ctx.scene.current.id !== 'FILE_LOAD_SCENE') {
      return;
    }
    const message = ctx.message as Message.DocumentMessage;

    this.setterForOrderMap(ctx, OrderMsg.userMessageId, message.message_id);

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
      ctx.session.__scenes.state.fileName = fileName;
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

    await this.deleteMessage(ctx, OrderFLMsg.fileLoadStartMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.fileLoadChoiceMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.incorrectFormatMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.loadFileFailureMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @Action('go-forward_to_comment')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FILE_LOAD_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('COMMENT_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderFLMsg.fileLoadStartMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.fileLoadChoiceMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.incorrectFormatMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.loadFileFailureMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

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

    await this.deleteMessage(ctx, OrderFLMsg.fileLoadChoiceMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.incorrectFormatMessageId);
    await this.deleteMessage(ctx, OrderFLMsg.loadFileFailureMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
