import * as log4js from 'log4js';
import * as _ from 'lodash';

import { config } from './config'

log4js.configure(config.log4js_conf);
const logger = log4js.getLogger('util.ts');

export namespace util {

  // getValue 相关 >>>
  export function getValue<T, K1 extends keyof T>(request: T, key1: K1): T[K1]
  export function getValue<T, K1 extends keyof T, K2 extends keyof T[K1]>(request: T, key1: K1, key2?: K2): T[K1][K2]
  export function getValue(request: any, ...arg) {
    let result = _.get(request, arg);
    if (result === null || result === undefined) {
      logger.fatal(`bad request data, the key is missed or wrong written from path: ${arg.join("=>")}`);
      throw new Error(`bad request data, the key is missed or wrong written from path: ${arg.join("=>")}`);
    }
    return result;
  }
  // <<<

}
