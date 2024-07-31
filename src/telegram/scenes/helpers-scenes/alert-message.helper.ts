import { Emoji } from 'src/telegram/emoji/emoji';
import { MyOrderJoinContext } from 'src/telegram/telegram.service';
import { Scenes } from 'telegraf';

export enum Alert {
  notCorrect = 'Ви ввели некоректне значення!',
}

export async function onCreateAlertMessage(
  ctx: Scenes.SceneContext<MyOrderJoinContext>,
  messageId: number,
) {
  const alertMsg = await ctx.replyWithHTML(
    `<b>${Emoji.reject} ${Alert.notCorrect}</b>`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  messageId = alertMsg.message_id;

  return alertMsg;
}
