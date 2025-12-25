import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CreateCommunityRequestWithOwnerId } from '@app/dto';

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
}
