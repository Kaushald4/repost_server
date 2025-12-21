import { NestFactory } from '@nestjs/core';
import { RepostApigatewayModule } from './repost-apigateway.module';
import {
  GrpcExceptionFilter,
  HttpExceptionFilter,
  ResponseInterceptor,
} from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(RepostApigatewayModule, {
    bufferLogs: true,
  });

  app.enableCors();
  app.setGlobalPrefix('/api/v1');
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor<any>());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.port ?? 3002);
}
bootstrap();
