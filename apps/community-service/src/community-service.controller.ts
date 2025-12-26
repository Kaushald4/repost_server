import { Controller } from '@nestjs/common';
import { CommunityServiceService } from './community-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { CreateCommunityRequestWithOwnerId } from '@app/dto';

@Controller()
export class CommunityServiceController {
  constructor(
    private readonly communityServiceService: CommunityServiceService,
  ) {}

  @GrpcMethod('CommunityService', 'CreateCommunity')
  createCommunity(data: CreateCommunityRequestWithOwnerId) {
    return this.communityServiceService.createCommunity(data);
  }

  @GrpcMethod('CommunityService', 'GetAllCommunities')
  getAllCommunities() {
    return this.communityServiceService.getAllCommunities();
  }
}
