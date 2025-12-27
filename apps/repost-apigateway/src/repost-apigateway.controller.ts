import { Controller, Get } from '@nestjs/common';
import { RepostApigatewayService } from './repost-apigateway.service';

@Controller()
export class RepostApigatewayController {
  constructor(
    private readonly repostApigatewayService: RepostApigatewayService,
  ) {}

  @Get('/health')
  getHello(): string {
    return this.repostApigatewayService.getHello();
  }
}
