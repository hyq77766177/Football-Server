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
var logger = log4js.getLogger('referee');
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
            var filter = { "openid": document.openid };
            var update = document;
            return mongolib_1.mongoUtil.update(db, config_1.config.refereeCollection, filter, update, { upsert: true, });
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
    Referee.showReferee = function (req, res) {
        logger.info("incoming show referee data: ", req.body);
        var data = req.body;
        var this_db = null;
        var response = {};
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("referee show mongo connect success");
            this_db = db;
            return mongolib_1.mongoUtil.queryByOpenId(db, config_1.config.refereeCollection, data.openid);
        })
            .then(function (refereeRes) {
            response['myInfo'] = refereeRes;
            return mongolib_1.mongoUtil.queryMany(this_db, config_1.config.refereeCollection, {});
        })
            .then(function (manyRes) {
            logger.info("referee show query success");
            this_db.close();
            response['refereesInfo'] = manyRes;
            response['isAdmin'] = Referee.adminOpenids.indexOf(data.openid) >= 0;
            res.send(response);
        })
            .catch(function (err) {
            logger.error("referee show failed, error: ", err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.refereeShowError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    };
    Referee.queryRefereeById = function (req, res) {
        logger.info("incoming query referee data: ", req.body);
        var data = req.body;
        var this_db = null;
        var response = {};
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("referee query mongo connect success");
            this_db = db;
            return mongolib_1.mongoUtil.queryById(db, config_1.config.refereeCollection, data.refereeId);
        })
            .then(function (refereeRes) {
            logger.info("referee query success");
            this_db.close();
            response = refereeRes;
            res.send(response);
        })
            .catch(function (err) {
            logger.error("referee query failed, error: ", err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.refereeShowError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    };
    Referee.adminOpenids = [
        "o7TkA0Xr2Kz-xGFxkFU3c56lpmQY",
        "o7TkA0eRYomH4r7M7tE9kUY6RRQs",
    ];
    return Referee;
}());
exports.Referee = Referee;
//# sourceMappingURL=referee.js.map