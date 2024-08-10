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
import { TypeOfWork } from '../order-scenes/type.scenes';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { CommonJoinClass, Forbidden } from './common-join.abstract';

const regExpForButton = /selworktype-(?![\d\s\n^])[^\n]+/;

@Injectable()
@Scene('WORK_TYPE_SCENE')
export class WorkTypeScene extends CommonJoinClass {
  constructor() {
    super('WORK_TYPE_SCENE');
  }

  private didNotChooseAnyValueMessageId: number;
  private workTypeStartMessageId: number;
  protected commandForbiddenMessageId: number;

  private async onWorkTypeSet(
    workType: string,
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (!ctx.session.__scenes.state.workType) {
      ctx.session.__scenes.state.workType = [];
    }
    const elementIndex = ctx.session.__scenes.state.workType.indexOf(workType);
    if (elementIndex !== -1) {
      ctx.session.__scenes.state.workType.splice(elementIndex, 1);
    } else {
      ctx.session.__scenes.state.workType.push(workType);
    }
  }

  private onWorkTypeGet(
    workType: string,
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (!ctx.session.__scenes.state.workType) {
      return '';
    }
    const elementIndex = ctx.session.__scenes.state.workType.indexOf(workType);
    if (elementIndex !== -1) {
      return Emoji.chosen;
    } else {
      return '';
    }
  }

  private async createStartMurkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.reply(
      `<b>${Emoji.question} Oберіть з переліку, які види робіт ви можете виконувати:</b>
      \n  <i>( Можна  обрати  не  1  варіант,  а  декілька )</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.coursework, ctx)}${TypeOfWork.coursework}`,
                'selworktype-coursework',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.bachelor, ctx)}${TypeOfWork.bachelor}`,
                'selworktype-bachelor',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.master, ctx)}${TypeOfWork.master}`,
                'selworktype-master',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.college_diploma, ctx)}${TypeOfWork.college_diploma}`,
                'selworktype-college_diploma',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.science_articles, ctx)}${TypeOfWork.science_articles}`,
                'selworktype-science_articles',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.laboratory_works, ctx)}${TypeOfWork.laboratory_works}`,
                'selworktype-laboratory_works',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.test_papers, ctx)}${TypeOfWork.test_papers}`,
                'selworktype-test_papers',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.presentations, ctx)}${TypeOfWork.presentations}`,
                'selworktype-presentations',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.practice_report, ctx)} ${TypeOfWork.practice_report}`,
                'selworktype-practice_report',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.forward} Далі`,
                'go-forward_to_tech_skills',
              ),
            ],
          ],
        },
      },
    );
    this.workTypeStartMessageId = startMessage.message_id;
    return startMessage;
  }

  private async onDidNotChooseAnyValueMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, this.didNotChooseAnyValueMessageId);

    const chooseMessage = await ctx.replyWithHTML(
      `${Emoji.reject} Ви не обрали жодного значення!`,
    );

    this.didNotChooseAnyValueMessageId = chooseMessage.message_id;

    return chooseMessage;
  }

  @SceneEnter()
  async onEnterWorkTypeScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await this.deleteMessage(ctx, this.workTypeStartMessageId);

    await this.createStartMurkup(ctx);
    return;
  }

  @Action(regExpForButton)
  async onSelWorkTypeHandler(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const { data } = ctx.callbackQuery as CallbackQuery.DataQuery;
    const buttonId = data.split('-')[1];
    const enumEntries = Object.entries(TypeOfWork);
    const typeWork = enumEntries.find((item) => {
      return item[0] === buttonId;
    })[1];
    await this.onWorkTypeSet(typeWork, ctx);

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Oберіть з переліку, які види робіт ви можете виконувати:</b>
      \n  <i>( Можна  обрати  не  1  варіант,  а  декілька )</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.coursework, ctx)}${TypeOfWork.coursework}`,
                'selworktype-coursework',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.bachelor, ctx)}${TypeOfWork.bachelor}`,
                'selworktype-bachelor',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.master, ctx)}${TypeOfWork.master}`,
                'selworktype-master',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.college_diploma, ctx)}${TypeOfWork.college_diploma}`,
                'selworktype-college_diploma',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.science_articles, ctx)}${TypeOfWork.science_articles}`,
                'selworktype-science_articles',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.laboratory_works, ctx)}${TypeOfWork.laboratory_works}`,
                'selworktype-laboratory_works',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.test_papers, ctx)}${TypeOfWork.test_papers}`,
                'selworktype-test_papers',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.presentations, ctx)}${TypeOfWork.presentations}`,
                'selworktype-presentations',
              ),
            ],
            [
              Markup.button.callback(
                `${this.onWorkTypeGet(TypeOfWork.practice_report, ctx)} ${TypeOfWork.practice_report}`,
                'selworktype-practice_report',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.forward} Далі`,
                'go-forward_to_tech_skills',
              ),
            ],
          ],
        },
      },
    );
    return;
  }

  @On('text')
  async onTextInWorkTypeScene(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const gate = await this.onSceneGateFromCommand(
      ctx,
      'WORK_TYPE_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      return;
    }
  }

  @Action('go-forward_to_tech_skills')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await ctx.answerCbQuery();
    if (ctx.scene.current.id !== 'WORK_TYPE_SCENE') {
      return;
    }

    if (
      !ctx.session.__scenes.state.workType ||
      ctx.session.__scenes.state.workType.length === 0
    ) {
      await this.onDidNotChooseAnyValueMarkup(ctx);
      await ctx.scene.enter('WORK_TYPE_SCENE', ctx.session.__scenes.state);

      await this.deleteMessage(ctx, this.commandForbiddenMessageId);

      return;
    }

    await ctx.scene.enter('TECH_SKILLS_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, this.commandForbiddenMessageId);
    await this.deleteMessage(ctx, this.didNotChooseAnyValueMessageId);

    return;
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
  }
}
