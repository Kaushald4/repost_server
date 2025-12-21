import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { SUCCESS_MESSAGES } from '../constants/success-messages';

@Injectable()
export class ResponseInterceptor<T = unknown> implements NestInterceptor<
  T,
  any
> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only intercept HTTP requests
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();
        return {
          success: true,
          statusCode: response.statusCode,
          message: SUCCESS_MESSAGES.OPERATION_SUCCESSFUL,
          data: data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
