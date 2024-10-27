import { Scenes } from 'telegraf';
import { IOrderSceneState } from './order.config';
import { Emoji } from 'src/telegram/emoji/emoji';
import {
  mapGetter,
  mapSetter,
  toDeleteMapKey,
} from 'src/telegram/utils/map.utils';
import { orderScenarioMap } from 'src/main';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
  messageOverLength = '( перевищення дозволеної кількості символів )',
}

export enum Forbidden {
  enterCommands = 'Заборонено вводити команди до закінчення замовлення!',
}

export enum OrderMsg {
  alertMessageId = 'alertMessageId',
  commandForbiddenMessageId = 'commandForbiddenMessageId',
  userStartMessageId = 'userStartMessageId',
  userMessageId = 'userMessageId',
}

export enum FileNameOrderMap {
  orderMapData = 'OrderMapData',
}

export abstract class CommonOrderClass extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  protected setterForOrderMap(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msgIdVarName: string,
    msgIdForMapValue: number,
  ) {
    const messageIdMapKey = `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`;
    return mapSetter(orderScenarioMap, messageIdMapKey, msgIdForMapValue); //CommonOrderClass.orderMsgIdMap
  }
  protected getterForOrderMap(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msgIdVarName: string,
  ) {
    const messageIdMapKey = `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`;
    return mapGetter(orderScenarioMap, messageIdMapKey); //CommonOrderClass.orderMsgIdMap
  }

  protected async onCreateAlertMessage(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const alertMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${Alert.notCorrect}</b>`,
    );

    this.setterForOrderMap(ctx, OrderMsg.alertMessageId, alertMsg.message_id);

    return alertMsg;
  }

  protected async onCommandForbiddenMessage(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msg: string,
  ) {
    const forbiddenMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${msg}</b>`,
    );

    this.setterForOrderMap(
      ctx,
      OrderMsg.commandForbiddenMessageId,
      forbiddenMsg.message_id,
    );

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
        await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

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
        await this.deleteMessage(ctx, OrderMsg.commandForbiddenMessageId);

        await this.onCommandForbiddenMessage(ctx, msg);
      }
      return true;
    }
    return false;
  }

  protected async deleteMessage(
    ctx: Scenes.SceneContext<IOrderSceneState>,
    msgIdVarName: string,
  ) {
    try {
      const msgIdMapValue = mapGetter(
        orderScenarioMap, // CommonOrderClass.orderMsgIdMap
        `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`,
      );
      if (!!msgIdMapValue) {
        await ctx.deleteMessage(msgIdMapValue);
        toDeleteMapKey(
          orderScenarioMap, // CommonOrderClass.orderMsgIdMap
          `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`,
        );
      } else {
        toDeleteMapKey(
          orderScenarioMap, // CommonOrderClass.orderMsgIdMap
          `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`,
        );
        return;
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
    msgIdVarName: string,
    userTelegramId: string,
    delay: number,
  ) {
    return setTimeout(
      (async () => {
        const msgIdMapValue = mapGetter(
          orderScenarioMap, // CommonOrderClass.orderMsgIdMap
          `${msgIdVarName}${userTelegramId}`,
        );
        try {
          if (!!msgIdMapValue) {
            await ctx.deleteMessage(msgIdMapValue);
            toDeleteMapKey(
              orderScenarioMap, // CommonOrderClass.orderMsgIdMap
              `${msgIdVarName}${userTelegramId}`,
            );
          } else {
            toDeleteMapKey(
              orderScenarioMap, // CommonOrderClass.orderMsgIdMap
              `${msgIdVarName}${userTelegramId}`,
            );
            return;
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
