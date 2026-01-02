import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  CommunityMemberStatus,
  CommunityStatus,
  CommunityVisibility,
} from '../generated/prisma/enums';
import { MediaAction } from '@app/contracts/community/v1/enums';
import type {
  CommunityInfoRequest,
  CommunityMembershipRequest,
  CreateCommunityRequest,
  JoinCommunityRequest,
  UpdateCommunityRequest,
} from '@app/contracts/community/v1/requests';
import type {
  CommunityMembershipResponse,
  CommunityPage,
  CommunityResponse,
  JoinCommunityResponse,
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

  async updateCommunity(
    data: UpdateCommunityRequest,
  ): Promise<CommunityResponse> {
    if (!data.communityId || !data.userId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'communityId and userId are required',
      });
    }

    const existing = await this.prisma.community.findUnique({
      where: { id: data.communityId },
      select: { id: true, ownerId: true },
    });

    if (!existing) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Community with id ${data.communityId} not found`,
      });
    }

    if (existing.ownerId !== data.userId) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Only the owner can update the community',
      });
    }

    const updateData: Record<any, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.visibility !== undefined) {
      updateData.visibility = mapCommunityVisibilityFromContract(
        data.visibility,
      );
    }

    if (data.icon) {
      switch (data.icon.action) {
        case MediaAction.MEDIA_ACTION_UPDATE:
          if (data.icon.url && data.icon.fileId) {
            updateData.icon = {
              upsert: {
                create: {
                  url: data.icon.url,
                  fileId: data.icon.fileId,
                },
                update: {
                  url: data.icon.url,
                  fileId: data.icon.fileId,
                },
              },
            };
          }
          break;
        case MediaAction.MEDIA_ACTION_DELETE:
          updateData.icon = {
            delete: true,
          };
          break;
        case MediaAction.MEDIA_ACTION_KEEP:
          // Do nothing
          break;
      }
    }

    if (data.banner) {
      switch (data.banner.action) {
        case MediaAction.MEDIA_ACTION_UPDATE:
          if (data.banner.url && data.banner.fileId) {
            updateData.banner = {
              upsert: {
                create: {
                  url: data.banner.url,
                  fileId: data.banner.fileId,
                },
                update: {
                  url: data.banner.url,
                  fileId: data.banner.fileId,
                },
              },
            };
          }
          break;
        case MediaAction.MEDIA_ACTION_DELETE:
          updateData.banner = {
            delete: true,
          };
          break;
        case MediaAction.MEDIA_ACTION_KEEP:
          // Do nothing
          break;
      }
    }

    const community = await this.prisma.community.update({
      where: { id: data.communityId },
      data: updateData,
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

  async joinCommunity(
    data: JoinCommunityRequest,
  ): Promise<JoinCommunityResponse> {
    console.log(data, 'community');
    const community = await this.prisma.community.findUnique({
      where: { id: data.communityId },
    });

    if (!community || community.isDeleted) {
      throw new NotFoundException('Community not found');
    }

    // Check existing membership
    const existing = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: data.communityId!,
          userId: data.userId!,
        },
      },
    });

    if (existing?.status === CommunityMemberStatus.BANNED) {
      if (!existing.bannedUntil || existing.bannedUntil > new Date()) {
        throw new ForbiddenException('You are banned');
      }
    }

    if (community.visibility === CommunityVisibility.PRIVATE) {
      throw new ForbiddenException('Private community – invite required');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      let status: CommunityMemberStatus = CommunityMemberStatus.ACTIVE;

      if (community.visibility === CommunityVisibility.RESTRICTED) {
        status = CommunityMemberStatus.PENDING;
      }

      await tx.communityMember.upsert({
        where: {
          communityId_userId: {
            communityId: data.communityId!,
            userId: data.userId!,
          },
        },
        update: {
          status,
          joinedAt: now,
          leftAt: null,
          bannedAt: null,
          bannedUntil: null,
        },
        create: {
          communityId: data.communityId!,
          userId: data.userId!,
          status,
          joinedAt: now,
        },
      });

      await tx.communityMemberHistory.create({
        data: {
          communityId: data.communityId!,
          userId: data.userId!,
          joinedAt: now,
          reason: 'JOINED',
        },
      });

      return { success: true };
    });
  }
}
