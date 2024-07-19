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
    FinalOrderScene,
    FullNameScene,
    SpecialityScene,
    ConfigService,
  ],
})
export class TelegramModule {}
