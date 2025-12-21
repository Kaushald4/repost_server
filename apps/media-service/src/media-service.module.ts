import { Module } from '@nestjs/common';
import { MediaServiceController } from './media-service.controller';
import { MediaServiceService } from './media-service.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    }),
    ConfigModule.forRoot({
      envFilePath: './apps/media-service/.env',
    }),
  ],
  controllers: [MediaServiceController],
  providers: [MediaServiceService, CloudinaryProvider],
})
export class MediaServiceModule {}
