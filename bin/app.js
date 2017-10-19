"use strict";
/// <reference path="./config.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var https = require("https");
var _ = require("lodash");
var mongoDb = require("mongodb");
var log4js = require("log4js");
var bodyParser = require("body-parser");
var assert = require("assert");
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
        if (!result) {
            assert(false, "bad request data!");
            var errMsg = {
                status: errorCode_1.errorCode.errCode.badData,
                msg: "bad request data!",
            };
            return errMsg;
        }
        else
            return result;
    }
    server.getValue = getValue;
    var MongoClient = mongoDb.MongoClient;
    var DB_CONN_STR = mongolib_1.mongoUtil.mongoUrl;
    var app = express();
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.post('/creategame', function (req, res, next) {
        logger.debug(req.body);
        var formData = req.body.formData;
        try {
            var document_1 = formData;
            logger.debug('document: ', document_1);
            MongoClient.connect(DB_CONN_STR, function (err, db) {
                if (err) {
                    logger.error('[createGame] mongo connect error!', err);
                }
                logger.debug("mongo insert");
                mongolib_1.mongoUtil.insertData(db, 'games', document_1, function (result) {
                    logger.debug(result);
                    db.close();
                    next();
                });
            });
        }
        catch (e) {
            logger.error(e);
        }
    });
    app.post('/openid', function (req, res, next) {
        logger.debug('req_body: ', req.body);
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
    app.post('/all', function (req, res, next) {
        var reqData = req.body;
        logger.debug("incoming all data: ", reqData);
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            logger.debug('mongo show all');
            var openid = getValue(reqData, "openid");
            mongolib_1.mongoUtil.allGames(db, 'games', function (resAll) {
                logger.debug('allGames:', resAll);
                mongolib_1.mongoUtil.myCreatedGames(db, 'games', openid, function (resultC) {
                    logger.debug('myCreatedGames:', resultC);
                    mongolib_1.mongoUtil.myEnroledGames(db, 'games', openid, function (resultE) {
                        logger.debug('myEnroledGames:', resultE);
                        var availableGames = resAll.filter(function (r) { return !resultC.some(function (c) { return c._id.toHexString() === r._id.toHexString(); }) && !resultE.some(function (e) { return e._id.toHexString() === r._id.toHexString(); }); });
                        logger.debug('availableGames: ', availableGames);
                        var responseData = {
                            availableGames: availableGames,
                            myCreatedGames: resultC,
                            myEnroledGames: resultE,
                        };
                        res.write(JSON.stringify(responseData));
                        db.close();
                        res.end();
                    });
                });
            });
        });
    });
    app.post('/assign', function (req, res, next) {
        var reqData = req.body;
        logger.debug('assign incoming data: ', req.body);
        MongoClient.connect(DB_CONN_STR, function (e, db) {
            if (e) {
                logger.error('[assign] mongo connect error! ', e);
                return;
            }
            mongolib_1.mongoUtil.assign(db, 'games', reqData, function (err) {
                if (err) {
                    res.status(400);
                    var errMsg = {
                        status: errorCode_1.errorCode.errCode.assignError,
                        msg: err,
                    };
                    db.close();
                    res.end(JSON.stringify(errMsg));
                }
                else {
                    db.close();
                    res.end('assign Success!' + new Date().toLocaleString());
                }
            });
        });
    });
    app.post('/gamebyid', function (req, res, next) {
        try {
            MongoClient.connect(DB_CONN_STR, function (err, db) {
                logger.debug('mongo query by id connected, request: ', req.body);
                mongolib_1.mongoUtil.queryGameById(db, 'games', req.body.colId, function (result) {
                    logger.debug(result);
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
    app.post('/enrol', function (req, res, next) {
        logger.debug('enrol data: ', req.body);
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
    app.post('/cancelenrol', function (req, res) {
        var data = req.body;
        logger.debug(req.body);
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
    app.post('/updateenrol', function (req, res, next) {
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
    app.post('/deletegame', function (req, res, next) {
        logger.debug('incoming delete game data: ', req.body);
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
    app.use(function (req, res, next) {
        res.write('Response from express, ' + new Date());
        res.end();
    });
    app.listen(config_1.config.port);
    logger.info("server listening at 127.0.0.1: " + config_1.config.port);
})(server = exports.server || (exports.server = {}));
//# sourceMappingURL=app.js.map