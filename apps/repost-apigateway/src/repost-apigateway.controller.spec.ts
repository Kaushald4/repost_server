import { Test, TestingModule } from '@nestjs/testing';
import { RepostApigatewayController } from './repost-apigateway.controller';
import { RepostApigatewayService } from './repost-apigateway.service';

describe('RepostApigatewayController', () => {
  let repostApigatewayController: RepostApigatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RepostApigatewayController],
      providers: [RepostApigatewayService],
    }).compile();

    repostApigatewayController = app.get<RepostApigatewayController>(
      RepostApigatewayController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(repostApigatewayController.getHello()).toBe('Hello World!');
    });
  });
});
