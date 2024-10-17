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
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden, OrderMsg } from './common-order.abstract';
import { ConfigService } from '@nestjs/config';

enum OrderPPMsg {
  privacyPolicyStartMessageId = 'privacyPolicyStartMessageId',
}

@Injectable()
@Scene('PRIVACY_POLICY_SCENE')
export class PrivacyPolicyScene extends CommonOrderClass {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super('PRIVACY_POLICY_SCENE');
    this.linkToPrivacyPolicy = configService.get('LINK_TO_PRIVACY_POLICY');
  }

  private linkToPrivacyPolicy: string;

  private async privacyPolicyStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Ви підтверджуєте, що ознайомлені з <a href="${this.linkToPrivacyPolicy}">політикою конфіденційності</a>, та надаєте згоду на обробку персональних даних?</b>
      \n${Emoji.attention} - Увага! Натискаючи "Ні", ви перериваєте процес замовлення.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.forward} Так`, `yes_agreement`),
        Markup.button.callback(`${Emoji.reject} Ні`, `no_disagreement`),
      ]),
    );

    this.setterForOrderMap(
      ctx,
      OrderPPMsg.privacyPolicyStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  @SceneEnter()
  async onEnterPrivacyPolicyScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, OrderPPMsg.privacyPolicyStartMessageId);

    await this.privacyPolicyStartMarkup(ctx);

    return;
  }

  @On('text')
  async onTextInPrivacyPolicyScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    this.setterForOrderMap(ctx, OrderMsg.userMessageId, ctx.message.message_id);

    const gate = await this.onSceneGateFromCommand(
      ctx,
      'PRIVACY_POLICY_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      await this.deleteMessage(ctx, OrderMsg.userMessageId);
      return;
    }

    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @Action(`yes_agreement`)
  async onAgree(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'PRIVACY_POLICY_SCENE') {
      return;
    }
    if (!ctx.session.__scenes.state.privacyPolicy) {
      ctx.session.__scenes.state.privacyPolicy = true;
    } else {
      ctx.session.__scenes.state.privacyPolicy = true;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('FINAL_ORDER_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderPPMsg.privacyPolicyStartMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

    return;
  }

  @Action(`no_disagreement`)
  async onDisagree(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'PRIVACY_POLICY_SCENE') {
      return;
    }

    const telegramUserId: string = ctx.session.__scenes.state.userTelegramId;

    ctx.session.__scenes.state = {};

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.sad} На жаль, ми вимушені достроково припинити процес замовлення.</b>
      \n${Emoji.wink} Але... Якщо захочете пройти його знову тисніть /start_order`,
      { parse_mode: 'HTML' },
    );

    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    this.deleteMessageDelayed(
      ctx,
      OrderPPMsg.privacyPolicyStartMessageId,
      telegramUserId,
      10000,
    );

    await ctx.scene.leave();

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
