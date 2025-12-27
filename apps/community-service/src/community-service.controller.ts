import { Controller } from '@nestjs/common';
import { CommunityServiceService } from './community-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CommunityInfoRequestDto,
  CreateCommunityRequestWithOwnerId,
  GetCommunityMembershipRequestDto,
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
  getAllCommunities(data: {
    limit?: number;
    cursor?: { createdAt: string; id: string };
  }) {
    return this.communityServiceService.getAllCommunities(data);
  }

  @GrpcMethod('CommunityService', 'GetCommunityInfo')
  getCommunityInfo(data: CommunityInfoRequestDto) {
    return this.communityServiceService.getCommunityByName(
      data.communityName,
      data.userId,
    );
  }

  @GrpcMethod('CommunityService', 'GetCommunityMembership')
  getCommunityMembership(data: GetCommunityMembershipRequestDto) {
    return this.communityServiceService.getCommunityMemberShip(
      data.communityId,
      data.userId,
    );
  }
}
