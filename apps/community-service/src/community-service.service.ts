import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CreateCommunityRequestWithOwnerId } from '@app/dto/community';
import { mapCommunityListToDto } from './mappers/community-list.mapper';
import { mapCommunityToDto } from './mappers/community.mapper';

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

  async getAllCommunities() {
    const communities = await this.prisma.community.findMany({
      where: {
        visibility: { in: ['PUBLIC', 'RESTRICTED'] },
        status: 'ACTIVE',
        isDeleted: false,
      },
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

    const data = communities.map(mapCommunityListToDto);
    return { communities: data, total: data.length };
  }

  async getCommunityByName(name: string) {
    const community = await this.prisma.community.findFirst({
      where: {
        name,
        visibility: { in: ['PUBLIC', 'RESTRICTED'] },
        status: 'ACTIVE',
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
    console.log(mapCommunityToDto(community), 'as');
    return mapCommunityToDto(community);
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
