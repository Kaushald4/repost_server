import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';
import { ERROR_MESSAGES } from '../constants/error-messages';

interface GrpcError {
  code: number;
  details: string;
  message?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as { message: string | string[] }).message;
      }

      errorName = exception.name;
    } else if (this.isGrpcError(exception)) {
      const grpcCode = Number(exception.code);
      status = this.mapGrpcStatusToHttp(grpcCode);
      message = exception.details || exception.message || message;
      errorName = 'GrpcError';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    // Handle array of errors (e.g. class-validator)
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      statusCode: status,
      message: message,
      error: errorName,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `Http Status: ${status} Error Message: ${JSON.stringify(message)} Exception: ${JSON.stringify(exception)}`,
    );

    response.status(status).json(errorResponse);
  }

  private isGrpcError(exception: unknown): exception is GrpcError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      'details' in exception
    );
  }

  private mapGrpcStatusToHttp(code: number): number {
    switch (code) {
      case 2: // UNKNOWN
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 3:
        return HttpStatus.BAD_REQUEST; // INVALID_ARGUMENT
      case 5:
        return HttpStatus.NOT_FOUND; // NOT_FOUND
      case 6:
        return HttpStatus.CONFLICT; // ALREADY_EXISTS
      case 7:
        return HttpStatus.FORBIDDEN; // PERMISSION_DENIED
      case 16:
        return HttpStatus.UNAUTHORIZED; // UNAUTHENTICATED
      case 13:
        return HttpStatus.INTERNAL_SERVER_ERROR; // INTERNAL
      case 14:
        return HttpStatus.SERVICE_UNAVAILABLE; // UNAVAILABLE
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
