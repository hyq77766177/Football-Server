"use strict";
/// <reference path="./app.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var mongoDb = require("mongodb");
var log4js = require("log4js");
var config_1 = require("./config");
var mongolib_1 = require("./mongolib");
var errorCode_1 = require("./errorCode");
var util_1 = require("./util");
log4js.configure(config_1.config.log4js_conf);
var logger = log4js.getLogger('game.ts');
var MongoClient = mongoDb.MongoClient;
var DB_CONN_STR = mongolib_1.mongoUtil.mongoUrl;
var Referee = /** @class */ (function () {
    function Referee(data) {
        this.parse(data);
    }
    Referee.prototype.parse = function (data) {
        for (var element in data) {
            var key = element;
            this[element] = util_1.util.getValue(data, key);
        }
    };
    Referee.regist = function (req, res, next) {
        logger.info("incoming referee regist data: ", req.body);
        var document = req.body;
        logger.debug('document: ', document);
        var this_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("referee regist mongo connect success");
            this_db = db;
            return mongolib_1.mongoUtil.insertData(db, config_1.config.refereeCollection, document);
        })
            .then(function (writeRes) {
            logger.info("referee regist insert success");
            this_db.close();
            res.write("referee regist success");
            next();
        })
            .catch(function (err) {
            logger.error("referee regist failed, error: ", err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.refereeRegistError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    };
    return Referee;
}());
exports.Referee = Referee;
//# sourceMappingURL=referee.js.map