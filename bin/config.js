"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config;
(function (config) {
    config.port = 8012;
    config.appId = 'wx9b38dcab2de2fd02';
    config.appSecret = 'e8db9dff4ce17f7712aacadc9fe5df5e';
    config.mongoHost = '127.0.0.1';
    config.mongoPort = '27017';
    config.mongoUser = 'sorayama';
    config.mongoPass = 'sorayama';
    config.mongoDb = 'football';
    config.log4js_conf = {
        appenders: {
            app: {
                type: 'console',
            }
        },
        categories: {
            default: {
                appenders: ['app'],
                level: 'debug'
            },
        },
        pm2: true,
    };
})(config = exports.config || (exports.config = {}));
//# sourceMappingURL=config.js.map