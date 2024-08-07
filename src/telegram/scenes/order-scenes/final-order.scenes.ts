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
import { IOrderSceneState } from './order.config';
import { ConfigService } from '@nestjs/config';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';

@Injectable()
@Scene('FINAL_ORDER_SCENE')
export class FinalOrderScene extends CommonOrderClass {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super('FINAL_ORDER_SCENE');
    this.chatId = configService.get('MANAGER_ID');
  }

  private readonly chatId: number;
  private finalOrderStartMessageId: number;
  protected commandForbiddenMessageId: number;

  private async finalOrderStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    let linkToFile: string;
    const {
      typeOfWork,
      discipline: { branch, specialization },
      timeLimit,
      uniqueness,
      theme,
      fileId,
      comment,
    } = ctx.session.__scenes.state;

    if (fileId) {
      linkToFile = (await ctx.telegram.getFileLink(fileId)).href;
    }

    const isUniqueness = uniqueness ? uniqueness : 'не визначено';
    const isTheme = theme ? theme : 'не визначено';
    const isLinkToFile = linkToFile ? linkToFile : 'відсутні';
    const isComment = comment ? comment : 'відсутній';
    const isSavedFile = linkToFile ? '[зберегти файл]' : 'відсутні';

    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.alert} Ваше замовлення:</b>\n\n
      <b>${Emoji.pin} Тип роботи:</b>  <i>"${typeOfWork}"</i>\n\n
      <b>${Emoji.pin} Галузь знань:</b>  <i>"${branch}"</i>\n\n
      <b>${Emoji.pin} Спеціалізація:</b>  <i>"${specialization}"</i>\n\n
      <b>${Emoji.pin} Тема:</b>  <i>"${isTheme}"</i>\n\n
      <b>${Emoji.pin} Відсоток унікальності (%):</b>  <i>${isUniqueness}</i>\n\n
      <b>${Emoji.time} Термін виконання:</b>  <i>"${timeLimit}"</i>\n\n
      <b>${Emoji.book} Додаткові матеріали:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
      <b>${Emoji.note} Коментар:</b>  <i>${isComment}</i>
      `,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.send} Відправити замовлення менеджеру`,
            'send_order',
          ),
        ],
        [Markup.button.callback(`${Emoji.restart} Restart`, 'restart_order')],
        [
          Markup.button.callback(
            `${Emoji.change} Відмінити замовлення`,
            'break_order',
          ),
        ],
      ]),
    );

    this.finalOrderStartMessageId = startMessage.message_id;

    return startMessage;
  }

  @SceneEnter()
  async onEnterFinalOrderScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.finalOrderStartMessageId) {
      await ctx.deleteMessage(this.finalOrderStartMessageId);
      this.finalOrderStartMessageId = 0;
    }
    await this.finalOrderStartMarkup(ctx);
    return;
  }

  @Action('send_order')
  async onSendOrder(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_ORDER_SCENE') {
      return;
    }
    let linkToFile: string;
    const {
      typeOfWork,
      discipline: { branch, specialization },
      timeLimit,
      uniqueness,
      theme,
      fileId,
      comment,
    } = ctx.session.__scenes.state;

    if (fileId) {
      linkToFile = (await ctx.telegram.getFileLink(fileId)).href;
    }

    const isUniqueness = uniqueness ? uniqueness : 'не визначено';
    const isTheme = theme ? theme : 'не визначено';
    const isLinkToFile = linkToFile ? linkToFile : 'відсутні';
    const isComment = comment ? comment : 'відсутній';
    const isSavedFile = linkToFile ? '[зберегти файл]' : 'відсутні';

    const message = `
    <b>${Emoji.alert} Замовлення від:</b>  <i>@${ctx.from.username}</i>\n\n
    <b>${Emoji.pin} Тип роботи:</b>  <i>"${typeOfWork}"</i>\n\n
    <b>${Emoji.pin} Галузь знань:</b>  <i>"${branch}"</i>\n\n
    <b>${Emoji.pin} Спеціалізація:</b>  <i>"${specialization}"</i>\n\n
    <b>${Emoji.pin} Тема:</b>  <i>"${isTheme}"</i>\n\n
    <b>${Emoji.pin} Відсоток унікальності (%):</b>  <i>${isUniqueness}</i>\n\n
    <b>${Emoji.time} Термін виконання:</b>  <i>"${timeLimit}"</i>\n\n
    <b>${Emoji.book} Додаткові матеріали:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
    <b>${Emoji.note} Коментар:</b>  <i>${isComment}</i>
    `;
    await ctx.telegram.sendMessage(this.chatId, message, {
      parse_mode: 'HTML',
    });
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.answer} Замовлення відправлено!</b>
      \n${Emoji.time} Чекайте на зв’язок з менеджером.`,
      {
        parse_mode: 'HTML',
      },
    );
    await ctx.scene.leave();
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @Action('restart_order')
  async restart(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_ORDER_SCENE') {
      return;
    }
    ctx.session.__scenes.state = {};
    ctx.session.__scenes.state.isScenario = true;
    await ctx.answerCbQuery();
    await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.finalOrderStartMessageId) {
      await ctx.deleteMessage(this.finalOrderStartMessageId);
      this.finalOrderStartMessageId = 0;
    }
    return;
  }

  @Action('break_order')
  async breakOrder(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_ORDER_SCENE') {
      return;
    }
    ctx.session.__scenes.state = {};
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.sad} Замовлення відмінено.</b>
      \n${Emoji.wink} Але... Якщо натиснути <i>/start_order</i> - почнемо знову!`,
      {
        parse_mode: 'HTML',
      },
    );

    await ctx.scene.leave();
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @On('text')
  async onTextInFinalOrderScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await this.onSceneGateFromCommand(
      ctx,
      'FINAL_ORDER_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
