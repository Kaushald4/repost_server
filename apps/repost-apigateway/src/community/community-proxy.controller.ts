import { CurrentUser } from '@app/common';
import type {
  CreateCommunityRequest,
  CreateCommunityRequestWithOwnerId,
} from '@app/dto';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs/internal/Observable';

interface CommunityServiceClient {
  createCommunity(data: CreateCommunityRequestWithOwnerId): Observable<any>;
  getAllCommunities(): Observable<any>;
}

@Controller('community')
export class CommunityProxyController {
  private svc!: CommunityServiceClient;

  constructor(@Inject('COMMUNITY_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.svc =
      this.client.getService<CommunityServiceClient>('CommunityService');
  }

  @Post('create')
  createCommunity(
    @CurrentUser() user: { userId: string },
    @Body() data: CreateCommunityRequest,
  ): Observable<any> {
    return this.svc.createCommunity({
      ...data,
      ownerId: user.userId,
    });
  }

  @Get('all-communities')
  getAllCommunities(): Observable<any> {
    return this.svc.getAllCommunities();
  }
}
