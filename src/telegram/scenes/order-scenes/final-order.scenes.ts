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
import { CommonOrderClass, Forbidden, OrderMsg } from './common-order.abstract';

enum OrderFinalMsg {
  finalOrderStartMessageId = 'finalOrderStartMessageId',
}

@Injectable()
@Scene('FINAL_ORDER_SCENE')
export class FinalOrderScene extends CommonOrderClass {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super('FINAL_ORDER_SCENE');
    this.chatId = configService.get('ORDER_CHANNEL_ID');
  }

  private readonly chatId: number;

  private async commonFinalOrderMarkup(
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
      privacyPolicy,
    } = ctx.session.__scenes.state;

    if (fileId) {
      linkToFile = (await ctx.telegram.getFileLink(fileId)).href;
    }

    const isUniqueness = uniqueness ? uniqueness : 'не визначено';
    const isTheme = theme ? theme : 'не визначено';
    const isLinkToFile = linkToFile ? linkToFile : 'відсутні';
    const isComment = comment ? comment : 'відсутній';
    const isSavedFile = linkToFile ? '[зберегти файл]' : 'відсутні';

    const commonFinalOrderMessage = `
      <b>${Emoji.pin} Тип роботи:</b>  <i>"${typeOfWork}"</i>\n\n
      <b>${Emoji.pin} Галузь знань:</b>  <i>"${branch}"</i>\n\n
      <b>${Emoji.pin} Спеціалізація:</b>  <i>"${specialization}"</i>\n\n
      <b>${Emoji.pin} Тема:</b>  <i>"${isTheme}"</i>\n\n
      <b>${Emoji.pin} Відсоток унікальності (%):</b>  <i>${isUniqueness}</i>\n\n
      <b>${Emoji.time} Термін виконання:</b>  <i>"${timeLimit}"</i>\n\n
      <b>${Emoji.book} Додаткові матеріали:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
      <b>${Emoji.mega} Коментар:</b>  <i>${isComment}</i>\n\n
      <b>${Emoji.note} Ознайомлений з політикою конфіденційності:</b>  <i>${privacyPolicy ? 'Так' : 'Ні'}</i>\n\n
      <b>${Emoji.note} Погоджуюсь на обробку персональних даних:</b>  <i>${privacyPolicy ? 'Так' : 'Ні'}</i>
    `;

    return commonFinalOrderMessage;
  }

  private async finalOrderStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const commonMarkup = await this.commonFinalOrderMarkup(ctx);

    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.alert} Ваше замовлення:</b>\n
      ${commonMarkup}
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

    this.setterForOrderMap(
      ctx,
      OrderFinalMsg.finalOrderStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  @SceneEnter()
  async onEnterFinalOrderScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, OrderFinalMsg.finalOrderStartMessageId);

    await this.finalOrderStartMarkup(ctx);

    return;
  }

  @Action('send_order')
  async onSendOrder(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_ORDER_SCENE') {
      return;
    }
    const commonMarkup = await this.commonFinalOrderMarkup(ctx);

    const message = `
    <b>${Emoji.alert} Замовлення від:</b>  <i>@${ctx.from.username}</i>\n
    ${commonMarkup}
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

    const telegramUserId: string = ctx.session.__scenes.state.userTelegramId;

    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

    this.deleteMessageDelayed(
      ctx,
      OrderFinalMsg.finalOrderStartMessageId,
      telegramUserId,
      10000,
    );

    await ctx.scene.leave();

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

    await this.deleteMessage(ctx, OrderFinalMsg.finalOrderStartMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

    return;
  }

  @Action('break_order')
  async breakOrder(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'FINAL_ORDER_SCENE') {
      return;
    }

    const telegramUserId: string = ctx.session.__scenes.state.userTelegramId;

    ctx.session.__scenes.state = {};

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.sad} Замовлення відмінено.</b>
      \n${Emoji.wink} Але... Якщо натиснути <i>/start_order</i> - почнемо знову!`,
      {
        parse_mode: 'HTML',
      },
    );

    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

    this.deleteMessageDelayed(
      ctx,
      OrderFinalMsg.finalOrderStartMessageId,
      telegramUserId,
      10000,
    );

    await ctx.scene.leave();

    return;
  }

  @On('text')
  async onTextInFinalOrderScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    this.setterForOrderMap(ctx, OrderMsg.userMessageId, ctx.message.message_id);

    const gate = await this.onSceneGateFromCommand(
      ctx,
      'FINAL_ORDER_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      await this.deleteMessage(ctx, OrderMsg.userMessageId);
      return;
    }

    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
