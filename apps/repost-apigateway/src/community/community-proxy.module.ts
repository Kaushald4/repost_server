import { Module } from '@nestjs/common';
import { CommunityProxyController } from './community-proxy.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COMMUNITY_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'community',
          protoPath: join(process.cwd(), 'proto/community/v1/community.proto'),
          url: '0.0.0.0:8765',
        },
      },
    ]),
  ],
  controllers: [CommunityProxyController],
})
export class CommunityProxyModule {}
