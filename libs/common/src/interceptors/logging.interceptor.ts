import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    const now = Date.now();

    if (type === 'http') {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest<Request>();
      const method = request.method;
      const url = request.url;

      return next
        .handle()
        .pipe(
          tap(() => this.logger.log(`${method} ${url} ${Date.now() - now}ms`)),
        );
    } else if (type === 'rpc') {
      const handler = context.getHandler().name;

      return next
        .handle()
        .pipe(
          tap(() => this.logger.log(`RPC ${handler} ${Date.now() - now}ms`)),
        );
    }

    return next.handle();
  }
}
