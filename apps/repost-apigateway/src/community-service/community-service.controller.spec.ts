import { Test, TestingModule } from '@nestjs/testing';
import { CommunityServiceController } from './community-service.controller';

describe('CommunityServiceController', () => {
  let controller: CommunityServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityServiceController],
    }).compile();

    controller = module.get<CommunityServiceController>(
      CommunityServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
