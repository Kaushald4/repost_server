import { CurrentUser, OptionalAuth } from '@app/common';
import type {
  CommunityInfoRequestDto,
  CommunityInfoResponseDto,
  CommunityMembershipResponseDto,
  CreateCommunityRequest,
  CreateCommunityRequestWithOwnerId,
  GetCommunityMembershipRequestDto,
} from '@app/dto/community';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface CommunityServiceClient {
  createCommunity(data: CreateCommunityRequestWithOwnerId): Observable<any>;
  getAllCommunities(data: {
    limit?: number;
    cursor?: { createdAt: string; id: string };
  }): Observable<any>;
  getCommunityInfo(
    data: CommunityInfoRequestDto,
  ): Observable<CommunityInfoResponseDto>;
  getCommunityMembership(
    data: GetCommunityMembershipRequestDto,
  ): Observable<CommunityMembershipResponseDto>;
}

@Controller('community')
export class CommunityProxyController {
  private svc!: CommunityServiceClient;

  constructor(@Inject('COMMUNITY_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.svc =
      this.client.getService<CommunityServiceClient>('CommunityService');
  }

  @Post('create')
  createCommunity(
    @CurrentUser() user: { userId: string },
    @Body() data: CreateCommunityRequest,
  ): Observable<any> {
    return this.svc.createCommunity({
      ...data,
      ownerId: user.userId,
    });
  }

  @OptionalAuth()
  @Get('all-communities')
  getAllCommunities(
    @Query()
    query: {
      limit?: number;
      cursor?: { createdAt: string; id: string };
    },
  ): Observable<any> {
    return this.svc.getAllCommunities(query);
  }

  @OptionalAuth()
  @Get('community-info/:communityName')
  async getCommunityInfo(
    @CurrentUser() user: { userId: string },
    @Param() data: CommunityInfoRequestDto,
  ) {
    const userId = user ? user.userId : null;
    const { community, viewerContext: gRpcViewerContext } = await lastValueFrom(
      this.svc.getCommunityInfo({ ...data, userId: userId ?? undefined }),
    );

    const viewerContext = {
      isLoggedIn: !!userId,
      isMember: gRpcViewerContext?.isMember ?? false,
      role: gRpcViewerContext?.moderatorRole ?? null,
      isOwner: userId === community.ownerId,
    };

    return { community, viewerContext };
  }
}
