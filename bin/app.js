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
        result === null && logger.fatal("bad request data, the key is missed or wrong written from path: " + arg.join("=>"));
        // assert(!!result, `bad request data, the key is missed or wrong written from path: ${arg.join("=>")}`);
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
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("mongo connect success");
            mongolib_1.mongoUtil.insertData(db, 'games', document);
            return db;
        })
            .then(function (db) {
            logger.info("insert success");
            db.close();
            next();
        })
            .catch(function (err) { return logger.error(config_1.config.loggerErrString.mongoConnectErr + ', createGame: ', err); });
    });
    server.app.post('/openid', function (req, res, next) {
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
    server.app.post('/all', function (req, res, next) {
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
            return mongolib_1.mongoUtil.queryGames(all_db, 'games', { "openid": openid });
        })
            .then(function (myCreatedGames) {
            logger.info('myCreatedGames:', myCreatedGames);
            resultGameData.myCreatedGames = myCreatedGames;
            return mongolib_1.mongoUtil.queryGames(all_db, 'games', { "referees.openid": openid });
        })
            .then(function (myEnroledGames) {
            logger.info('myEnroledGames:', myEnroledGames);
            resultGameData.myEnroledGames = myEnroledGames;
            return mongolib_1.mongoUtil.queryGames(all_db, 'games', null);
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
            var update = {
                "$set": { "referees.$.assigned": !server.getValue(reqData, 'assign') },
            };
            return mongolib_1.mongoUtil.update(db, 'games', reqData, filter, update);
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
        //   , (e, db) => {
        //   if (e) {
        //     logger.error('[assign] mongo connect error! ', e);
        //     return;
        //   }
        //   mongoUtil.assign(db, 'games', reqData, err => {
        //     if (err) {
        //       res.status(400);
        //       const errMsg: server.errMsg = {
        //         status: errorCode.errCode.assignError,
        //         msg: err,
        //       }
        //       db.close();
        //       res.end(JSON.stringify(errMsg));
        //     } else {
        //     }
        //   })
        // })
    });
    server.app.post('/gamebyid', function (req, res, next) {
        try {
            MongoClient.connect(DB_CONN_STR, function (err, db) {
                logger.info('mongo query by id connected, request: ', req.body);
                mongolib_1.mongoUtil.queryGameById(db, 'games', req.body.colId, function (result) {
                    logger.info(result);
                    res.write(JSON.stringify(result));
                    db.close();
                    res.end();
                });
            });
        }
        catch (e) {
            logger.error(e);
        }
    });
    server.app.post('/enrol', function (req, res, next) {
        logger.info('incoming enrol data: ', req.body);
        try {
            var data_2 = req.body.data;
            if (data_2) {
                MongoClient.connect(DB_CONN_STR, function (err, db) {
                    if (err) {
                        logger.error('[enrol] mongo connect error!', err);
                        return;
                    }
                    try {
                        mongolib_1.mongoUtil.queryGameById(db, 'games', data_2.gameId, function (result) {
                            var resl = result;
                            logger.debug('find result: ', resl);
                            logger.debug('find result.referees: ', resl['referees']);
                            var exists = resl.referees && resl['referees'].some(function (r) { return r.openid === data_2.openid; });
                            if (exists) {
                                logger.debug('exists：', exists);
                                var errMsg = {
                                    status: errorCode_1.errorCode.errCode.enrolExist,
                                    msg: '不能重复报名！',
                                };
                                res.status(400); // errorCode.errCode.enrolExist);
                                res.end(JSON.stringify(errMsg));
                                db.close();
                            }
                            else {
                                mongolib_1.mongoUtil.enrol(db, 'games', data_2, function (err) {
                                    if (err) {
                                        var errMsg = {
                                            status: errorCode_1.errorCode.errCode.enrolError,
                                            msg: err,
                                        };
                                        db.close();
                                        res.end(JSON.stringify(errMsg));
                                    }
                                    else {
                                        db.close();
                                        res.end('Enrol Success!' + new Date().toLocaleString());
                                    }
                                });
                            }
                        });
                    }
                    catch (e) {
                        logger.error(e);
                    }
                });
            }
            else {
                logger.error('no enrol data!');
            }
        }
        catch (e) {
            logger.error(e);
        }
    });
    server.app.post('/cancelenrol', function (req, res) {
        var data = req.body;
        logger.info("incoming cancel enrol data: ", req.body);
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            if (err) {
                logger.error('[cancel enrol] mongo connect error!', err);
                return;
            }
            mongolib_1.mongoUtil.cancelEnrol(db, 'games', data, function (err) {
                if (err) {
                    res.status(400);
                    var errMsg = {
                        status: errorCode_1.errorCode.errCode.cancelError,
                        msg: err,
                    };
                    db.close();
                    res.end(JSON.stringify(errMsg));
                }
                else {
                    db.close();
                    res.end('Cancel Success!' + new Date().toLocaleString());
                }
            });
        });
    });
    server.app.post('/updateenrol', function (req, res, next) {
        var data = req.body.data;
        if (data) {
            MongoClient.connect(DB_CONN_STR, function (err, db) {
                if (err) {
                    logger.error('[update enrol] mongo connect error!', err);
                    return;
                }
                try {
                    mongolib_1.mongoUtil.enrolUpdate(db, 'games', data, function (err) {
                        if (err) {
                            res.status(400);
                            var errMsg = {
                                status: errorCode_1.errorCode.errCode.enrolUpdateError,
                                msg: err,
                            };
                            db.close();
                            res.end(JSON.stringify(errMsg));
                        }
                        else {
                            db.close();
                            res.end('update enrol Success!' + new Date().toLocaleString());
                        }
                    });
                }
                catch (e) {
                    logger.error(e);
                }
            });
        }
        else {
            logger.error('No update data!');
        }
    });
    server.app.post('/deletegame', function (req, res, next) {
        logger.info('incoming delete game data: ', req.body);
        MongoClient.connect(DB_CONN_STR, function (e, db) {
            if (e) {
                logger.error('delete game connect error: ', e);
                return;
            }
            mongolib_1.mongoUtil.queryGameById(db, 'games', req.body.gameId, function (game) {
                if (game.openid !== req.body.openid) {
                    res.status(400);
                    var errMsg = {
                        status: errorCode_1.errorCode.errCode.deleteGameError,
                        msg: '不能删除非自己发布的比赛！',
                    };
                    db.close();
                    res.end(JSON.stringify(errMsg));
                }
                else {
                    mongolib_1.mongoUtil.deleteGame(db, 'games', req.body, function (err) {
                        if (err) {
                            res.status(400);
                            var errMsg = {
                                status: errorCode_1.errorCode.errCode.deleteGameError,
                                msg: err,
                            };
                            db.close();
                            res.end(JSON.stringify(errMsg));
                        }
                        else {
                            db.close();
                            res.end('delete game success!' + new Date().toLocaleString());
                        }
                    });
                }
            });
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