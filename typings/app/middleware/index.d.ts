// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportRequestLogging from '../../../app/middleware/requestLogging';
import ExportThrowBizError from '../../../app/middleware/throwBizError';

declare module 'egg' {
  interface IMiddleware {
    requestLogging: typeof ExportRequestLogging;
    throwBizError: typeof ExportThrowBizError;
  }
}
