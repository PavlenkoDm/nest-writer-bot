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
import { IJoinSceneState } from './join.config';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonJoinClass, Forbidden, JoinMsg } from './common-join.abstract';
import { ConfigService } from '@nestjs/config';

enum JoinPersonalIMsg {
  personalInfoStartMessageId = 'personalInfoStartMessageId',
}

@Injectable()
@Scene('PERSONAL_INFO_SCENE')
export class PersonalInfoScene extends CommonJoinClass {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super('PERSONAL_INFO_SCENE');
    this.linkToPrivacyPolicy = configService.get('LINK_TO_PRIVACY_POLICY');
  }

  private linkToPrivacyPolicy: string;

  private async personalInfoStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Ви підтверджуєте, що ознайомлені з <a href="${this.linkToPrivacyPolicy}">політикою конфіденційності</a>, та надаєте згоду на обробку персональних даних?</b>
      \n${Emoji.attention} - Увага! Натискаючи "Ні", ви завершуєте анкетування.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.forward} Так`, `yes_i_agree`),
        Markup.button.callback(`${Emoji.reject} Ні`, `no_i_do_not_agree`),
      ]),
    );

    this.setterForJoinMap(
      ctx,
      JoinPersonalIMsg.personalInfoStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  @SceneEnter()
  async onEnterPersonalInfoScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, JoinPersonalIMsg.personalInfoStartMessageId);

    await this.personalInfoStartMarkup(ctx);
    return;
  }

  @On('text')
  async onTextInPersonalInfoScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const gate = await this.onSceneGateFromCommand(
      ctx,
      'PERSONAL_INFO_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }
  }

  @Action(`yes_i_agree`)
  async goAgreeForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'PERSONAL_INFO_SCENE') {
      return;
    }
    if (!ctx.session.__scenes.state.personalInfo) {
      ctx.session.__scenes.state.personalInfo = true;
    } else {
      ctx.session.__scenes.state.personalInfo = true;
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('FINAL_JOIN_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

    return;
  }

  @Action(`no_i_do_not_agree`)
  async onSkip(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'PERSONAL_INFO_SCENE') {
      return;
    }
    ctx.session.__scenes.state = {};
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.sad} На жаль, ми вимушені достроково завершити анкетування.</b>
      \n${Emoji.wink} Але... Якщо захочете пройти його знову тисніть /start_join`,
      { parse_mode: 'HTML' },
    );

    await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

    await ctx.scene.leave();

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
