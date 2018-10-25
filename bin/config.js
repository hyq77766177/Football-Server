"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = process.env, SERVER_PORT = _a.SERVER_PORT, MONGO_HOST = _a.MONGO_HOST, MONGO_PORT = _a.MONGO_PORT, MONGO_USER = _a.MONGO_USER, MONGO_PWD = _a.MONGO_PWD, MONGO_DB = _a.MONGO_DB, APP_ID = _a.APP_ID, APP_SECRET = _a.APP_SECRET;
var config;
(function (config) {
    config.port = SERVER_PORT;
    config.appId = APP_ID;
    config.appSecret = APP_SECRET;
    config.mongoHost = MONGO_HOST;
    config.mongoPort = MONGO_PORT;
    config.mongoUser = MONGO_USER;
    config.mongoPass = MONGO_PWD;
    config.mongoDb = MONGO_DB;
    /** 微信openid的url获取方法 */
    function getWXOpenIdUrl(code) {
        return "https://api.weixin.qq.com/sns/jscode2session?appId=" + config.appId + "&secret=" + config.appSecret + "&js_code=" + code + "&grant_type=authorization_code";
    }
    config.getWXOpenIdUrl = getWXOpenIdUrl;
    config.gameCollection = "games";
    config.refereeCollection = "referees";
    config.log4js_conf = {
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
    config.admins = [
        "o7TkA0Xr2Kz-xGFxkFU3c56lpmQY",
        "o7TkA0eRYomH4r7M7tE9kUY6RRQs",
        "o7TkA0TLrrnpBAU6PAC-Ka9cGvWc",
        "o7TkA0dDhh__AE15mlTHXmDmLHdM",
    ];
})(config = exports.config || (exports.config = {}));
//# sourceMappingURL=config.js.map