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
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonJoinClass, Forbidden } from './common-join.abstract';

@Injectable()
@Scene('PERSONAL_INFO_SCENE')
export class PersonalInfoScene extends CommonJoinClass {
  constructor() {
    super('PERSONAL_INFO_SCENE');
  }

  private personalInfoStartMessageId: number;
  protected commandForbiddenMessageId: number;

  private async personalInfoStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Ви підтверджуєте, що ознайомлені з політикою конфіденційності, та надаєте згоду на обробку персональних даних?</b>
      \n${Emoji.attention} - Увага! Натискаючи "Ні", ви завершуєте анкетування.`,
      Markup.inlineKeyboard([
        Markup.button.callback(`${Emoji.forward} Так`, `yes_i_agree`),
        Markup.button.callback(`${Emoji.reject} Ні`, `no_i_do_not_agree`),
      ]),
    );

    this.personalInfoStartMessageId = startMessage.message_id;

    return startMessage;
  }

  @SceneEnter()
  async onEnterPersonalInfoScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (this.personalInfoStartMessageId) {
      await ctx.deleteMessage(this.personalInfoStartMessageId);
      this.personalInfoStartMessageId = 0;
    }
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
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
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
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    await ctx.scene.leave();
    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
