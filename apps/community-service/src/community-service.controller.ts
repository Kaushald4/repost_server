import { Controller } from '@nestjs/common';
import { CommunityServiceService } from './community-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CommunityInfoRequest,
  CommunityMembershipRequest,
  CreateCommunityRequest,
} from '@app/contracts/community/v1/requests';
import type {
  GetAllCommunitiesRequest,
  GetAllCommunitiesResponse,
} from '@app/contracts/community/v1/queries';
import type {
  CommunityMembershipResponse,
  CommunityPage,
  CommunityResponse,
} from '@app/contracts/community/v1/messages';

@Controller()
export class CommunityServiceController {
  constructor(
    private readonly communityServiceService: CommunityServiceService,
  ) {}

  @GrpcMethod('CommunityService', 'CreateCommunity')
  createCommunity(data: CreateCommunityRequest): Promise<CommunityResponse> {
    return this.communityServiceService.createCommunity(data);
  }

  @GrpcMethod('CommunityService', 'GetAllCommunities')
  getAllCommunities(
    data: GetAllCommunitiesRequest,
  ): Promise<GetAllCommunitiesResponse> {
    return this.communityServiceService.getAllCommunities(data);
  }

  @GrpcMethod('CommunityService', 'GetCommunityInfo')
  getCommunityInfo(data: CommunityInfoRequest): Promise<CommunityPage> {
    return this.communityServiceService.getCommunityByName(data);
  }

  @GrpcMethod('CommunityService', 'GetCommunityMembership')
  getCommunityMembership(
    data: CommunityMembershipRequest,
  ): Promise<CommunityMembershipResponse> {
    return this.communityServiceService.getCommunityMemberShip(data);
  }
}
