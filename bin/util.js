"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var _ = require("lodash");
var config_1 = require("./config");
log4js.configure(config_1.config.log4js_conf);
var logger = log4js.getLogger('util.ts');
var util;
(function (util) {
    function getValue(request) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        var result = _.get(request, arg);
        if (result === null || result === undefined) {
            logger.fatal("bad request data, the key is missed or wrong written from path: " + arg.join("=>"));
            throw new Error("bad request data, the key is missed or wrong written from path: " + arg.join("=>"));
        }
        return result;
    }
    util.getValue = getValue;
    // <<<
})(util = exports.util || (exports.util = {}));
//# sourceMappingURL=util.js.map