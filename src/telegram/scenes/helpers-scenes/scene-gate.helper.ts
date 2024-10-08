import { Scenes } from 'telegraf';
import { MyOrderJoinContext } from 'src/telegram/telegram.service';
import { Emoji } from 'src/telegram/emoji/emoji';

export enum Forbidden {
  enterCommands = 'Заборонено вводити команди до закінчення замовлення!',
  untilJoin = 'Заборонено вводити команди до закінчення опитування на приєднання!',
}

export async function onSceneGateFromCommand(
  ctx: Scenes.SceneContext<MyOrderJoinContext>,
  sceneName: string,
  msg: string,
) {
  if (
    !ctx.scene.current.id ||
    ctx.scene.current.id !== `${sceneName}` ||
    ctx.text.trim().startsWith('/')
  ) {
    if (
      ctx.session.__scenes.state.isScenario ||
      ctx.session.__scenes.state.isJoinScenario
    ) {
      await ctx.replyWithHTML(`<b>${Emoji.reject} ${msg}</b>`);
      await ctx.scene.enter(`${sceneName}`, ctx.session.__scenes.state);
    }
    return true;
  }
  return false;
}

export async function onSceneGateWithoutEnterScene(
  ctx: Scenes.SceneContext<MyOrderJoinContext>,
  sceneName: string,
  msg: string,
) {
  if (
    !ctx.scene.current.id ||
    ctx.scene.current.id !== `${sceneName}` ||
    ctx.text.trim().startsWith('/')
  ) {
    if (
      ctx.session.__scenes.state.isScenario ||
      ctx.session.__scenes.state.isJoinScenario
    ) {
      await ctx.replyWithHTML(`<b>${Emoji.reject} ${msg}</b>`);
    }
    return true;
  }
  return false;
}
