import { Test, TestingModule } from '@nestjs/testing';
import { CommunityServiceService } from './community-service.service';

describe('CommunityServiceService', () => {
  let service: CommunityServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityServiceService],
    }).compile();

    service = module.get<CommunityServiceService>(CommunityServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
