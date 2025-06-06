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
import { IJoinSceneState } from './join.config';
import { Emoji } from 'src/telegram/emoji/emoji';
import { dangerRegexp } from '../helpers-scenes/regexps.helper';
import {
  CommonJoinClass,
  FileNameJoinMap,
  Forbidden,
  JoinMsg,
} from './common-join.abstract';
import { StringLength } from '../common-enums.scenes/strlength.enum';
import { saveMapData } from 'src/telegram/utils/map-file-saver-loader.utils';
import { joinScenarioMap } from 'src/main';

enum JoinFullNameMsg {
  fullNameStartMessageId = 'fullNameStartMessageId',
  fullNameChoiceMessageId = 'fullNameChoiceMessageId',
}

@Injectable()
@Scene('FULL_NAME_SCENE')
export class FullNameScene extends CommonJoinClass implements OnModuleDestroy {
  constructor() {
    super('FULL_NAME_SCENE');
  }

  private async fullNameStartMarkup(ctx: Scenes.SceneContext<IJoinSceneState>) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Введіть ваше повне імʼя та вік.</b>
      \n<i> ( Наприклад:  Іванов  Іван  Іванович,  25 )</i>`,
    );

    this.setterForJoinMap(
      ctx,
      JoinFullNameMsg.fullNameStartMessageId,
      startMessage.message_id,
    );

    return startMessage;
  }

  private async fullNameChoiceMarkup(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    await this.deleteMessage(ctx, JoinFullNameMsg.fullNameChoiceMessageId);

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Додані повне імʼя та вік:</b>
      \n"<i>${ctx.session.__scenes.state.fullName}</i>"
      \n${Emoji.attention} - Для зміни доданої інформації введіть нові дані.`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            `go-forward_to_speciality`,
          ),
        ],
      ]),
    );

    this.setterForJoinMap(
      ctx,
      JoinFullNameMsg.fullNameChoiceMessageId,
      choiceMessage.message_id,
    );

    return choiceMessage;
  }

  @SceneEnter()
  async onEnterFullNameScene(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    await this.deleteMessage(ctx, JoinFullNameMsg.fullNameStartMessageId);

    await this.fullNameStartMarkup(ctx);
    return;
  }

  @On('text')
  async onFullName(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'FULL_NAME_SCENE',
      Forbidden.untilJoin,
    );
    if (gate) {
      if (ctx.session.__scenes.state.fullName) {
        await this.fullNameChoiceMarkup(ctx);
        return;
      } else {
        await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
        return;
      }
    }

    const msg = ctx.text.trim();

    const message = this.modifyMessageLength(msg, StringLength.short);

    dangerRegexp.lastIndex = 0;
    if (dangerRegexp.test(message)) {
      await this.deleteMessage(ctx, JoinMsg.alertMessageId);

      await this.onCreateAlertMessage(ctx);

      if (!ctx.session.__scenes.state.fullName) {
        await ctx.scene.enter('FULL_NAME_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.fullNameChoiceMarkup(ctx);
        return;
      }
    }

    if (!ctx.session.__scenes.state) {
      ctx.session.__scenes.state = {};
      ctx.session.__scenes.state.fullName = message;
    } else {
      ctx.session.__scenes.state.fullName = message;
    }

    await this.fullNameChoiceMarkup(ctx);
    return;
  }

  @Action(`go-forward_to_speciality`)
  async goToSpecialityForward(
    @Ctx() ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    if (
      ctx.scene.current.id !== 'FULL_NAME_SCENE' ||
      !ctx.session.__scenes.state.fullName
    ) {
      return;
    }

    // await ctx.editMessageReplyMarkup({
    //   inline_keyboard: [
    //     [
    //       Markup.button.callback(
    //         `${Emoji.forward} Далі`,
    //         `${Date.now().toString()}`,
    //       ),
    //     ],
    //   ],
    // });

    await ctx.answerCbQuery();
    await ctx.scene.enter('SPECIALITY_SCENE', ctx.session.__scenes.state);

    await this.deleteMessage(ctx, JoinMsg.alertMessageId);
    await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

    return;
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IJoinSceneState>) {
    ctx.from.id;
    return;
  }

  onModuleDestroy() {
    saveMapData(joinScenarioMap, FileNameJoinMap.joinMapData);
  }
}
