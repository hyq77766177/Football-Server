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
            return mongolib_1.mongoUtil.update(db, 'games', filter, update);
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
        var gamebyid_db = null;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            gamebyid_db = db;
            logger.info('mongo query by id connected, request: ', req.body);
            return mongolib_1.mongoUtil.queryGameById(db, 'games', req.body.colId);
        })
            .then(function (game) {
            logger.info("query game by id success, game: ", game);
            res.write(JSON.stringify(game));
            gamebyid_db.close();
            next();
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
            return mongolib_1.mongoUtil.queryGameById(db, 'games', getValue(data, "gameId"));
        })
            .then(function (game) {
            var exists = game.referees && game['referees'].some(function (r) { return r.openid === getValue(data, "openid"); });
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
                return mongolib_1.mongoUtil.update(this_db, 'games', filter, update, { upsert: true });
            }
        })
            .then(function (r) {
            this_db.close();
            res.write('Enrol Success!');
            next();
        })
            .catch(function (err) {
            logger.error("enrol failed, error: ", err);
        });
        //           , result => {
        //           const resl = result as gameData;
        //           logger.debug('find result: ', resl);
        //           logger.debug('find result.referees: ', resl['referees']);
        //           let exists = resl.referees && resl['referees'].some(r => r.openid === data.openid);
        //           if (exists) {
        //             logger.debug('exists：', exists);
        //             const errMsg: server.errMsg = {
        //               status: errorCode.errCode.enrolExist,
        //               msg: '不能重复报名！',
        //             }
        //             res.status(400); // errorCode.errCode.enrolExist);
        //             res.end(JSON.stringify(errMsg));
        //             db.close();
        //           } else {
        //             mongoUtil.enrol(db, 'games', data, err => {
        //               if (err) {
        //                 const errMsg: server.errMsg = {
        //                   status: errorCode.errCode.enrolError,
        //                   msg: err,
        //                 }
        //                 db.close();
        //                 res.end(JSON.stringify(errMsg));
        //               } else {
        //                 db.close();
        //                 res.end('Enrol Success!' + new Date().toLocaleString());
        //               }
        //             });
        //           }
        //         })
        //       } catch (e) {
        //         logger.error(e);
        //       }
        //     })
        //   } else {
        //     logger.error('no enrol data!');
        //   }
        // } catch (e) {
        //   logger.error(e);
        // }
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
        var this_db = null;
        var reqData = req.body;
        MongoClient.connect(DB_CONN_STR)
            .then(function (db) {
            logger.info("delete game mongo connected");
            this_db = db;
            return mongolib_1.mongoUtil.queryGameById(db, 'games', req.body.gameId);
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
                return mongolib_1.mongoUtil.deleteGameById(this_db, 'games', id);
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