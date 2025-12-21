import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'proto/auth.proto'),
          url: '0.0.0.0:50051',
        },
      },
    ]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [ClientsModule, AuthenticationService],
})
export class AuthenticationModule {}
