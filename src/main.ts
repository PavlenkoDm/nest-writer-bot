import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  mapInit,
  saveMapData,
} from './telegram/utils/map-file-saver-loader.utils';
import { FileNameOrderMap } from './telegram/scenes/order-scenes/common-order.abstract';
import { FileNameTelegramService } from './telegram/telegram.service';
import { FileNameJoinMap } from './telegram/scenes/join-scenes/common-join.abstract';

export let telegramServiceMap: Map<string, number>;
export let orderScenarioMap: Map<string, number>;
export let joinScenarioMap: Map<string, number>;

async function bootstrap() {
  process.on('uncaughtException', (error) => {
    console.error('Unhandled Error:', error);

    saveMapData(
      telegramServiceMap,
      FileNameTelegramService.telegramServiceMapData,
    );
    saveMapData(orderScenarioMap, FileNameOrderMap.orderMapData);
    saveMapData(joinScenarioMap, FileNameJoinMap.joinMapData);

    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);

    saveMapData(
      telegramServiceMap,
      FileNameTelegramService.telegramServiceMapData,
    );
    saveMapData(orderScenarioMap, FileNameOrderMap.orderMapData);
    saveMapData(joinScenarioMap, FileNameJoinMap.joinMapData);

    process.exit(1);
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
  await app.listen(process.env.PORT);
}

bootstrap();

// import * as cluster from 'node:cluster';
// //import { cpus } from 'os';

// const customCluster = cluster as any;

// if (customCluster.isPrimary) {
//   //const numCPUs = cpus().length;
//   console.log(`Master process is running. Forking ${3} workers...`);

//   for (let i = 0; i < 3; i++) {
//     customCluster.fork();
//   }

//   customCluster.on('exit', (worker: any) => {
//     console.log(`Worker ${worker.process.pid} died. Restarting...`);
//     customCluster.fork();
//   });
// } else {
//   bootstrap(); // Каждый воркер запускает NestJS приложение
// }
