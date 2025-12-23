import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Patch,
} from '@nestjs/common';
import { CurrentUser } from '@app/common';
import { Observable } from 'rxjs';
import type { UpdateUserRequest, UserResponse } from '@app/dto';
import type { ClientGrpc } from '@nestjs/microservices';

interface UserServiceClient {
  getUserById(data: { id: string }): Observable<UserResponse>;
  updateUser(data: UpdateUserRequest): Observable<UserResponse>;
}

@Controller('user')
export class UserProxyController implements OnModuleInit {
  private svc!: UserServiceClient;
  constructor(@Inject('USER_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.svc = this.client.getService<UserServiceClient>('UserService');
  }

  @Get('user-info')
  getUserInfo(
    @CurrentUser() user: { userId: string },
  ): Observable<UserResponse> {
    return this.svc.getUserById({ id: user.userId });
  }

  @Patch('update-user')
  updateUser(
    @CurrentUser() user: { userId: string },
    @Body() data: UpdateUserRequest,
  ): Observable<UserResponse> {
    return this.svc.updateUser({ ...data, id: user.userId });
  }
}
