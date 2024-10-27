import { Scenes } from 'telegraf';
import { IJoinSceneState } from './join.config';
import { Emoji } from 'src/telegram/emoji/emoji';
import {
  mapGetter,
  mapSetter,
  toDeleteMapKey,
} from 'src/telegram/utils/map.utils';
import { joinScenarioMap } from 'src/main';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
  messageOverLength = '( перевищення дозволеної кількості символів )',
}

export enum Forbidden {
  untilJoin = 'Заборонено вводити команди до закінчення анкетування!',
}

export enum JoinMsg {
  alertMessageId = 'alertMessageId',
  commandForbiddenMessageId = 'commandForbiddenMessageId',
}

export enum FileNameJoinMap {
  joinMapData = 'JoinMapData',
}

export abstract class CommonJoinClass extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  protected setterForJoinMap(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    msgIdVarName: string,
    msgIdForMapValue: number,
  ) {
    const messageIdMapKey = `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`;
    return mapSetter(joinScenarioMap, messageIdMapKey, msgIdForMapValue);
  }
  protected getterForOrderMap(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    msgIdVarName: string,
  ) {
    const messageIdMapKey = `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`;
    return mapGetter(joinScenarioMap, messageIdMapKey);
  }

  protected async onCreateAlertMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const alertMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${Alert.notCorrect}</b>`,
    );

    this.setterForJoinMap(ctx, JoinMsg.alertMessageId, alertMsg.message_id);

    return alertMsg;
  }

  protected async onCommandForbiddenMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    msg: string,
  ) {
    const forbiddenMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${msg}</b>`,
    );

    this.setterForJoinMap(
      ctx,
      JoinMsg.commandForbiddenMessageId,
      forbiddenMsg.message_id,
    );

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
        await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

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
        await this.deleteMessage(ctx, JoinMsg.commandForbiddenMessageId);

        await this.onCommandForbiddenMessage(ctx, msg);
      }
      return true;
    }
    return false;
  }

  protected async deleteMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
    msgIdVarName: string,
  ) {
    try {
      const msgIdMapValue = mapGetter(
        joinScenarioMap,
        `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`,
      );
      if (!!msgIdMapValue) {
        await ctx.deleteMessage(msgIdMapValue);
        toDeleteMapKey(
          joinScenarioMap,
          `${msgIdVarName}${ctx.session.__scenes.state.userTelegramId}`,
        );
      } else {
        toDeleteMapKey(
          joinScenarioMap,
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
