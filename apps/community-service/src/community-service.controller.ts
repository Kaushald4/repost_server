import { Controller } from '@nestjs/common';
import { CommunityServiceService } from './community-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateCommunityRequest } from './community.dto';

@Controller()
export class CommunityServiceController {
  constructor(
    private readonly communityServiceService: CommunityServiceService,
  ) {}

  @GrpcMethod('CommunityService', 'CreateCommunity')
  createCommunity(data: CreateCommunityRequest) {
    // return this.communityServiceService.createCommunity(data);
  }
}
