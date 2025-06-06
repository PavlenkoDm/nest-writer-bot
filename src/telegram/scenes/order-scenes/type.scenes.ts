import { Injectable, OnModuleDestroy } from '@nestjs/common';
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
import {
  CommonOrderClass,
  FileNameOrderMap,
  Forbidden,
  OrderMsg,
} from './common-order.abstract';
import { TypeOfWork } from '../common-enums.scenes/work-type.enum';
import {
  //mapInit,
  saveMapData,
} from 'src/telegram/utils/map-file-saver-loader.utils';
import { orderScenarioMap } from 'src/main';

enum OrderTypeMsg {
  typeStartMessageId = 'typeStartMessageId',
  typeChoiceMessageId = 'typeChoiceMessageId',
  fromCalculationMessageId = 'fromCalculationMessageId',
}

@Injectable()
@Scene('TYPE_SCENE')
export class TypeScene extends CommonOrderClass implements OnModuleDestroy {
  constructor() {
    super('TYPE_SCENE');
  }

  private async typeStartMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Виберіть потрібний тип роботи:</b>`,
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

    this.setterForOrderMap(
      ctx,
      OrderTypeMsg.typeStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async typeChoiceMarkup(ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.deleteMessage(ctx, OrderTypeMsg.typeChoiceMessageId);

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

    this.setterForOrderMap(
      ctx,
      OrderTypeMsg.typeChoiceMessageId,
      choiceMessage.message_id,
    );

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

  private async onFromCalculationMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.deleteMessage(ctx, OrderTypeMsg.fromCalculationMessageId);

    const fromCalculationMessage = await ctx.replyWithHTML(
      `<b>${Emoji.wink} Ми помітили, що ви вже ввели деякі дані на нашому сайті.
      \nЗавдяки цьому ви можете заощадити час і пропустити кілька кроків у процесі оформлення замовлення.</b>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Продовжити замовлення`,
            'go-forward_to_discipline',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.restart} Почати спочатку`,
            'begin_order_from_scratch',
          ),
        ],
      ]),
    );

    this.setterForOrderMap(
      ctx,
      OrderTypeMsg.fromCalculationMessageId,
      fromCalculationMessage.message_id,
    );

    return fromCalculationMessage;
  }

  @SceneEnter()
  async onEnterTypeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const { fromCalculation, typeOfWork, timeLimit } =
      ctx.session.__scenes.state;

    if (fromCalculation && typeOfWork && timeLimit) {
      await this.onFromCalculationMarkup(ctx);
      return;
    }

    await this.deleteMessage(ctx, OrderTypeMsg.typeStartMessageId);

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

    await ctx.answerCbQuery();
    await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderTypeMsg.fromCalculationMessageId);
    await this.deleteMessage(ctx, OrderTypeMsg.typeStartMessageId);
    await this.deleteMessage(ctx, OrderTypeMsg.typeChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

    return;
  }

  @Action('change_type_of_work')
  async changeTypeOfWork(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'TYPE_SCENE') {
      return;
    }

    ctx.session.__scenes.state.typeOfWork = '';

    await ctx.answerCbQuery();
    await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderTypeMsg.typeChoiceMessageId);
    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

    return;
  }

  @Action('begin_order_from_scratch')
  async beginOrderFromScratch(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (ctx.scene.current.id !== 'TYPE_SCENE') {
      return;
    }

    ctx.session.__scenes.state = {};
    ctx.session.__scenes.state.isScenario = true;
    ctx.session.__scenes.state.userTelegramId = ctx.from.id.toString();

    await ctx.answerCbQuery();
    await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);
    await this.deleteMessage(ctx, OrderTypeMsg.fromCalculationMessageId);

    return;
  }

  @On('text')
  async onTextInTypeScene(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    this.setterForOrderMap(ctx, OrderMsg.userMessageId, ctx.message.message_id);

    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'TYPE_SCENE',
      Forbidden.enterCommands,
    );

    if (gate) {
      if (!ctx.session.__scenes.state.typeOfWork) {
        await ctx.scene.enter('TYPE_SCENE', ctx.session.__scenes.state);
        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        return;
      } else {
        await this.typeChoiceMarkup(ctx);
        await this.deleteMessage(ctx, OrderMsg.userMessageId);
        return;
      }
    }

    await this.deleteMessage(ctx, OrderMsg.userMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }

  onModuleDestroy() {
    saveMapData(orderScenarioMap, FileNameOrderMap.orderMapData);
  }
}
