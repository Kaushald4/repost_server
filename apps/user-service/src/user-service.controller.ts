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
      avatar: user.avatar ?? { fileId: '', url: '' },
      bio: user.bio || '',
      email: user.email,
      banner: user.banner ?? { fileId: '', url: '' },
      isPrivate: user.isPrivate,
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
      avatar: user.avatar ?? { fileId: '', url: '' },
      bio: user.bio || '',
      email: user.email,
      banner: user.banner ?? { fileId: '', url: '' },
      isPrivate: user.isPrivate,
    };
  }
}
