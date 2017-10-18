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
    function getWXOpenIdUrl(code) {
        return "https://api.weixin.qq.com/sns/jscode2session?appId=" + config.appId + "&secret=" + config.appSecret + "&js_code=" + code + "&grant_type=authorization_code";
    }
    config.getWXOpenIdUrl = getWXOpenIdUrl;
    config.log4js_conf = {
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
    var Log4jsConf = (function () {
        function Log4jsConf() {
        }
        return Log4jsConf;
    }());
    config.Log4jsConf = Log4jsConf;
})(config = exports.config || (exports.config = {}));
//# sourceMappingURL=config.js.map