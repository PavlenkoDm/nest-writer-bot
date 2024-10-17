import { ExceptionFilter, Catch, Logger } from '@nestjs/common';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  catch(exception: unknown) {
    this.logger.error('Error:', exception);

    if (exception instanceof Error && exception.message.includes('Critical')) {
      this.logger.error('Critical error, keep working...');

      return;
    }

    return;
  }
}
