import { ConfigService } from '@nestjs/config';
import {
  TelegrafModuleAsyncOptions,
  TelegrafModuleOptions,
} from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as LocalSession from 'telegraf-session-local';
import { TypeScene } from './scenes/order-scenes/type.scenes';
import { TimeLimitScene } from './scenes/order-scenes/time-limit.scenes';
import { UniquenessScene } from './scenes/order-scenes/uniqueness.scenes';
import { ThemeScene } from './scenes/order-scenes/theme.scenes';
import { DisciplineScene } from './scenes/order-scenes/discipline.scenes';
import { FinalOrderScene } from './scenes/order-scenes/final-order.scenes';
import { FileLoadScene } from './scenes/order-scenes/file-load.scenes';
import { CommentScene } from './scenes/order-scenes/comment.scenes';
import { FullNameScene } from './scenes/join-scenes/full-name.scenes';
import { SpecialityScene } from './scenes/join-scenes/speciality.scenes';
import { WorkTypeScene } from './scenes/join-scenes/work-type.scenes';
import { TechSkillsScene } from './scenes/join-scenes/tech-skills.scenes';
import { TimePeriodScene } from './scenes/join-scenes/time-period.scenes';

const localSession = new LocalSession({
  database: 'sessions.json',
}).middleware();

const telegrafModOptions = (config: ConfigService): TelegrafModuleOptions => {
  const stageOrder = new Scenes.Stage<Scenes.SceneContext>([
    new TypeScene(),
    new DisciplineScene(),
    new ThemeScene(),
    new UniquenessScene(),
    new TimeLimitScene(),
    new FileLoadScene(),
    new CommentScene(),
    new FinalOrderScene(config),
  ]);
  const stageJoin = new Scenes.Stage<Scenes.SceneContext>([
    new FullNameScene(),
    new SpecialityScene(),
    new WorkTypeScene(),
    new TechSkillsScene(),
    new TimePeriodScene(),
    // new FileLoadScene(),
    // new CommentScene(),
    // new FinalOrderScene(config),
  ]);
  return {
    token: config.get<string>('BOT_TOKEN')!,
    middlewares: [
      localSession,
      stageOrder.middleware(),
      stageJoin.middleware(),
    ],
  };
};

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => telegrafModOptions(config),
  };
};
