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
import { TypeOfWork } from '../common-enums.scenes/work-type.enum';
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden, OrderMsg } from './common-order.abstract';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';

enum OrderUniqMsg {
  uniquenessStartMessageId = 'uniquenessStartMessageId',
  uniquenessChoiceMessageId = 'uniquenessChoiceMessageId',
}

@Injectable()
@Scene('UNIQUENESS_SCENE')
export class UniquenessScene extends CommonOrderClass {
  constructor() {
    super('UNIQUENESS_SCENE');
  }

  private async uniquenessStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    isUniquenessFlag: boolean,
  ) {
    const explainMessage = isUniquenessFlag
      ? `( Зверніть увагу! Попередньо на нашому сайті було вказано некоректний відсоток унікальності для цього типу роботи, або він взагалі не був обраний. Будь ласка, введіть потрібний відсоток унікальності відповідно до діапазону, вказаного вище )`
      : '';

    if (isUniquenessFlag) {
      ctx.session.__scenes.state.uniqueness = 0;
    }

    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть бажаний відсоток унікальності роботи.</b>
      \n${Emoji.attention} Це має бути число від ${this.showUniquenessPersent(ctx)} до 100.
      \n<i>${explainMessage}</i>`,
    );

    this.setterForOrderMap(
      ctx,
      OrderUniqMsg.uniquenessStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async uniquenessChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, OrderUniqMsg.uniquenessChoiceMessageId);

    if (ctx.session.__scenes.state.uniquenessFlag) {
      ctx.session.__scenes.state.uniquenessFlag = false;
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

    this.setterForOrderMap(
      ctx,
      OrderUniqMsg.uniquenessChoiceMessageId,
      choiceMessage.message_id,
    );

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

  private checkFrontUniquenessValue(
    workType: string,
    incomeUniqueness: number,
  ) {
    let isCorrectUniqueness: boolean;

    switch (workType) {
      case TypeOfWork.coursework:
        if (incomeUniqueness >= 40 && incomeUniqueness <= 100) {
          isCorrectUniqueness = true;
        } // 40
        break;
      case TypeOfWork.college_diploma:
        if (incomeUniqueness >= 50 && incomeUniqueness <= 100) {
          isCorrectUniqueness = true;
        } // 50
        break;
      case 'Дипломні роботи для технікумів':
        if (incomeUniqueness >= 50 && incomeUniqueness <= 100) {
          isCorrectUniqueness = true;
        } // 50
        break;
      case TypeOfWork.bachelor:
        if (incomeUniqueness >= 50 && incomeUniqueness <= 100) {
          isCorrectUniqueness = true;
        } // 50
        break;
      case TypeOfWork.master:
        if (incomeUniqueness >= 70 && incomeUniqueness <= 100) {
          isCorrectUniqueness = true;
        } // 70
        break;
      default:
        isCorrectUniqueness = false; // 30
        break;
    }

    return isCorrectUniqueness;
  }

  @SceneEnter()
  async onEnterUniquenessScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const {
      fromCalculation,
      timeLimit,
      uniquenessFlag,
      uniqueness,
      typeOfWork,
    } = ctx.session.__scenes.state;

    if (fromCalculation && timeLimit && uniqueness && uniquenessFlag) {
      const isCorrectUniqueness = this.checkFrontUniquenessValue(
        typeOfWork,
        uniqueness,
      );
      if (isCorrectUniqueness) {
        await this.goForward(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state.uniquenessFlag) {
      ctx.session.__scenes.state.uniquenessFlag = false;
    }

    await this.deleteMessage(ctx, OrderUniqMsg.uniquenessStartMessageId);

    await this.uniquenessStartMarkup(
      ctx,
      ctx.session.__scenes.state.uniquenessFlag,
    );

    return;
  }

  @On('text')
  async onEnterUniqueness(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    this.setterForOrderMap(ctx, OrderMsg.userMessageId, ctx.message.message_id);

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'UNIQUENESS_SCENE',
      Forbidden.enterCommands,
    );

    if (gate) {
      if (!ctx.session.__scenes.state.uniqueness) {
        await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);

        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        await this.deleteMessage(ctx, OrderMsg.alertMessageId);

        return;
      } else {
        await this.uniquenessChoiceMarkup(ctx);

        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        await this.deleteMessage(ctx, OrderMsg.alertMessageId);

        return;
      }
    }

    const message = ctx.text.trim();

    dangerRegexp.lastIndex = 0;
    if (!this.regExpForUniq(ctx).test(message) || dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, OrderMsg.alertMessageId);
      await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

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

    await this.deleteMessage(ctx, OrderUniqMsg.uniquenessStartMessageId);
    await this.deleteMessage(ctx, OrderUniqMsg.uniquenessChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.alertMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @Action('change_persent_amount')
  async changePersent(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'UNIQUENESS_SCENE') {
      return;
    }

    ctx.session.__scenes.state.uniqueness = 0;

    await ctx.answerCbQuery();
    await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderUniqMsg.uniquenessChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderMsg.alertMessageId);
    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
