import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

interface RpcErrorObject {
  code: number;
  message?: string;
  details?: string;
  [key: string]: unknown;
}

@Catch()
export class GrpcExceptionFilter implements RpcExceptionFilter<unknown> {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<any> {
    let error: unknown;

    if (exception instanceof RpcException) {
      error = exception.getError();
    } else if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const response = exception.getResponse();

      let message: string | string[] = exception.message;
      if (typeof response === 'string') {
        message = response;
      } else if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        message = (response as { message: string | string[] }).message;
      }

      let code = status.INTERNAL;
      const statusNum = Number(httpStatus);

      if (statusNum === (HttpStatus.BAD_REQUEST as number))
        code = status.INVALID_ARGUMENT;
      else if (statusNum === (HttpStatus.NOT_FOUND as number))
        code = status.NOT_FOUND;
      else if (statusNum === (HttpStatus.CONFLICT as number))
        code = status.ALREADY_EXISTS;
      else if (statusNum === (HttpStatus.FORBIDDEN as number))
        code = status.PERMISSION_DENIED;
      else if (statusNum === (HttpStatus.UNAUTHORIZED as number))
        code = status.UNAUTHENTICATED;

      error = {
        code,
        message: Array.isArray(message) ? message.join(', ') : message,
      };
    } else {
      const errorMessage =
        exception instanceof Error ? exception.message : 'Unknown error';
      const errorStack =
        exception instanceof Error ? exception.stack : undefined;

      this.logger.error(
        `Non-RPC Exception caught: ${errorMessage}`,
        errorStack,
      );
      error = {
        code: status.INTERNAL,
        message: errorMessage || 'Internal server error',
      };
    }

    let rpcError: RpcErrorObject;

    if (typeof error === 'string') {
      rpcError = { code: status.INTERNAL, details: error };
    } else if (typeof error === 'object' && error !== null) {
      const errObj = error as Record<string, unknown>;
      rpcError = {
        code: typeof errObj.code === 'number' ? errObj.code : status.INTERNAL,
        ...errObj,
      } as RpcErrorObject;

      // If it has 'message' but not 'details', map it
      if ('message' in errObj && !('details' in errObj)) {
        rpcError.details = errObj.message as string;
      }
    } else {
      rpcError = { code: status.INTERNAL, details: 'Unknown error' };
    }

    this.logger.error(`Returning RPC Error: ${JSON.stringify(rpcError)}`);
    return throwError(() => rpcError);
  }
}
