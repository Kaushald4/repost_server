import { Injectable } from '@nestjs/common';
import { CreateCommunityRequest } from './community.dto';
import { PrismaService } from './prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class CommunityServiceService {
  constructor(private prisma: PrismaService) {}

  async createCommunity(data: CreateCommunityRequest) {
    const { name, title, description } = data;

    const community = await this.prisma.community.findUnique({
      where: { name },
    });

    if (community) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `Community with name ${name} already exists`,
      });
    }

    // upload images
  }
}
