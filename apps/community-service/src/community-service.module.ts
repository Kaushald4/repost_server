import { Module } from '@nestjs/common';
import { CommunityServiceController } from './community-service.controller';
import { CommunityServiceService } from './community-service.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/common';
import { PrismaService } from './prisma.service';
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
      envFilePath: './apps/community-service/.env',
    }),
    RedisModule,
  ],
  controllers: [CommunityServiceController],
  providers: [CommunityServiceService, PrismaService],
})
export class CommunityServiceModule {}
