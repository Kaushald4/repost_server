import { CurrentUser, OptionalAuth } from '@app/common';
import {
  CreateCommunityRequest as CreateCommunityBodyDto,
  UpdateCommunityRequest as UpdateCommunityBodyDto,
} from '@app/dto/community';
import {
  CommunityVisibility,
  MediaAction,
} from '@app/contracts/community/v1/enums';
import type { CommunityServiceClient } from '@app/contracts/community/v1/community';
import type { CommunityPage } from '@app/contracts/community/v1/messages';
import type {
  CreateCommunityRequest as CreateCommunityGrpcRequest,
  CommunityInfoRequest,
  UpdateCommunityRequest as UpdateCommunityGrpcRequest,
} from '@app/contracts/community/v1/requests';
import type { GetAllCommunitiesRequest } from '@app/contracts/community/v1/queries';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { mapCommunityListToDto } from './mappers/community-list.mapper';

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

function mapActionToGrpc(value: string): MediaAction {
  switch (value) {
    case 'keep':
      return MediaAction.MEDIA_ACTION_KEEP;
    case 'update':
      return MediaAction.MEDIA_ACTION_UPDATE;
    case 'delete':
      return MediaAction.MEDIA_ACTION_DELETE;
    default:
      return MediaAction.MEDIA_ACTION_UNSPECIFIED;
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

  @Put('update/:communityId')
  updateCommunity(
    @CurrentUser() user: { userId: string },
    @Param('communityId') communityId: string,
    @Body() data: UpdateCommunityBodyDto,
  ): Observable<any> {
    const request: UpdateCommunityGrpcRequest = {
      communityId,
      userId: user.userId,
      title: data.title,
      description: data.description,
      visibility: mapVisibilityToGrpc(data.visibility),
      icon: data.icon
        ? {
            action: mapActionToGrpc(data.icon.action),
            ...(data.icon.action === 'update'
              ? { url: data.icon.url, fileId: data.icon.fileId }
              : {}),
          }
        : undefined,
      banner: data.banner
        ? {
            action: mapActionToGrpc(data.banner.action),
            ...(data.banner.action === 'update'
              ? { url: data.banner.url, fileId: data.banner.fileId }
              : {}),
          }
        : undefined,
    };

    return this.svc.updateCommunity(request);
  }

  @OptionalAuth()
  @Get('all-communities')
  async getAllCommunities(
    @Query()
    query: {
      limit?: number | string;
      cursor?: { id: string; createdAt: string };
    },
  ) {
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
    const mappedList = mapCommunityListToDto(
      await lastValueFrom(this.svc.getAllCommunities(request)),
    );
    return mappedList;
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
