import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { CurrentUser } from '@app/common';
import { Observable } from 'rxjs';
import { UserResponse } from '@app/dto';
import type { ClientGrpc } from '@nestjs/microservices';

interface UserServiceClient {
  getUserById(data: { id: string }): Observable<UserResponse>;
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
}
