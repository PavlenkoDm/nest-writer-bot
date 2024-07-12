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
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';

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
export class TypeScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('TYPE_SCENE');
  }

  private chooseTypeOfWork(
    workType: string,
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    ctx.session.__scenes.state.typeOfWork = workType;
    ctx.replyWithHTML(
      `<b>❕ Вибраний тип роботи:</b>\n"<i>${ctx.session.__scenes.state.typeOfWork}</i>"`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Далі', 'go-forward')],
        [
          Markup.button.callback(
            '🚫 Змінити тип роботи',
            'change_type_of_work',
          ),
        ],
      ]),
    );
  }

  @SceneEnter()
  async onEnterTypeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.replyWithHTML(
      '<b>❔ Виберіть тип роботи, та натисніть</b>\n  "<b>Далі</b>"',
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
  }

  @Action('coursework')
  addCoursework(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.coursework, ctx);
  }

  @Action('bachelor')
  addBachelor(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.bachelor, ctx);
  }

  @Action('master')
  addMaster(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.master, ctx);
  }

  @Action('college')
  addCollege(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.college_diploma, ctx);
  }

  @Action('science')
  addScience(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.science_articles, ctx);
  }

  @Action('laboratory')
  addLaboratory(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.laboratory_works, ctx);
  }

  @Action('test_papers')
  addTestPapers(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.test_papers, ctx);
  }

  @Action('presentations')
  addPresentations(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.presentations, ctx);
  }

  @Action('practice')
  addPractice(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.chooseTypeOfWork(TypeOfWork.practice_report, ctx);
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_type_of_work')
  async changeTypeOfWork(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('TYPE_SCENE');
  }

  @On('text')
  async onTextInTypeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'TYPE_SCENE',
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
