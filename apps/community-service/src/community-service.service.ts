import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CreateCommunityRequestWithOwnerId } from '@app/dto/community';
import { mapCommunityListToDto } from './mappers/community-list.mapper';
import { mapCommunityToDto } from './mappers/community.mapper';
import {
  CommunityStatus,
  CommunityVisibility,
} from '../generated/prisma/client';

@Injectable()
export class CommunityServiceService {
  constructor(private prisma: PrismaService) {}

  async createCommunity(data: CreateCommunityRequestWithOwnerId) {
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
        description: data.description,
        ownerId: data.ownerId,
        title: data.title,
        ...(data.banner?.url &&
          data.banner?.fileId && {
            banner: {
              create: {
                url: data.banner.url,
                fileId: data.banner.fileId,
              },
            },
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
      },
    });

    return community;
  }

  async getAllCommunities(pagination: {
    limit?: number;
    cursor?: { createdAt: string; id: string };
  }) {
    const { limit = 10, cursor } = pagination;

    const communities = await this.prisma.community.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor
        ? {
            createdAt_id: {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            },
          }
        : undefined,

      where: {
        visibility: {
          in: [CommunityVisibility.PUBLIC, CommunityVisibility.RESTRICTED],
        },
        status: CommunityStatus.ACTIVE,
        isDeleted: false,
      },

      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],

      include: {
        icon: true,
        banner: true,
        rules: true,
        _count: {
          select: {
            members: true,
            moderators: true,
            followers: true,
          },
        },
      },
    });

    let nextCursor: { createdAt: string; id: string } | null = null;

    if (communities.length > limit) {
      const next = communities.pop()!;
      nextCursor = {
        createdAt: next.createdAt.toISOString(),
        id: next.id,
      };
    }

    return {
      communities: communities.map(mapCommunityListToDto),
      nextCursor,
    };
  }

  async getCommunityByName(name: string, userId?: string) {
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

    let viewerContext: Record<string, any> = {
      isMember: false,
      isModerator: false,
      moderatorRole: null,
    };

    if (userId) {
      const member = await this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId,
          },
        },
      });

      const moderator = await this.prisma.communityModerator.findUnique({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId,
          },
        },
      });

      viewerContext = {
        isMember: !!member,
        isModerator: !!moderator,
        moderatorRole: moderator?.role || null,
      };
    }

    return { community: mapCommunityToDto(community), viewerContext };
  }

  async getCommunityMemberShip(communityId: string, userId: string) {
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
    return { ...membership, exists: true };
  }
}
