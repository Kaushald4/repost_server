import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UpdateUserRequest } from '@app/dto';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class UserServiceService {
  constructor(private prisma: PrismaService) {}

  async createUser(userId: string, email: string): Promise<void> {
    console.log('Req Recived');
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      console.log(`User ${userId} already exists, skipping creation`);
      return;
    }

    await this.prisma.user.create({
      data: {
        id: userId,
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        email: email,
      },
    });

    console.log(`User ${userId} created successfully`);
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        avatar: true,
        banner: true,
        settings: true,
        stats: true,
        badges: true,
      },
    });
  }

  async updateUser(data: UpdateUserRequest) {
    const { id, settings, avatar, banner, ...userData } = data;

    if (userData.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: userData.username },
        select: { id: true },
      });

      if (existing && existing.id !== id) {
        throw new Error('Username already taken');
      }
    }

    const updateData: Prisma.UserUpdateInput = {
      ...userData,

      avatar: avatar?.fileId
        ? {
            upsert: {
              create: {
                url: avatar.url,
                fileId: avatar.fileId,
              },
              update: {
                url: avatar.url,
                fileId: avatar.fileId,
              },
            },
          }
        : avatar
          ? { delete: true }
          : undefined,

      banner: banner?.fileId
        ? {
            upsert: {
              create: {
                url: banner.url,
                fileId: banner.fileId,
              },
              update: {
                url: banner.url,
                fileId: banner.fileId,
              },
            },
          }
        : banner
          ? { delete: true }
          : undefined,

      settings: settings
        ? {
            upsert: {
              create: {
                darkMode: settings.darkMode ?? false,
                allowDMs: settings.allowDMs ?? true,
              },
              update: settings,
            },
          }
        : undefined,
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          avatar: true,
          banner: true,
          settings: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new RpcException('Failed to update user');
    }
  }
}
