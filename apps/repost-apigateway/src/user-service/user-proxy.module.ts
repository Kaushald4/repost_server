import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserProxyController } from './user-proxy.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(process.cwd(), 'proto/user/v1/user.proto'),
          url: '0.0.0.0:8976',
        },
      },
    ]),
  ],
  controllers: [UserProxyController],
})
export class UserProxyModule {}
