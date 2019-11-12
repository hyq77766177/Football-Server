import chalk from 'chalk';
import { Context } from 'egg';
import _ from 'lodash';

const throwBizError = () => async (ctx: Context, next: () => Promise<any>) => {
  await next();
  if (ctx.bizErrorCode !== 0) {
    ctx.logger.warn(chalk.yellow('[bizError]'), `code: ${ctx.bizErrorCode}`);
    ctx.body = {
      errMsg: ctx.helper.getErrMsg(ctx.bizErrorCode),
      status: ctx.bizErrorCode,
      data: '',
    };
    ctx.status =
      ctx.bizErrorCode > 600 || ctx.bizErrorCode < 100
        ? // ctx.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR : ctx.bizErrorCode;
          200
        : ctx.bizErrorCode;
  }
};

export default throwBizError;
