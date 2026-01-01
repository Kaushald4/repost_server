import { Module, Global } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AuthContextResolver } from './resolver/auth-context.resolver';
import { AuthGuard } from './guards/auth.guard';

@Global()
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
  providers: [
    AuthContextResolver,
    AuthGuard,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthContextResolver, AuthGuard],
})
export class AuthModule {}
