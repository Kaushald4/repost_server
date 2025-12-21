import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthenticationProxyController } from './auth-proxy.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'proto/auth/v1/auth.proto'),
          url: '0.0.0.0:50051',
        },
      },
    ]),
  ],
  controllers: [AuthenticationProxyController],
  exports: [ClientsModule],
})
export class AuthenticationProxyModule {}
