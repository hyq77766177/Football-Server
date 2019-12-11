import { EggAppConfig, EggAppInfo, PowerPartial, Context } from 'egg'

export interface BizConfig {
  sourceUrl: string
}

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1573541543157_1398'

  config.mongoose = {
    client: {
      url: '', // set in app.ts
      options: {
        useNewUrlParser: true,
        useFindAndModify: false,
      },
    },
  }

  // add your egg config in here
  config.middleware = ['requestLogging', 'authentication', 'throwBizError']

  config.onerror = {
    all(err: any, ctx: Context) {
      if (err.message === 'Validation Failed') {
        ctx.status = ctx.HTTP_STATUS_CODES.BAD_REQUEST
        const resp = {
          data: err.errors,
          errMsg: '请求参数错误',
          status: ctx.helper.errCode.INVALID_PARAM,
        }
        ctx.body = ctx.headers.accept === 'application/json' ? resp : JSON.stringify(resp)
        return
      }
      ctx.status = ctx.HTTP_STATUS_CODES.OK
      ctx.body = {
        errMsg: err.message,
        status: 1,
      }
    },
  }

  config.cors = {
    credentials: true,
    keepHeadersOnError: true,
    origin: (ctx: Context) => ctx.request.get('origin'),
  }

  config.security = {
    csrf: false,
  }

  config.redis = {
    agent: true,
    // other set in app.ts
  }

  config.session = {
    key: 'collina_session',
    renew: true,
  }

  // add your special config in here
  const bizConfig: BizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  }

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  }
}
