import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { mapCommunityListToDto } from './mappers/community-list.mapper';
import { mapCommunityToDto } from './mappers/community.mapper';
import {
  mapCommunityMemberStatus,
  mapCommunityModeratorRole,
  mapCommunityVisibilityFromContract,
} from './mappers/community.enum-mapper';
import {
  CommunityStatus,
  CommunityVisibility,
} from '../generated/prisma/enums';
import type {
  CommunityInfoRequest,
  CommunityMembershipRequest,
  CreateCommunityRequest,
} from '@app/contracts/community/v1/requests';
import type {
  CommunityMembershipResponse,
  CommunityPage,
  CommunityResponse,
} from '@app/contracts/community/v1/messages';
import type {
  GetAllCommunitiesRequest,
  GetAllCommunitiesResponse,
} from '@app/contracts/community/v1/queries';

@Injectable()
export class CommunityServiceService {
  constructor(private prisma: PrismaService) {}

  async createCommunity(
    data: CreateCommunityRequest,
  ): Promise<CommunityResponse> {
    if (!data.name || !data.ownerId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'name and ownerId are required',
      });
    }

    const existing = await this.prisma.community.findUnique({
      where: { name: data.name },
      select: { id: true },
    });

    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `Community with name ${data.name} already exists`,
      });
    }

    const community = await this.prisma.community.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
        title: data.title ?? '',
        ...(data.visibility !== undefined && {
          visibility: mapCommunityVisibilityFromContract(data.visibility),
        }),
        ...(data.icon?.url &&
          data.icon?.fileId && {
            icon: {
              create: {
                url: data.icon.url,
                fileId: data.icon.fileId,
              },
            },
          }),
        ...(data.banner?.url &&
          data.banner?.fileId && {
            banner: {
              create: {
                url: data.banner.url,
                fileId: data.banner.fileId,
              },
            },
          }),
      },
      include: {
        icon: true,
        banner: true,
        rules: true,
        moderators: true,
        _count: {
          select: {
            members: true,
            followers: true,
          },
        },
      },
    });

    return { community: mapCommunityToDto(community) };
  }

  async getAllCommunities(
    request: GetAllCommunitiesRequest,
  ): Promise<GetAllCommunitiesResponse> {
    const limit = request.limit ?? 10;
    const cursorId = request.cursor?.id;

    const communities = await this.prisma.community.findMany({
      take: limit,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: {
        id: 'desc',
      },
      where: {
        visibility: {
          in: [CommunityVisibility.PUBLIC, CommunityVisibility.RESTRICTED],
        },
        status: CommunityStatus.ACTIVE,
        isDeleted: false,
      },
      include: {
        icon: true,
        banner: true,
        _count: {
          select: {
            members: true,
            followers: true,
          },
        },
      },
    });

    const data = communities.map(mapCommunityListToDto);
    const last = communities.at(-1);

    return {
      communities: data,
      nextCursor: last
        ? {
            id: last.id,
            createdAt: last.createdAt.toISOString(),
          }
        : undefined,
    };
  }

  async getCommunityByName(
    request: CommunityInfoRequest,
  ): Promise<CommunityPage> {
    const name = request.communityName;
    const userId = request.userId;

    if (!name) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'communityName is required',
      });
    }

    const community = await this.prisma.community.findFirst({
      where: {
        name,
        visibility: {
          in: [CommunityVisibility.PUBLIC, CommunityVisibility.RESTRICTED],
        },
        status: CommunityStatus.ACTIVE,
        isDeleted: false,
      },
      include: {
        icon: true,
        banner: true,
        rules: true,
        moderators: true,
        _count: {
          select: {
            members: true,
            followers: true,
          },
        },
      },
    });

    if (!community) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Community with name ${name} not found`,
      });
    }

    const viewerContext: NonNullable<CommunityPage['viewerContext']> = {
      isMember: false,
      isModerator: false,
      moderatorRole: undefined,
    };

    if (userId) {
      const [member, moderator] = await Promise.all([
        this.prisma.communityMember.findUnique({
          where: {
            communityId_userId: {
              communityId: community.id,
              userId,
            },
          },
        }),
        this.prisma.communityModerator.findUnique({
          where: {
            communityId_userId: {
              communityId: community.id,
              userId,
            },
          },
        }),
      ]);

      viewerContext.isMember = !!member;
      viewerContext.isModerator = !!moderator;
      viewerContext.moderatorRole = moderator
        ? mapCommunityModeratorRole(moderator.role)
        : undefined;
    }

    return { community: mapCommunityToDto(community), viewerContext };
  }

  async getCommunityMemberShip(
    request: CommunityMembershipRequest,
  ): Promise<CommunityMembershipResponse> {
    const communityId = request.communityId;
    const userId = request.userId;

    if (!communityId || !userId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'communityId and userId are required',
      });
    }

    const membership = await this.prisma.communityMember.findFirst({
      where: {
        communityId,
        userId,
      },
    });

    if (!membership) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
      id: membership.id,
      communityId: membership.communityId,
      userId: membership.userId,
      status: mapCommunityMemberStatus(membership.status),
      joinedAt: membership.joinedAt.toISOString(),
      leftAt: membership.leftAt?.toISOString(),
      bannedAt: membership.bannedAt?.toISOString(),
    };
  }
}
