import { Scenes } from 'telegraf';
import { IJoinSceneState } from './join.config';
import { Emoji } from 'src/telegram/emoji/emoji';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
}

export abstract class CommonJoinClass extends Scenes.BaseScene<
  Scenes.SceneContext<IJoinSceneState>
> {
  protected alertMessageId: number;
  protected async onCreateAlertMessage(
    ctx: Scenes.SceneContext<IJoinSceneState>,
  ) {
    const alertMsg = await ctx.replyWithHTML(
      `<b>${Emoji.reject} ${Alert.notCorrect}</b>`,
    );

    this.alertMessageId = alertMsg.message_id;

    return alertMsg;
  }
}
