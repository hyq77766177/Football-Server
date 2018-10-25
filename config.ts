import * as log4js from 'log4js'

const {
  SERVER_PORT,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PWD,
  MONGO_DB,
  APP_ID,
  APP_SECRET,
} = process.env
export namespace config {

  export const port = SERVER_PORT;
  export const appId = APP_ID;
  export const appSecret = APP_SECRET;
  export const mongoHost = MONGO_HOST;
  export const mongoPort = MONGO_PORT;
  export const mongoUser = MONGO_USER;
  export const mongoPass = MONGO_PWD;
  export const mongoDb = MONGO_DB;

  /** 微信openid的url获取方法 */
  export function getWXOpenIdUrl(code: string) {
    return `https://api.weixin.qq.com/sns/jscode2session?appId=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`;
  }

  export const gameCollection = "games";
  export const refereeCollection = "referees";

  export const log4js_conf: log4js.Configuration = {
    appenders: {
      app: {
        type: 'console',
        layout: {
          type: 'colored'
        },
      },
      verbose: {
        type: 'file',
        filename: './log/verbose.log',
        maxLogSize: 10485760,
        layout: {
          type: 'colored'
        },
      },
    },
    categories: {
      default: {
        appenders: ['app', 'verbose'],
        level: 'debug'
      },
    },
  };

  export const admins = [
    "o7TkA0Xr2Kz-xGFxkFU3c56lpmQY", // 我
    "o7TkA0eRYomH4r7M7tE9kUY6RRQs", // 王硕
    "o7TkA0TLrrnpBAU6PAC-Ka9cGvWc", // wsy
    "o7TkA0dDhh__AE15mlTHXmDmLHdM", // dsb
  ];
}
