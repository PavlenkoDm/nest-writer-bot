import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { TelegramService } from './telegram.service';
import { TypeScene } from './scenes/order-scenes/type.scenes';
import { ConfigService } from '@nestjs/config';
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

@Module({
  imports: [TelegrafModule.forRootAsync(options())],
  providers: [
    TelegramService,
    TypeScene,
    DisciplineScene,
    ThemeScene,
    UniquenessScene,
    TimeLimitScene,
    FileLoadScene,
    CommentScene,
    PrivacyPolicyScene,
    FinalOrderScene,
    FullNameScene,
    SpecialityScene,
    PhotoFileLoadScene,
    WorkTypeScene,
    TechSkillsScene,
    TimePeriodScene,
    AddEmailScene,
    AddPhoneScene,
    PersonalInfoScene,
    FinalJoinScene,
    ConfigService,
  ],
})
export class TelegramModule {}
