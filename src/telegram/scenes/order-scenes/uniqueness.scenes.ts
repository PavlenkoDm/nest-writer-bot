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
import { TypeOfWork } from './type.scenes';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';

@Injectable()
@Scene('UNIQUENESS_SCENE')
export class UniquenessScene extends CommonOrderClass {
  constructor() {
    super('UNIQUENESS_SCENE');
  }

  private uniquenessStartMessageId: number;
  private uniquenessChoiceMessageId: number;
  protected commandForbiddenMessageId: number;
  protected alertMessageId: number;

  private async uniquenessStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть бажаний відсоток унікальності роботи</b>
      \n<i>${Emoji.attention} Це має бути число від ${this.showUniquenessPersent(ctx)} до 100</i>`,
    );

    this.uniquenessStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async uniquenessChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.uniquenessChoiceMessageId) {
      await ctx.deleteMessage(this.uniquenessChoiceMessageId);
      this.uniquenessChoiceMessageId = 0;
    }

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибраний відсоток унікальності:</b>  <i>${ctx.session.__scenes.state.uniqueness}%</i>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_time_limit',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити відсоток унікальності`,
            'change_persent_amount',
          ),
        ],
      ]),
    );

    this.uniquenessChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  private showUniquenessPersent(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const { typeOfWork } = ctx.session.__scenes.state;
    if (
      typeOfWork === TypeOfWork.college_diploma ||
      typeOfWork === TypeOfWork.bachelor
    ) {
      return 50;
    }
    if (typeOfWork === TypeOfWork.coursework) {
      return 40;
    }
    if (typeOfWork === TypeOfWork.master) {
      return 70;
    }
    return 30;
  }

  private regExpForUniq(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    let regExp: RegExp;

    const { typeOfWork } = ctx.session.__scenes.state;

    switch (typeOfWork) {
      case TypeOfWork.coursework:
        regExp = /^(4[0-9]|[5-9][0-9]|100)$/; // 40
        break;
      case TypeOfWork.college_diploma:
        regExp = /^([5-9][0-9]|100)$/; // 50
        break;
      case 'Дипломні роботи для технікумів':
        regExp = /^([5-9][0-9]|100)$/; // 50
        break;
      case TypeOfWork.bachelor:
        regExp = /^([5-9][0-9]|100)$/; // 50
        break;
      case TypeOfWork.master:
        regExp = /^(7[0-9]|8[0-9]|9[0-9]|100)$/; // 70
        break;
      default:
        regExp = /^(3[0-9]|[4-9][0-9]|100)$/; // 30
        break;
    }

    return regExp;
  }

  @SceneEnter()
  async onEnterUniquenessScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.uniquenessStartMessageId) {
      await ctx.deleteMessage(this.uniquenessStartMessageId);
      this.uniquenessStartMessageId = 0;
    }
    await this.uniquenessStartMarkup(ctx);
    return;
  }

  @On('text')
  async onEnterUniqueness(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'UNIQUENESS_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.uniqueness) {
        await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.uniquenessChoiceMarkup(ctx);
        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (!this.regExpForUniq(ctx).test(message) || dangerRegexp.test(message)) {
      if (this.alertMessageId) {
        await ctx.deleteMessage(this.alertMessageId);
        this.alertMessageId = 0;
      }

      await this.onCreateAlertMessage(ctx);

      if (!ctx.session.__scenes.state.uniqueness) {
        await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.uniquenessChoiceMarkup(ctx);
        return;
      }
    }
    const uniquenessPersent = parseInt(message, 10);

    if (!ctx.session.__scenes.state.uniqueness) {
      ctx.session.__scenes.state.uniqueness = uniquenessPersent;
    } else {
      ctx.session.__scenes.state.uniqueness = uniquenessPersent;
    }

    await this.uniquenessChoiceMarkup(ctx);
    return;
  }

  @Action('go-forward_to_time_limit')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'UNIQUENESS_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);

    if (this.uniquenessStartMessageId) {
      await ctx.deleteMessage(this.uniquenessStartMessageId);
      this.uniquenessStartMessageId = 0;
    }
    if (this.uniquenessChoiceMessageId) {
      await ctx.deleteMessage(this.uniquenessChoiceMessageId);
      this.uniquenessChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.alertMessageId) {
      await ctx.deleteMessage(this.alertMessageId);
      this.alertMessageId = 0;
    }

    return;
  }

  @Action('change_persent_amount')
  async changePersent(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'UNIQUENESS_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);

    if (this.uniquenessChoiceMessageId) {
      await ctx.deleteMessage(this.uniquenessChoiceMessageId);
      this.uniquenessChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    if (this.alertMessageId) {
      await ctx.deleteMessage(this.alertMessageId);
      this.alertMessageId = 0;
    }

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}

// ==============================================================================
// if (
//   !ctx.scene.current.id ||
//   ctx.scene.current.id !== 'UNIQUENESS_SCENE' ||
//   ctx.text.trim().startsWith('/')
// ) {
//   if (ctx.session.__scenes.state.theme) {
//     await ctx.replyWithHTML(
//       '<b>❌ Команди не можуть бути значенням унікальності!</b>',
//     );
//     await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);
//   }
//   return;
// }
