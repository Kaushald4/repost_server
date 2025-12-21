import { NestFactory } from '@nestjs/core';
import { MediaServiceModule } from './media-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import { GrpcExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'media',
        protoPath: join(process.cwd(), 'proto/media/v1/media.proto'),
        url: '0.0.0.0:50053',
      },
    },
  );

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
}
bootstrap();
