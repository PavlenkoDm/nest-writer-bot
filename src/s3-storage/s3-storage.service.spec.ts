import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageService } from './s3-storage.service';
import { ConfigService } from '@nestjs/config';

describe('S3StorageService', () => {
  let service: S3StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3StorageService, ConfigService],
    }).compile();

    service = module.get<S3StorageService>(S3StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
