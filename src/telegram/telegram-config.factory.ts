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
import { AddEmailScene } from './scenes/join-scenes/add-email.scenes';
import { PhotoFileLoadScene } from './scenes/join-scenes/photofile-load.scenes';
import { AddPhoneScene } from './scenes/join-scenes/add-phone.scenes';
import { PersonalInfoScene } from './scenes/join-scenes/personal-info.scenes';
import { FinalJoinScene } from './scenes/join-scenes/final-join.scenes';
import { PrivacyPolicyScene } from './scenes/order-scenes/privacy-policy.scenes';
import { DbClientOrderService } from 'src/dbclient/dbclient.order.service';
import { DbClientUserService } from 'src/dbclient/dbclient.user.service';
import { S3StorageService } from 'src/s3-storage/s3-storage.service';

const localSession = new LocalSession({
  database: 'sessions.json',
}).middleware();

const telegrafModOptions = (
  config: ConfigService,
  dbClientUserService: DbClientUserService,
  dbClientOrderService: DbClientOrderService,
  s3StorageService: S3StorageService,
): TelegrafModuleOptions => {
  const stageOrder = new Scenes.Stage<Scenes.SceneContext>([
    new TypeScene(),
    new DisciplineScene(),
    new ThemeScene(),
    new UniquenessScene(),
    new TimeLimitScene(),
    new FileLoadScene(),
    new CommentScene(),
    new PrivacyPolicyScene(config),
    new FinalOrderScene(
      config,
      dbClientUserService,
      dbClientOrderService,
      s3StorageService,
    ),
  ]);
  const stageJoin = new Scenes.Stage<Scenes.SceneContext>([
    new FullNameScene(),
    new SpecialityScene(),
    new PhotoFileLoadScene(),
    new WorkTypeScene(),
    new TechSkillsScene(),
    new TimePeriodScene(),
    new AddEmailScene(),
    new AddPhoneScene(),
    new PersonalInfoScene(config),
    new FinalJoinScene(config),
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
    inject: [
      ConfigService,
      DbClientUserService,
      DbClientOrderService,
      S3StorageService,
    ],
    useFactory: (
      config: ConfigService,
      dbClientUserService: DbClientUserService,
      dbClientOrderService: DbClientOrderService,
      s3StorageService: S3StorageService,
    ) =>
      telegrafModOptions(
        config,
        dbClientUserService,
        dbClientOrderService,
        s3StorageService,
      ),
  };
};
