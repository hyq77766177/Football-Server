"use strict";
/// <reference path="./config.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var https = require("https");
var _ = require("lodash");
var mongoDb = require("mongodb");
var log4js = require("log4js");
var bodyParser = require("body-parser");
var config_1 = require("./config");
var mongolib_1 = require("./mongolib");
var errorCode_1 = require("./errorCode");
log4js.configure(config_1.config.log4js_conf);
var logger = log4js.getLogger('app.js');
var server;
(function (server) {
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
    server.getValue = getValue;
    var MongoClient = mongoDb.MongoClient;
    var DB_CONN_STR = mongolib_1.mongoUtil.mongoUrl;
    server.app = express();
    server.app.use(bodyParser.json({ limit: '1mb' }));
    server.app.use(bodyParser.urlencoded({
        extended: true
    }));
    server.app.post('/creategame', function (req, res, next) {
        logger.info("incoming createData: ", req.body);
        var document = req.body.formData;
        logger.debug('document: ', document);
        var this_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("mongo connect success");
            this_db = db;
            return mongolib_1.mongoUtil.insertData(db, config_1.config.gameCollection, document);
        })
            .then(function (writeRes) {
            logger.info("insert success");
            this_db.close();
            res.write("create game success");
            next();
        })
            .catch(function (err) {
            logger.error("create game failed, error: ", err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.createGameError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    });
    server.app.post('/openid', function (req, res) {
        logger.info('incoming openid data: ', req.body);
        var data = req.body;
        var code = getValue(data, "code");
        if (code) {
            var url = config_1.config.getWXOpenIdUrl(code);
            var data_1 = '';
            var hreq = https.get(url, function (hres) {
                hres.on('data', function (chunk) {
                    data_1 += chunk;
                });
                hres.on('end', function () {
                    logger.debug('parsedData: ', data_1);
                    var dataObj = JSON.parse(data_1);
                    if (dataObj.session_key) {
                        delete dataObj.session_key;
                    }
                    res.write(JSON.stringify(dataObj));
                    res.end();
                });
            });
        }
    });
    server.app.post('/all', function (req, res) {
        var reqData = req.body;
        logger.info("incoming all data: ", reqData);
        var all_db;
        var resultGameData = {
            myCreatedGames: null,
            myEnroledGames: null,
            availableGames: null,
        };
        var openid = getValue(reqData, "openid");
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("query all games mongo connected");
            all_db = db;
            return mongolib_1.mongoUtil.queryGames(all_db, config_1.config.gameCollection, { "openid": openid });
        })
            .then(function (myCreatedGames) {
            logger.info('myCreatedGames:', myCreatedGames);
            resultGameData.myCreatedGames = myCreatedGames;
            return mongolib_1.mongoUtil.queryGames(all_db, config_1.config.gameCollection, { "referees.openid": openid });
        })
            .then(function (myEnroledGames) {
            logger.info('myEnroledGames:', myEnroledGames);
            resultGameData.myEnroledGames = myEnroledGames;
            return mongolib_1.mongoUtil.queryGames(all_db, config_1.config.gameCollection, null);
        })
            .then(function (allGames) {
            logger.info('allGames: ', allGames);
            var availableGames = allGames.filter(function (r) { return !resultGameData.myEnroledGames.some(function (c) { return c._id.toHexString() === r._id.toHexString(); }) && !resultGameData.myCreatedGames.some(function (e) { return e._id.toHexString() === r._id.toHexString(); }); });
            resultGameData.availableGames = availableGames;
            res.write(JSON.stringify(resultGameData));
            all_db.close();
            res.end();
        })
            .catch(function (e) {
            logger.error("query all games failed, error: ", e);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.queryGameError,
                msg: e
            };
            res.end(JSON.stringify(errMsg));
            all_db.close();
        });
    });
    server.app.post('/assign', function (req, res, next) {
        var reqData = req.body;
        logger.info('incoming assign data: ', req.body);
        var assign_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            assign_db = db;
            logger.info("assign mongo connected");
            var id = new mongoDb.ObjectId(server.getValue(reqData, "gameId"));
            var filter = {
                "_id": id,
                "referees.openid": server.getValue(reqData, 'openid'),
            };
            var assign = server.getValue(reqData, 'assign');
            var update = {
                "$set": { "referees.$.assigned": !assign },
            };
            return mongolib_1.mongoUtil.update(db, config_1.config.gameCollection, filter, update);
        })
            .then(function (writeRes) {
            logger.info("assign success");
            assign_db.close();
            res.write('assign Success!');
            next();
        })
            .catch(function (e) {
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.assignError,
                msg: e
            };
            res.end(JSON.stringify(errMsg));
            assign_db.close();
        });
    });
    server.app.post('/gamebyid', function (req, res) {
        var data = req.body;
        var this_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            this_db = db;
            logger.info('mongo query by id connected, request: ', data);
            var id = getValue(data, "colId");
            return mongolib_1.mongoUtil.queryGameById(db, config_1.config.gameCollection, id);
        })
            .then(function (game) {
            logger.info("query game by id success, game: ", game);
            res.end(JSON.stringify(game));
            this_db.close();
        })
            .catch(function (err) {
            logger.error('query game by id failed, error: ', err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.queryGameError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    });
    server.app.post('/enrol', function (req, res, next) {
        logger.info('incoming enrol data: ', req.body);
        var data = req.body.data;
        var this_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            this_db = db;
            logger.info("enrol mongo connected");
            var gameId = getValue(data, "gameId");
            return mongolib_1.mongoUtil.queryGameById(db, config_1.config.gameCollection, gameId);
        })
            .then(function (game) {
            var exists = game.referees && game.referees.some(function (r) { return r.openid === getValue(data, "openid"); });
            if (exists) {
                logger.debug('exists：', exists);
                var errMsg = {
                    status: errorCode_1.errorCode.errCode.enrolExist,
                    msg: '不能重复报名！',
                };
                res.status(400);
                res.end(JSON.stringify(errMsg));
                this_db.close();
            }
            else {
                var filter = { "_id": new mongoDb.ObjectId(getValue(data, "gameId")), };
                var update = { "$pull": { "referees": { openid: server.getValue(data, "openid"), } } };
                return mongolib_1.mongoUtil.update(this_db, config_1.config.gameCollection, filter, update, { upsert: true });
            }
        })
            .then(function (r) {
            this_db.close();
            res.write('Enrol Success!');
            next();
        })
            .catch(function (err) {
            logger.error("enrol failed, error: ", err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.enrolError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    });
    server.app.post('/cancelenrol', function (req, res, next) {
        var data = req.body;
        var this_db = null;
        logger.info("incoming cancel enrol data: ", req.body);
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            this_db = db;
            var filter = {
                "_id": new mongoDb.ObjectId(getValue(data, "gameId")),
            };
            var update = {
                "$pull": {
                    "referees": {
                        openid: server.getValue(data, "openid"),
                    }
                },
            };
            return mongolib_1.mongoUtil.update(this_db, config_1.config.gameCollection, filter, update);
        })
            .then(function (updateRes) {
            this_db.close();
            res.write('Cancel Success');
            next();
        })
            .catch(function (err) {
            logger.error('cancel enrol failed, error: ', err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.cancelError,
                msg: err
            };
            res.end(JSON.stringify(errMsg));
            this_db.close();
        });
    });
    server.app.post('/updateenrol', function (req, res, next) {
        var data = req.body.data;
        var this_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info('update enrol mongo connected');
            this_db = db;
            var filter = {
                "_id": new mongoDb.ObjectId(getValue(data, "gameId")),
                "referees.openid": server.getValue(data, "openid"),
            };
            var update = {
                "$set": {
                    "referees.$": data,
                },
            };
            return mongolib_1.mongoUtil.update(this_db, config_1.config.gameCollection, filter, update);
        })
            .then(function (writeRes) {
            logger.info("update enrol success");
            this_db.close();
            res.write('update enrol Success!');
            next();
        })
            .catch(function (err) {
            logger.error("update enrol failed, error: ", err);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.enrolUpdateError,
                msg: err,
            };
            this_db.close();
            res.end(JSON.stringify(errMsg));
        });
    });
    server.app.post('/deletegame', function (req, res, next) {
        logger.info('incoming delete game data: ', req.body);
        var this_db = null;
        var reqData = req.body;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("delete game mongo connected");
            this_db = db;
            return mongolib_1.mongoUtil.queryGameById(db, config_1.config.gameCollection, req.body.gameId);
        })
            .then(function (game) {
            if (!game)
                throw new Error("no such game!");
            if (game.openid !== req.body.openid) {
                res.status(400);
                var errMsg = {
                    status: errorCode_1.errorCode.errCode.deleteGameError,
                    msg: '不能删除非自己发布的比赛！',
                };
                this_db.close();
                res.end(JSON.stringify(errMsg));
            }
            else {
                var id = new mongoDb.ObjectId(getValue(reqData, "gameId"));
                return mongolib_1.mongoUtil.deleteGameById(this_db, config_1.config.gameCollection, id);
            }
        })
            .then(function (mongoRes) {
            logger.info('delete game succeed');
            this_db.close();
            res.write('delete game success!');
            next();
        })
            .catch(function (e) {
            logger.error("delete game failed, error", e);
            res.status(400);
            var errMsg = {
                status: errorCode_1.errorCode.errCode.deleteGameError,
                msg: e,
            };
            this_db.close();
            res.end(JSON.stringify(errMsg));
        });
    });
    server.app.use(function (req, res, next) {
        res.write('Response from express, ' + new Date());
        res.end();
    });
    server.app.listen(config_1.config.port);
    logger.info("server listening at 127.0.0.1: " + config_1.config.port);
})(server = exports.server || (exports.server = {}));
//# sourceMappingURL=app.js.map