import { ExceptionFilter, Catch, Logger } from '@nestjs/common';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  catch(exception: unknown) {
    this.logger.error('GF Error:', exception);

    if (exception instanceof Error && exception.message.includes('Critical')) {
      this.logger.error('GF Critical Error, keep working...');

      return;
    }

    return;
  }
}
