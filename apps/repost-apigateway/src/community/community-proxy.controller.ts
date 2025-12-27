import { CurrentUser, OptionalAuth } from '@app/common';
import { CreateCommunityRequest as CreateCommunityBodyDto } from '@app/dto/community';
import { CommunityVisibility } from '@app/contracts/community/v1/enums';
import type { CommunityServiceClient } from '@app/contracts/community/v1/community';
import type { CommunityPage } from '@app/contracts/community/v1/messages';
import type {
  CreateCommunityRequest as CreateCommunityGrpcRequest,
  CommunityInfoRequest,
} from '@app/contracts/community/v1/requests';
import type {
  GetAllCommunitiesRequest,
  GetAllCommunitiesResponse,
} from '@app/contracts/community/v1/queries';
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

function mapVisibilityToGrpc(value: string): CommunityVisibility {
  switch (value) {
    case 'PUBLIC':
      return CommunityVisibility.COMMUNITY_VISIBILITY_PUBLIC;
    case 'RESTRICTED':
      return CommunityVisibility.COMMUNITY_VISIBILITY_RESTRICTED;
    case 'PRIVATE':
      return CommunityVisibility.COMMUNITY_VISIBILITY_PRIVATE;
    default:
      return CommunityVisibility.COMMUNITY_VISIBILITY_UNSPECIFIED;
  }
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
    @Body() data: CreateCommunityBodyDto,
  ): Observable<any> {
    const request: CreateCommunityGrpcRequest = {
      name: data.name,
      title: data.title,
      description: data.description,
      ownerId: user.userId,
      visibility: mapVisibilityToGrpc(data.visibility),
      icon:
        data.icon?.url && data.icon?.fileId
          ? {
              url: data.icon.url,
              fileId: data.icon.fileId,
            }
          : undefined,
      banner:
        data.banner?.url && data.banner?.fileId
          ? {
              url: data.banner.url,
              fileId: data.banner.fileId,
            }
          : undefined,
    };

    return this.svc.createCommunity(request);
  }

  @OptionalAuth()
  @Get('all-communities')
  getAllCommunities(
    @Query()
    query: any,
  ): Observable<GetAllCommunitiesResponse> {
    const request: GetAllCommunitiesRequest = {
      limit:
        query.limit === undefined
          ? undefined
          : typeof query.limit === 'string'
            ? Number(query.limit)
            : query.limit,
      cursor: query.cursor?.id
        ? {
            id: query.cursor.id,
            createdAt: query.cursor.createdAt,
          }
        : undefined,
    };

    return this.svc.getAllCommunities(request);
  }

  @OptionalAuth()
  @Get('community-info/:communityName')
  async getCommunityInfo(
    @CurrentUser() user: { userId: string } | undefined,
    @Param('communityName') communityName: string,
  ): Promise<{ community: CommunityPage['community']; viewerContext: any }> {
    const userId = user?.userId;

    const request: CommunityInfoRequest = {
      communityName,
      userId,
    };

    const { community, viewerContext: gRpcViewerContext } = await lastValueFrom(
      this.svc.getCommunityInfo(request),
    );

    const isMember = gRpcViewerContext?.isMember ?? false;
    const isModerator = gRpcViewerContext?.isModerator ?? false;
    const isOwner =
      !!userId && !!community?.ownerId && userId === community.ownerId;

    const role = isOwner
      ? 'OWNER'
      : isModerator
        ? 'MODERATOR'
        : isMember
          ? 'MEMBER'
          : null;

    const viewerContext = {
      isLoggedIn: !!userId,
      isMember,
      role,
      isOwner,
    };

    return { community, viewerContext };
  }
}
