import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';
import type { GetUserByIdRequest, UserResponse } from './user.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: GetUserByIdRequest): Promise<UserResponse> {
    const user = await this.userServiceService.getUserById(data.id);
    if (!user) {
      // Handle not found, maybe throw RpcException
      throw new Error('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
      email: user.email,
    };
  }
}
