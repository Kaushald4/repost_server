import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), 'proto/user.proto'),
        url: '0.0.0.0:8976',
      },
      bufferLogs: true,
    },
  );

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
}
bootstrap();
