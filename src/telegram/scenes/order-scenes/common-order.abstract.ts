import { Scenes } from 'telegraf';
import { IOrderSceneState } from './order.config';
import { Emoji } from 'src/telegram/emoji/emoji';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
  messageOverLength = '( перевищення дозволеної кількості символів )',
}

export enum Forbidden {
  enterCommands = 'Заборонено вводити команди до закінчення замовлення!',
}

export abstract class CommonOrderClass extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  protected alertMessageId: number;
  protected commandForbiddenMessageId: number;
  protected userStartMessageId: number;
  protected userMessageId: number;

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
        await this.deleteMessage(ctx, this.commandForbiddenMessageId);

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
        await this.deleteMessage(ctx, this.commandForbiddenMessageId);

        await this.onCommandForbiddenMessage(ctx, msg);
      }
      return true;
    }
    return false;
  }

  protected async deleteMessage(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    messageId: number,
  ) {
    try {
      if (messageId) {
        await ctx.deleteMessage(messageId);
        messageId = 0;
      }
    } catch (error) {
      if (error.response && error.response.error_code === 400) {
        // console.log(`Message does not exist. Initiator: ${ctx.from.username}`);
        return;
      }
      console.error('Error:', error);
      return;
    }
  }

  protected deleteMessageDelayed(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msgId: number,
    delay: number,
  ) {
    return setTimeout(
      (async () => {
        try {
          if (!!msgId) {
            await ctx.deleteMessage(msgId);
            msgId = 0;
          }
        } catch (error) {
          if (error.response && error.response.error_code === 400) {
            // console.log(
            //   `Message does not exist. Initiator: ${ctx.from.username}`,
            // );
            return;
          }
          console.error('Error:', error);
          return;
        }
      }).bind(ctx),
      delay,
    );
  }

  protected modifyMessageLength(msg: string, length: number) {
    if (msg.length > length) {
      return (
        msg.slice(0, length - 1) +
        `... ${Emoji.alert}${Alert.messageOverLength}${Emoji.alert}`
      );
    } else {
      return msg;
    }
  }
}
