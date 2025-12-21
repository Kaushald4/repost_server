import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(process.cwd(), 'proto/auth.proto'),
        url: '0.0.0.0:50051',
      },
      bufferLogs: true,
    },
  );

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
}
void bootstrap();
