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
import { Emoji } from 'src/telegram/emoji/emoji';

@Injectable()
@Scene('PERSONAL_INFO_SCENE')
export class PersonalInfoScene extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  constructor() {
    super('PERSONAL_INFO_SCENE');
  }

  private personalInfoStartMessageId: number;

  private async personalInfoStartMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Ви підтверджуєте що ознайомлені з політикою конфіденційності, та надаєте згоду на обробку персональних даних?</b>
      \n${Emoji.attention} - Увага! Натискаючи "Ні" ви завершуєте анкетування`,
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
    this.personalInfoStartMessageId &&
      (await ctx.deleteMessage(this.personalInfoStartMessageId));
    await this.personalInfoStartMarkup(ctx);
  }

  @On('text')
  async onTextInPersonalInfoScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
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
  }

  @Action(`no_i_do_not_agree`)
  async onSkip(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    if (ctx.scene.current.id !== 'PERSONAL_INFO_SCENE') {
      return;
    }
    ctx.session.__scenes.state = {};
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      `<b>${Emoji.sad} На жаль ми вимушені достроково завершити анкетування</b>
      \n${Emoji.wink} Але... Якщо захочете пройти його знову - тисніть /start_join`,
    );
    await ctx.scene.leave();
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
