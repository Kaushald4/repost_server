import { NestFactory } from '@nestjs/core';
import { CommunityServiceModule } from './community-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import { GrpcExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommunityServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'community.v1',
        protoPath: join(process.cwd(), 'proto/community/v1/community.proto'),
        url: '0.0.0.0:8765',
        loader: {
          includeDirs: [join(process.cwd(), 'proto')],
        },
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
