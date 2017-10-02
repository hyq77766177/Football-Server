"use strict";
/// <reference path="./config.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var mongodb = require("mongodb");
var config_1 = require("./config");
log4js.configure(config_1.config.log4js_conf);
var logger = log4js.getLogger('mongoUtil.js');
var mongoUtil;
(function (mongoUtil) {
    /**
     * insert data to db.col
     * @param {mongodb.Db} db
     * @param {string} col collection
     * @param {any} data data to be inserted
     * @param {function} callback
     */
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
    /**
     * show all data from db.col
     * @param {mongodb.Db} db
     * @param {string} col collection
     * @param {function} callback
     */
    function showAllData(db, col, openid, callback) {
        var collection = db.collection(col);
        collection.find({ "openid": openid }).toArray(function (err, result) {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.showAllData = showAllData;
    function queryGameById(db, col, id, callback) {
        var collection = db.collection(col);
        var objId = new mongodb.ObjectId(id);
        var queryData = { "_id": objId };
        collection.find(queryData).toArray(function (err, result) {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.queryGameById = queryGameById;
    function enrol(db, col, data) {
        logger.debug('mongoUtil.enrol has invoked');
        var collection = db.collection(col);
        var id = data.gameId;
        collection.update({
            "_id": new mongodb.ObjectId(id)
        }, {
            "$push": { "referees": data }
        }, {
            upsert: true
        }).catch(function (e) {
            logger.error('update error:', e);
        });
    }
    mongoUtil.enrol = enrol;
})(mongoUtil = exports.mongoUtil || (exports.mongoUtil = {}));
//# sourceMappingURL=mongolib.js.map