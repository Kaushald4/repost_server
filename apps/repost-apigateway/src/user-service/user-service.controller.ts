import { Controller, Get } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { CurrentUser } from '@app/common';
import { Observable } from 'rxjs';
import { UserResponse } from './dto/user.dto';

@Controller('user')
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @Get('user-info')
  getUserInfo(
    @CurrentUser() user: { userId: string },
  ): Observable<UserResponse> {
    return this.userServiceService.getUser(user.userId);
  }
}
