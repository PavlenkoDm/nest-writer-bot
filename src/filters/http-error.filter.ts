import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
// import { rollbar } from 'src/main';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    this.logger.error(
      `HTTP Error: ${status}, Message: ${JSON.stringify(errorResponse)}`,
    );

    if (exception instanceof Error) {
      // rollbar.error('HTTP Error:', exception);
    }

    if (status === HttpStatus.BAD_REQUEST) {
      this.logger.warn('400 Bad Request error from Telegram, keep working...');
      return;
    } else {
      this.logger.warn(
        `HTTP Error: ${response.status}, message: ${response.statusMessage}`,
      );
      return;
    }
  }
}
