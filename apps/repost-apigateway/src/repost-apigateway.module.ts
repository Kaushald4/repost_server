import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RepostApigatewayController } from './repost-apigateway.controller';
import { RepostApigatewayService } from './repost-apigateway.service';
import { AuthenticationProxyModule } from './authentication/auth-proxy.module';
import { UserProxyModule } from './user-service/user-service.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule, AuthGuard } from '@app/common';
import { LoggerModule } from 'nestjs-pino';
import { CommunityProxyModule } from './community/community-proxy.module';
import { MediaProxyModule } from './media/media.module';

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
      envFilePath: 'apps/repost-apigateway/.env',
    }),
    AuthenticationProxyModule,
    UserProxyModule,
    RedisModule,
    CommunityProxyModule,
    MediaProxyModule,
  ],
  controllers: [RepostApigatewayController],
  providers: [
    RepostApigatewayService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class RepostApigatewayModule {}
