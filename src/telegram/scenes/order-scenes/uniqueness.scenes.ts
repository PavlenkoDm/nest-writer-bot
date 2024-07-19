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
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';
import { Emoji } from 'src/telegram/emoji/emoji';

@Injectable()
@Scene('UNIQUENESS_SCENE')
export class UniquenessScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('UNIQUENESS_SCENE');
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
    await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть бажаний відсоток унікальності роботи</b>
      \n<i>${Emoji.attention} Це має бути число від ${this.showUniquenessPersent(ctx)} до 100</i>`,
    );
  }

  @On('text')
  async onEnterUniqueness(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'UNIQUENESS_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }

    const message = ctx.text.trim();

    if (!this.regExpForUniq(ctx).test(message)) {
      await ctx.replyWithHTML(
        `<b>${Emoji.reject} Ви ввели некоректне значення</b>`,
      );
      await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);
      return;
    }
    const uniquenessPersent = parseInt(message, 10);

    if (!ctx.session.__scenes.state.uniqueness) {
      ctx.session.__scenes.state.uniqueness = uniquenessPersent;
    } else {
      ctx.session.__scenes.state.uniqueness = uniquenessPersent;
    }

    ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибраний відсоток унікальності:</b>  <i>${ctx.session.__scenes.state.uniqueness}%</i>`,
      Markup.inlineKeyboard([
        [Markup.button.callback(`${Emoji.forward} Далі`, 'go-forward')],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити відсоток унікальності`,
            'change_persent_amount',
          ),
        ],
      ]),
    );
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('TIME_LIMIT_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_persent_amount')
  async changePersent(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('UNIQUENESS_SCENE', ctx.session.__scenes.state);
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
