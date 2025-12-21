import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MediaController } from './media.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(process.cwd(), 'proto/media.proto'),
          url: '0.0.0.0:50053',
        },
      },
    ]),
  ],
  controllers: [MediaController],
})
export class MediaModule {}
