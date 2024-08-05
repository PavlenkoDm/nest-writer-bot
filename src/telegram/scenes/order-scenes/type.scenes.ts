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
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';

export enum TypeOfWork {
  coursework = 'Курсові роботи та проєкти',
  bachelor = 'Бакалаврські роботи',
  master = 'Магістерські роботи',
  college_diploma = 'Дипломні роботи для коледжів, технікумів',
  science_articles = 'Наукові статті та тези',
  laboratory_works = 'Практичні та лабораторні роботи',
  test_papers = 'Контрольні роботи',
  presentations = 'Презентації',
  practice_report = 'Звіти з практики',
}

@Injectable()
@Scene('TYPE_SCENE')
export class TypeScene extends CommonOrderClass {
  constructor() {
    super('TYPE_SCENE');
  }
  private typeStartMessageId: number;
  private typeChoiceMessageId: number;
  protected commandForbiddenMessageId: number;

  private async typeStartMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Виберіть тип роботи, та натисніть</b>\n  "<b>Далі</b>"`,
      Markup.inlineKeyboard([
        [Markup.button.callback(TypeOfWork.coursework, 'coursework')],
        [Markup.button.callback(TypeOfWork.bachelor, 'bachelor')],
        [Markup.button.callback(TypeOfWork.master, 'master')],
        [Markup.button.callback(TypeOfWork.college_diploma, 'college')],
        [Markup.button.callback(TypeOfWork.science_articles, 'science')],
        [Markup.button.callback(TypeOfWork.laboratory_works, 'laboratory')],
        [Markup.button.callback(TypeOfWork.test_papers, 'test_papers')],
        [Markup.button.callback(TypeOfWork.presentations, 'presentations')],
        [Markup.button.callback(TypeOfWork.practice_report, 'practice')],
      ]),
    );

    this.typeStartMessageId = startMessage.message_id;

    return startMessage;
  }

  private async typeChoiceMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (this.typeChoiceMessageId) {
      await ctx.deleteMessage(this.typeChoiceMessageId);
      this.typeChoiceMessageId = 0;
    }

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибраний тип роботи:</b>
      \n"<i>${ctx.session.__scenes.state.typeOfWork}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_discipline',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити тип роботи`,
            'change_type_of_work',
          ),
        ],
      ]),
    );

    this.typeChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  private async chooseTypeOfWork(
    workType: string,
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    ctx.session.__scenes.state.typeOfWork = workType;
    await ctx.answerCbQuery();
    await this.typeChoiceMarkup(ctx);
    return;
  }

  @SceneEnter()
  async onEnterTypeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (this.typeStartMessageId) {
      await ctx.deleteMessage(this.typeStartMessageId);
      this.typeStartMessageId = 0;
    }
    await this.typeStartMarkup(ctx);
    return;
  }

  @Action('coursework')
  addCoursework(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.coursework, ctx);
    return;
  }

  @Action('bachelor')
  addBachelor(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.bachelor, ctx);
    return;
  }

  @Action('master')
  addMaster(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.master, ctx);
    return;
  }

  @Action('college')
  addCollege(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.college_diploma, ctx);
    return;
  }

  @Action('science')
  addScience(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.science_articles, ctx);
    return;
  }

  @Action('laboratory')
  addLaboratory(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.laboratory_works, ctx);
    return;
  }

  @Action('test_papers')
  addTestPapers(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.test_papers, ctx);
    return;
  }

  @Action('presentations')
  addPresentations(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.presentations, ctx);
    return;
  }

  @Action('practice')
  addPractice(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.practice_report, ctx);
    return;
  }

  @Action('go-forward_to_discipline')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'TYPE_SCENE') {
      return;
    }
    if (!ctx.session.__scenes.state.discipline) {
      ctx.session.__scenes.state.discipline = {
        branch: '',
        specialization: '',
      };
    }
    await ctx.answerCbQuery();
    await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);
    if (this.typeStartMessageId) {
      await ctx.deleteMessage(this.typeStartMessageId);
      this.typeStartMessageId = 0;
    }
    if (this.typeChoiceMessageId) {
      await ctx.deleteMessage(this.typeChoiceMessageId);
      this.typeChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @Action('change_type_of_work')
  async changeTypeOfWork(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'TYPE_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
    // if (this.typeStartMessageId) {
    //   await ctx.deleteMessage(this.typeStartMessageId);
    //   this.typeStartMessageId = 0;
    // }
    if (this.typeChoiceMessageId) {
      await ctx.deleteMessage(this.typeChoiceMessageId);
      this.typeChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @On('text')
  async onTextInTypeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'TYPE_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      if (!ctx.session.__scenes.state.typeOfWork) {
        await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.typeChoiceMarkup(ctx);
        return;
      }
    }
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}

//=====================================================================================
// if (!ctx.session.__scenes.order) {
//   ctx.session.__scenes.order = {};
// }

// @Action('send_order')
// async onSendOrder(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
//   const { typeOfWork } = ctx.session.__scenes.order;
//   const message = `Замовлення від @${ctx.from.username}\nТип роботи: ${typeOfWork}`;
//   await ctx.telegram.sendMessage(this.chatId, message);
//   ctx.replyWithHTML('<b>Замовлення відправлено</b>');
//   ctx.scene.leave();
// }

// export const plagiatScene = new Scenes.BaseScene('PLAGIAT_SCENE');

// export const deadLineScene = new Scenes.BaseScene('DEADLINE_SCENE');

// const selectScene3 = new Scenes.WizardScene('SELECT_SCENE_3', (ctx) => {
//   ctx.reply('Выберите третий вариант:', {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: 'Вариант X', callback_data: 'optionX' }],
//         [{ text: 'Вариант Y', callback_data: 'optionY' }],
//         [{ text: 'Завершить', callback_data: 'finish' }],
//       ],
//     },
//   });
//   return ctx.wizard.next();
// });
