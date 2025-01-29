import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { exceptionFilterSetup } from './exception-filter.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  exceptionFilterSetup(app);
}
