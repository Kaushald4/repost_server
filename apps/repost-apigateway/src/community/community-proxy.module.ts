import { Module } from '@nestjs/common';
import { CommunityProxyController } from './community-proxy.controller';

@Module({
  controllers: [CommunityProxyController],
})
export class CommunityProxyModule {}
