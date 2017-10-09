"use strict";
/// <reference path="./config.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var https = require("https");
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
                    logger.error(err);
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
        var code = req.body.code;
        if (code) {
            var url = config_1.config.getWXOpenIdUrl(code);
            var data_1 = '';
            var hreq = https.get(url, function (hres) {
                hres.on('data', function (chunk) {
                    data_1 += chunk;
                });
                hres.on('end', function () {
                    logger.debug('parsedData: ', data_1);
                    res.write(data_1);
                    res.end();
                });
            });
        }
    });
    app.post('/all', function (req, res, next) {
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            logger.debug('mongo show all');
            var openid = req.body.openid;
            if (!openid) {
                var errMsg = {
                    status: errorCode_1.errorCode.errCode.noOpenId,
                    msg: '没有openid',
                };
                res.status(400);
                res.end(JSON.stringify(errMsg));
                return;
            }
            mongolib_1.mongoUtil.myCreatedGames(db, 'games', openid, function (resultC) {
                logger.debug('myCreatedGames:', resultC);
                mongolib_1.mongoUtil.myEnroledGames(db, 'games', openid, function (resultE) {
                    logger.debug('myEnroledGames:', resultE);
                    var responseData = {
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
    app.post('/gamebyid', function (req, res, next) {
        try {
            MongoClient.connect(DB_CONN_STR, function (err, db) {
                logger.debug('mongo query by id connected, request: ', req.body);
                mongolib_1.mongoUtil.queryGameById(db, 'games', req.body.colId, function (result) {
                    logger.debug(result);
                    result = result[0];
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
                        logger.error(err);
                        return;
                    }
                    try {
                        mongolib_1.mongoUtil.queryGameById(db, 'games', data_2.gameId, function (result) {
                            var resl = result[0];
                            logger.debug('find result: ', resl);
                            logger.debug('find result.referees: ', resl['referees']);
                            var exists = resl.referees && resl['referees'].some(function (r) { return r.refereeName === data_2.refereeName; });
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
                                mongolib_1.mongoUtil.enrol(db, 'games', data_2, function () {
                                    res.write('enrol success!');
                                    db.close();
                                    res.end();
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
    app.use(function (req, res, next) {
        res.write('Response from express, ' + new Date());
        res.end();
    });
    app.listen(config_1.config.port);
    logger.info("server listening at 127.0.0.1: " + config_1.config.port);
})(server = exports.server || (exports.server = {}));
//# sourceMappingURL=app.js.map