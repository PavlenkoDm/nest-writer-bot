import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpErrorFilter } from './filters/http-error.filter';

@Module({
  imports: [
    TelegramModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: HttpErrorFilter }],
})
export class AppModule {}
