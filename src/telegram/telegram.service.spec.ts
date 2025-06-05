import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { ConfigService } from '@nestjs/config';

jest.mock('telegraf');

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramService, ConfigService],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined telegram_service', () => {
    expect(service).toBeDefined();
  });
});
