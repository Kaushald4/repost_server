import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';
import type {
  GetUserByIdRequest,
  UpdateUserRequest,
  UserResponse,
} from '@app/dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: GetUserByIdRequest): Promise<UserResponse> {
    const user = await this.userServiceService.getUserById(data.id);
    if (!user) {
      throw new RpcException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || '',
      avatar: user.avatar ?? { fileId: null, url: null },
      bio: user.bio || '',
      email: user.email,
      banner: user.banner ?? { fileId: null, url: null },
      isPrivate: user.isPrivate,
      createdAt: user.createdAt.toISOString(),
      karma: user.karma,
      level: user.level,
      stats: {
        helper: user.stats?.helper || 0,
        debate: user.stats?.debate || 0,
        creative: user.stats?.creative || 0,
      },
      badges:
        user.badges?.map((badge) => ({
          badgeName: badge.badgeName,
          earnedAt: badge.earnedAt.toISOString(),
        })) || [],
      settings: {
        allowDMs: user.settings?.allowDMs ?? true,
        darkMode: user.settings?.darkMode ?? false,
      },
    };
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    const user = await this.userServiceService.updateUser(data);
    if (!user) {
      throw new RpcException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || '',
      avatar: user.avatar ?? { fileId: null, url: null },
      bio: user.bio || '',
      email: user.email,
      banner: user.banner ?? { fileId: null, url: null },
      isPrivate: user.isPrivate,
      createdAt: user.createdAt.toISOString(),
      karma: user.karma,
      level: user.level,
      settings: {
        allowDMs: user.settings?.allowDMs ?? true,
        darkMode: user.settings?.darkMode ?? false,
      },
    };
  }
}
