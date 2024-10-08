import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Logging
    this.logger.error(
      `HTTP Error: ${status}, Message: ${JSON.stringify(errorResponse)}`,
    );

    // If 400, just keep working
    if (status === HttpStatus.BAD_REQUEST) {
      this.logger.warn('400 Bad Request error from Telegram, keep working...');
      return;
    }

    // For other errors
    response.status(status).json({
      statusCode: status,
      message: errorResponse,
    });
  }
}
