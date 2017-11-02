/// <reference path="./config.ts" />

import * as express from 'express';
import { Routers } from './router';

export namespace server {

  export const app = express();
  Routers.RouterMgr = new Routers(app);

}
