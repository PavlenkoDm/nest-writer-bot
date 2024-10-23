import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.on('uncaughtException', (error) => {
    console.error('Unhandled Error:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });

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
