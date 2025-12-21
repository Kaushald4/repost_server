import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { UserResponse } from './dto/user.dto';

interface UserServiceClient {
  getUserById(data: { id: string }): Observable<UserResponse>;
}

@Injectable()
export class UserServiceService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(@Inject('USER_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  getUser(id: string): Observable<UserResponse> {
    return this.userService.getUserById({ id });
  }
}
