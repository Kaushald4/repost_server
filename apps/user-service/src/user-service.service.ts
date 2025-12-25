import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MediaDto, UpdateUserRequest } from '@app/dto';
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
    const { id, avatar, banner, settings, ...userData } = data;

    if (userData.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: userData.username },
        select: { id: true },
      });

      if (existing && existing.id !== id) {
        throw new Error('Username already taken');
      }
    }

    function mediaToPrisma(media?: MediaDto) {
      if (!media || media.action === 'keep') return undefined;

      if (media.action === 'delete') {
        return { delete: true };
      }

      return {
        upsert: {
          create: {
            fileId: media.fileId,
            url: media.url,
          },
          update: {
            fileId: media.fileId,
            url: media.url,
          },
        },
      };
    }

    const updateData: Prisma.UserUpdateInput = {
      ...userData,
      avatar: mediaToPrisma(avatar),
      banner: mediaToPrisma(banner),
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

    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        avatar: true,
        banner: true,
        settings: true,
      },
    });
  }
}
