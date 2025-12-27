import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AuthContextResolver } from './resolver/auth-context.resolver';
import { AuthContextInterceptor } from './interceptors/auth-context.interceptor';

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
    AuthContextInterceptor,
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthContextInterceptor,
    },
  ],
  exports: [AuthContextResolver, AuthContextInterceptor],
})
export class AuthModule {}
