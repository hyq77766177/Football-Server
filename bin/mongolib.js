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
    mongoUtil.mongoUrl = "mongodb://" + config_1.config.mongoUser + ":" + config_1.config.mongoPass + "@" + config_1.config.mongoHost + ":" + config_1.config.mongoPort + "/" + config_1.config.mongoDb;
    function insertData(db, col, data) {
        logger.info('mongo insert data has been invoked');
        var collection = db.collection(col);
        return collection.insertOne(data);
    }
    mongoUtil.insertData = insertData;
    function queryGames(db, col, query) {
        logger.info('mongo query games has been invoked');
        var collection = db.collection(col);
        return collection.find(query).toArray();
    }
    mongoUtil.queryGames = queryGames;
    function queryGameById(db, col, id) {
        logger.info('mongo query by id has been invoked');
        var collection = db.collection(col);
        var objId = new mongodb.ObjectId(id);
        var queryData = { "_id": objId };
        return collection.findOne(queryData);
    }
    mongoUtil.queryGameById = queryGameById;
    function update(db, col, filter, update, options) {
        logger.info('mongoUtil.update has been invoked');
        var collection = db.collection(col);
        return collection.update(filter, update, options);
    }
    mongoUtil.update = update;
    ;
    function deleteGameById(db, col, id) {
        logger.info('mongo deleteGame has been invoked');
        var collection = db.collection(col);
        return collection.remove({ "_id": id });
    }
    mongoUtil.deleteGameById = deleteGameById;
})(mongoUtil = exports.mongoUtil || (exports.mongoUtil = {}));
//# sourceMappingURL=mongolib.js.map