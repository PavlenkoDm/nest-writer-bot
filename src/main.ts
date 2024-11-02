import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  mapInit,
  saveMapData,
} from './telegram/utils/map-file-saver-loader.utils';
import { FileNameOrderMap } from './telegram/scenes/order-scenes/common-order.abstract';
import { FileNameTelegramService } from './telegram/telegram.service';
import { FileNameJoinMap } from './telegram/scenes/join-scenes/common-join.abstract';
import * as Rollbar from 'rollbar';

export const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  // environment: process.env.NODE_ENV || 'development',
});

export let telegramServiceMap: Map<string, number>;
export let orderScenarioMap: Map<string, number>;
export let joinScenarioMap: Map<string, number>;

async function bootstrap() {
  process.on('uncaughtException', (error) => {
    console.error('Unhandled Error:', error);
    rollbar.error('Unhandled Error:', error);

    saveMapData(
      telegramServiceMap,
      FileNameTelegramService.telegramServiceMapData,
    );
    saveMapData(orderScenarioMap, FileNameOrderMap.orderMapData);
    saveMapData(joinScenarioMap, FileNameJoinMap.joinMapData);

    setTimeout(() => process.exit(1), 500);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    rollbar.error('Unhandled Rejection sended to Rollbar');

    saveMapData(
      telegramServiceMap,
      FileNameTelegramService.telegramServiceMapData,
    );
    saveMapData(orderScenarioMap, FileNameOrderMap.orderMapData);
    saveMapData(joinScenarioMap, FileNameJoinMap.joinMapData);

    setTimeout(() => process.exit(1), 500);
  });

  const initializedTelegramServiceMap = mapInit(
    FileNameTelegramService.telegramServiceMapData,
  );
  const initializedOrderScenarioMap = mapInit(FileNameOrderMap.orderMapData);
  const initializedJoinScenarioMap = mapInit(FileNameJoinMap.joinMapData);

  telegramServiceMap = !!initializedTelegramServiceMap
    ? initializedTelegramServiceMap
    : new Map();

  orderScenarioMap = !!initializedOrderScenarioMap
    ? initializedOrderScenarioMap
    : new Map();

  joinScenarioMap = !!initializedJoinScenarioMap
    ? initializedJoinScenarioMap
    : new Map();

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT, () => {
    rollbar.log('Nest_writers_bot started!');
    console.log(`Server starting... On port: ${process.env.PORT}`);
  });
}

bootstrap();
