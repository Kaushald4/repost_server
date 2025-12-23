import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UpdateUserRequest } from '@app/dto';

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
      },
    });
  }

  async updateUser(data: UpdateUserRequest) {
    const { id, settings, ...userData } = data;

    // If username is being updated, check if it's already taken
    if (userData.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: userData.username },
      });
      if (existingUser && existingUser.id !== id) {
        throw new Error('Username already taken');
      }
    }

    const dataToUpdate: Record<string, unknown> = { ...userData };

    if (userData.avatar?.fileId) {
      dataToUpdate['avatar'] = {
        upsert: {
          create: { url: userData.avatar.url, fileId: userData.avatar.fileId },
          update: { url: userData.avatar.url, fileId: userData.avatar.fileId },
        },
      };
    } else if (!userData.avatar?.fileId) {
      dataToUpdate['avatar'] = {
        url: null,
        fileId: null,
      };
    }

    if (userData.banner?.fileId) {
      dataToUpdate['banner'] = {
        upsert: {
          create: { url: userData.banner.url, fileId: userData.banner.fileId },
          update: { url: userData.banner.url, fileId: userData.banner.fileId },
        },
      };
    } else if (!userData.banner?.fileId) {
      dataToUpdate['banner'] = {
        url: null,
        fileId: null,
      };
    }

    if (settings) {
      userData['settings'] = {
        upsert: {
          create: {
            darkMode: settings.darkMode ?? false,
            allowDMs: settings.allowDMs ?? true,
          },
          update: settings,
        },
      };
    }

    // Update user and settings in a transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: dataToUpdate,
        include: {
          avatar: true,
          banner: true,
          settings: true,
        },
      });

      return tx.user.findUnique({
        where: { id },
        include: {
          avatar: true,
          banner: true,
          settings: true,
        },
      });
    });
  }
}
