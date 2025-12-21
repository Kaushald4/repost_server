import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

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
    });
  }
}
