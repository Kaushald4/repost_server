import { CurrentUser, OptionalAuth } from '@app/common';
import type {
  CommunityInfoRequestDto,
  CommunityPageDto,
  CreateCommunityRequest,
  CreateCommunityRequestWithOwnerId,
} from '@app/dto/community';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { from, lastValueFrom } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

interface CommunityServiceClient {
  createCommunity(data: CreateCommunityRequestWithOwnerId): Observable<any>;
  getAllCommunities(data: any): Observable<any>;
  getCommunityInfo(data: CommunityInfoRequestDto): Observable<CommunityPageDto>;
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

  @OptionalAuth()
  @Get('all-communities')
  getAllCommunities(): Observable<any> {
    console.log('Proxy community - getAllCommunities called');
    return this.svc.getAllCommunities({});
  }

  @OptionalAuth()
  @Get('community-info/:communityName')
  async getCommunityInfo(
    @CurrentUser() user: { userId: string },
    @Param() data: CommunityInfoRequestDto,
  ) {
    const userId = user ? user.userId : null;
    const community = await lastValueFrom(this.svc.getCommunityInfo(data));
    console.log(community, 'Community');
    const viewerContext = {
      isLoggedIn: false,
      isMember: false,
      role: null,
    };

    // if (user && user.userId) {
    //   const membership = await this.communityService.getMembership(
    //     community.id,
    //     user.id,
    //   );

    //   viewerContext = {
    //     isLoggedIn: true,
    //     isMember: !!membership,
    //     role: membership?.role ?? null,
    //   };
    // }
    return { community, viewerContext };
  }
}
