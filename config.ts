import * as log4js from 'log4js'
export namespace config {

  export const port = 8012;
  export const appId = 'wx9b38dcab2de2fd02';
  export const appSecret = 'e8db9dff4ce17f7712aacadc9fe5df5e';
  export const mongoHost = '127.0.0.1';
  export const mongoPort = '27017';
  export const mongoUser = 'sorayama';
  export const mongoPass = 'sorayama';
  export const mongoDb = 'football';

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
      },
    },
    categories: {
      default: {
        appenders: ['app'],
        level: 'debug'
      },
    },
    pm2: true,
    pm2InstanceVar: "football",
  };

  export const admins = [
    "o7TkA0Xr2Kz-xGFxkFU3c56lpmQY", // 我
    "o7TkA0eRYomH4r7M7tE9kUY6RRQs", // 王硕
    "o7TkA0TLrrnpBAU6PAC-Ka9cGvWc", // wsy
    "o7TkA0dDhh__AE15mlTHXmDmLHdM", // dsb
  ];
}
