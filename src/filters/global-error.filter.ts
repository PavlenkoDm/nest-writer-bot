import { ExceptionFilter, Catch, Logger } from '@nestjs/common';
import { rollbar } from 'src/main';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  catch(exception: unknown) {
    this.logger.error('GF Error:', exception);

    if (exception instanceof Error) {
      this.logger.error('GF Critical Error, keep working...', exception);
      rollbar.error('GF Critical Error, keep working...', exception);

      return;
    }

    return;
  }
}
