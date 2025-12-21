import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { PrismaService } from './prisma.service';
import { UserEventConsumer } from './user-event.consumer';
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
      isGlobal: true,
      envFilePath: './apps/user-service/.env',
    }),
    RedisModule,
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService, PrismaService, UserEventConsumer],
})
export class UserServiceModule {}
