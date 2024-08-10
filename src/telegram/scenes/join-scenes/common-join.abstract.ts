import { Scenes } from 'telegraf';
import { IJoinSceneState } from './join.config';
import { Emoji } from 'src/telegram/emoji/emoji';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
}

export enum Forbidden {
  untilJoin = 'Заборонено вводити команди до закінчення анкетування!',
}

export abstract class CommonJoinClass extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;

  protected async onCreateAlertMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const alertMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${Alert.notCorrect}</b>`,
    );

    this.alertMessageId = alertMsg.message_id;

    return alertMsg;
  }

  protected async onCommandForbiddenMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    msg: string,
  ) {
    const forbiddenMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${msg}</b>`,
    );

    this.commandForbiddenMessageId = forbiddenMsg.message_id;

    return forbiddenMsg;
  }

  protected async onSceneGateFromCommand(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    sceneName: string,
    msg: string,
  ) {
    if (
      !ctx.scene.current.id ||
      ctx.scene.current.id !== `${sceneName}` ||
      ctx.text.trim().startsWith('/')
    ) {
      if (ctx.session.__scenes.state.isJoinScenario) {
        await this.deleteMessage(ctx, this.commandForbiddenMessageId);

        await this.onCommandForbiddenMessage(ctx, msg);
        await ctx.scene.enter(`${sceneName}`, ctx.session.__scenes.state);
      }
      return true;
    }
    return false;
  }

  protected async onSceneGateWithoutEnterScene(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    sceneName: string,
    msg: string,
  ) {
    if (
      !ctx.scene.current.id ||
      ctx.scene.current.id !== `${sceneName}` ||
      ctx.text.trim().startsWith('/')
    ) {
      if (ctx.session.__scenes.state.isJoinScenario) {
        await this.deleteMessage(ctx, this.commandForbiddenMessageId);

        await this.onCommandForbiddenMessage(ctx, msg);
      }
      return true;
    }
    return false;
  }

  protected async deleteMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    messageId: number,
  ) {
    try {
      if (messageId) {
        await ctx.deleteMessage(messageId);
        messageId = 0;
      }
    } catch (error) {
      if (error.response && error.response.error_code === 400) {
        console.log(`Message does not exist. Initiator: ${ctx.from.username}`);
        return;
      }
      console.error('Error:', error);
      return;
    }
  }
}
