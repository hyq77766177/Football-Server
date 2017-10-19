"use strict";
/// <reference path="./config.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var mongodb = require("mongodb");
var config_1 = require("./config");
var app_1 = require("./app");
log4js.configure(config_1.config.log4js_conf);
var logger = log4js.getLogger('mongoUtil.js');
var mongoUtil;
(function (mongoUtil) {
    mongoUtil.mongoUrl = "mongodb://" + config_1.config.mongoUser + ":" + config_1.config.mongoPass + "@" + config_1.config.mongoHost + ":" + config_1.config.mongoPort + "/" + config_1.config.mongoDb;
    function insertData(db, col, data, callback) {
        //连接到表 games
        var collection = db.collection(col);
        collection.insert(data, function (err, result) {
            if (err) {
                logger.error('Error:', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.insertData = insertData;
    function myCreatedGames(db, col, openid, callback) {
        var collection = db.collection(col);
        collection.find({ "openid": openid })
            .toArray(function (err, result) {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.myCreatedGames = myCreatedGames;
    function myEnroledGames(db, col, openid, callback) {
        var collection = db.collection(col);
        collection.find({ "referees.openid": openid })
            .toArray(function (err, result) {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.myEnroledGames = myEnroledGames;
    function allGames(db, col, callback) {
        var collection = db.collection(col);
        collection.find()
            .toArray(function (err, result) {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.allGames = allGames;
    /** callback 参数是一个比赛 */
    function queryGameById(db, col, id, callback) {
        var collection = db.collection(col);
        var objId = new mongodb.ObjectId(id);
        var queryData = { "_id": objId };
        collection.find(queryData).toArray(function (err, result) {
            if (err) {
                logger.error('Query by id Error: ', err);
                return;
            }
            callback(result[0]);
        });
    }
    mongoUtil.queryGameById = queryGameById;
    function enrol(db, col, data, callback) {
        logger.debug('mongoUtil.enrol has invoked');
        var collection = db.collection(col);
        var id = new mongodb.ObjectId(data.gameId);
        var document = collection.find({ "_id": id });
        collection.update({
            "_id": id,
        }, {
            "$push": { "referees": data }
        }, {
            upsert: true
        }).catch(function (e) {
            logger.error('update error:', e);
            callback(e);
        });
        callback(null);
    }
    mongoUtil.enrol = enrol;
    function enrolUpdate(db, col, data, callback) {
        logger.debug('mongoUtil.enrolUpdate has been invoked, data: ', data);
        var id = new mongodb.ObjectId(app_1.server.getValue(data, "gameId"));
        var collection = db.collection(col);
        collection.updateOne({
            "_id": id,
            "referees.openid": app_1.server.getValue(data, "openid"),
        }, {
            "$set": {
                "referees.$": data,
            },
        })
            .catch(function (e) {
            logger.error('update pull error:', e);
            callback(e);
        });
        callback(null);
    }
    mongoUtil.enrolUpdate = enrolUpdate;
    function cancelEnrol(db, col, data, callback) {
        logger.debug('mongoUtil.cancelEnrol has been invoked, data: ', data);
        var id = new mongodb.ObjectId(app_1.server.getValue(data, "gameId"));
        var collection = db.collection(col);
        collection.update({
            "_id": id,
        }, {
            "$pull": {
                "referees": {
                    openid: app_1.server.getValue(data, "openid"),
                }
            },
        }).catch(function (e) {
            logger.error('cancel error:', e);
            callback(e);
        });
        callback(null);
    }
    mongoUtil.cancelEnrol = cancelEnrol;
    function assign(db, col, data, callback) {
        logger.debug('mongoUtil.assign has been invoked, data: ', data);
        var id = new mongodb.ObjectId(app_1.server.getValue(data, "gameId"));
        var collection = db.collection(col);
        collection.update({
            "_id": id,
            "referees.openid": app_1.server.getValue(data, 'openid'),
        }, {
            "$set": { "referees.$.assigned": !app_1.server.getValue(data, 'assign') },
        })
            .catch(function (e) {
            logger.error('cancel error:', e);
            callback(e);
        });
        callback(null);
    }
    mongoUtil.assign = assign;
    ;
    function deleteGame(db, col, data, callback) {
        logger.debug('mongo deleteGame has been invoked, data: ', data);
        var id = new mongodb.ObjectId(app_1.server.getValue(data, "gameId"));
        var collection = db.collection(col);
        collection.remove({
            "_id": id,
        }).catch(function (e) {
            logger.error('delete game error: ', e);
            callback(e);
        });
        callback(null);
    }
    mongoUtil.deleteGame = deleteGame;
})(mongoUtil = exports.mongoUtil || (exports.mongoUtil = {}));
//# sourceMappingURL=mongolib.js.map