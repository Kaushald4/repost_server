import { Controller } from '@nestjs/common';
import { CommunityServiceService } from './community-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CommunityInfoRequestDto,
  CreateCommunityRequestWithOwnerId,
} from '@app/dto/community';

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

  @GrpcMethod('CommunityService', 'GetCommunityInfo')
  getCommunityInfo(data: CommunityInfoRequestDto) {
    return this.communityServiceService.getCommunityByName(data.communityName);
  }
}
