import { Scenes } from 'telegraf';
import { IOrderSceneState } from './order.config';
import { Emoji } from 'src/telegram/emoji/emoji';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
}

export enum Forbidden {
  enterCommands = 'Заборонено вводити команди до закінчення замовлення!',
}

export abstract class CommonOrderClass extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;

  protected async onCreateAlertMessage(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const alertMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${Alert.notCorrect}</b>`,
    );

    this.alertMessageId = alertMsg.message_id;

    return alertMsg;
  }

  protected async onCommandForbiddenMessage(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msg: string,
  ) {
    const forbiddenMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${msg}</b>`,
    );

    this.commandForbiddenMessageId = forbiddenMsg.message_id;

    return forbiddenMsg;
  }

  protected async onSceneGateFromCommand(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    sceneName: string,
    msg: string,
  ) {
    if (
      !ctx.scene.current.id ||
      ctx.scene.current.id !== `${sceneName}` ||
      ctx.text.trim().startsWith('/')
    ) {
      if (ctx.session.__scenes.state.isScenario) {
        if (this.commandForbiddenMessageId) {
          await ctx.deleteMessage(this.commandForbiddenMessageId);
          this.commandForbiddenMessageId = 0;
        }
        await this.onCommandForbiddenMessage(ctx, msg);
        await ctx.scene.enter(`${sceneName}`, ctx.session.__scenes.state);
      }
      return true;
    }
    return false;
  }

  protected async onSceneGateWithoutEnterScene(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    sceneName: string,
    msg: string,
  ) {
    if (
      !ctx.scene.current.id ||
      ctx.scene.current.id !== `${sceneName}` ||
      ctx.text.trim().startsWith('/')
    ) {
      if (ctx.session.__scenes.state.isScenario) {
        if (this.commandForbiddenMessageId) {
          await ctx.deleteMessage(this.commandForbiddenMessageId);
          this.commandForbiddenMessageId = 0;
        }
        await this.onCommandForbiddenMessage(ctx, msg);
      }
      return true;
    }
    return false;
  }
}