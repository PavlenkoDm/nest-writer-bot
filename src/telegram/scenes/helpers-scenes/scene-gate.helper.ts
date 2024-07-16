import { Scenes } from 'telegraf';
import { IOrderSceneState } from '../order-scenes/order.config';

export enum Forbidden {
  enterCommands = 'Заборонено вводити команди до закінчення замовлення!',
}

export async function onSceneGateFromCommand(
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
      await ctx.replyWithHTML(`<b>❌ ${msg}</b>`);
      await ctx.scene.enter(`${sceneName}`, ctx.session.__scenes.state);
    }
    return true;
  }
  return false;
}
