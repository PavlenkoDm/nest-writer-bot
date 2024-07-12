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
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';

@Injectable()
@Scene('FINAL_ORDER_SCENE')
export class FinalOrderScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  private readonly chatId: number;
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super('FINAL_ORDER_SCENE');
    this.chatId = configService.get('MANAGER_ID');
  }

  @SceneEnter()
  async onEnterFinalOrderScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
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

    ctx.replyWithHTML(
      `<b>❕ Ваше замовлення:</b>\n\n
      <b>📌 Тип роботи:</b>  <i>"${typeOfWork}"</i>\n\n
      <b>📌 Галузь знань:</b>  <i>"${branch}"</i>\n\n
      <b>📌 Спеціалізація:</b>  <i>"${specialization}"</i>\n\n
      <b>📌 Тема:</b>  <i>"${isTheme}"</i>\n\n
      <b>📌 Відсоток унікальності (%):</b>  <i>${isUniqueness}</i>\n\n
      <b>⏳ Термін виконання:</b>  <i>"${timeLimit}"</i>\n\n
      <b>📔 Додаткові матеріали:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
      <b>📝 Коментар:</b>  <i>${isComment}</i>
      `,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            '📤 Відправити замовлення менеджеру',
            'send_order',
          ),
        ],
        [Markup.button.callback('🔄 Restart', 'restart')],
      ]),
    );
  }

  @Action('send_order')
  async onSendOrder(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
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
    <b>Замовлення від:</b>  <i>@${ctx.from.username}</i>\n\n
    <b>📌 Тип роботи:</b>  <i>"${typeOfWork}"</i>\n\n
    <b>📌 Галузь знань:</b>  <i>"${branch}"</i>\n\n
    <b>📌 Спеціалізація:</b>  <i>"${specialization}"</i>\n\n
    <b>📌 Тема:</b>  <i>"${isTheme}"</i>\n\n
    <b>📌 Відсоток унікальності (%):</b>  <i>${isUniqueness}</i>\n\n
    <b>⏳ Термін виконання:</b>  <i>"${timeLimit}"</i>\n\n
    <b>📔 Додаткові матеріали:</b>  <i><a href="${isLinkToFile}">${isSavedFile}</a></i>\n\n
    <b>📝 Коментар:</b>  <i>${isComment}</i>
    `;
    await ctx.telegram.sendMessage(this.chatId, message, {
      parse_mode: 'HTML',
    });
    await ctx.replyWithHTML(
      '<b>👍 Замовлення відправлено!</b> Чекайте на зв’язок з менеджером.',
    );
    await ctx.scene.leave();
  }

  @Action('restart')
  async restart(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.session.__scenes.state = {};
    ctx.session.__scenes.state.isScenario = true;
    await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
  }

  @On('text')
  async onTextInFinalOrderScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
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
