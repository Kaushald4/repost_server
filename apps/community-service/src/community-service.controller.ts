import { Controller } from '@nestjs/common';
import { CommunityServiceService } from './community-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CommunityInfoRequest,
  CommunityMembershipRequest,
  CreateCommunityRequest,
  JoinCommunityRequest,
  LeaveCommunityRequest,
  UpdateCommunityRequest,
} from '@app/contracts/community/v1/requests';
import type {
  GetAllCommunitiesRequest,
  GetAllCommunitiesResponse,
} from '@app/contracts/community/v1/queries';
import type {
  CommunityMembershipResponse,
  CommunityPage,
  CommunityResponse,
  JoinCommunityResponse,
  LeaveCommunityResponse,
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

  @GrpcMethod('CommunityService', 'UpdateCommunity')
  updateCommunity(data: UpdateCommunityRequest): Promise<CommunityResponse> {
    return this.communityServiceService.updateCommunity(data);
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

  @GrpcMethod('CommunityService', 'JoinCommunity')
  joinCommunity(data: JoinCommunityRequest): Promise<JoinCommunityResponse> {
    return this.communityServiceService.joinCommunity(data);
  }

  @GrpcMethod('CommunityService', 'LeaveCommunity')
  leaveCommunity(data: LeaveCommunityRequest): Promise<LeaveCommunityResponse> {
    return this.communityServiceService.leaveCommunity(data);
  }
}
