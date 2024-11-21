import { Test, TestingModule } from '@nestjs/testing';
import { DbClientService } from './dbclient.service';

describe('DbclientService', () => {
  let service: DbClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbClientService],
    }).compile();

    service = module.get<DbClientService>(DbClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
