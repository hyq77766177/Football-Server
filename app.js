"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var https = require("https");
var mongoDb = require("mongodb");
var MongoClient = mongoDb.MongoClient;
var DB_CONN_STR = "mongodb://" + config.mongoUser + ":" + config.mongoPass + "@" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDb;
var app = express();
app.use('/creategame', function (req, res, next) {
    // console.log(req)
    var formData = req.query.formData;
    var document = JSON.parse(formData);
    document['openid'] = req.query.openid;
    // console.log('document: ', document)
    MongoClient.connect(DB_CONN_STR, function (err, db) {
        if (err) {
            console.log(err);
        }
        console.log("mongo insert");
        mongoUtil.insertData(db, 'games', document, function (result) {
            console.log(result);
            db.close();
            next();
        });
    });
});
app.use('/openid', function (req, res, next) {
    console.log(req.query);
    var code = req.query.code;
    if (code) {
        var url = "https://api.weixin.qq.com/sns/jscode2session?appId=" + config.appId + "&secret=" + config.appSecret + "&js_code=" + code + "&grant_type=authorization_code";
        var data_1 = '';
        var hreq = https.get(url, function (hres) {
            hres.on('data', function (chunk) {
                data_1 += chunk;
            });
            hres.on('end', function () {
                console.log('*** parsedData: ', data_1);
                res.write(data_1);
                res.end();
            });
        });
    }
});
app.use('/all', function (req, res, next) {
    var allGames = [];
    MongoClient.connect(DB_CONN_STR, function (err, db) {
        console.log('mongo show all');
        mongoUtil.showAllData(db, 'games', function (result) {
            console.log(result);
            res.write(JSON.stringify(result));
            db.close();
            res.end();
        });
    });
});
app.use(function (req, res, next) {
    res.write('Response from express');
    res.end();
});
app.listen(config.port);
console.log("server listening at 127.0.0.1: " + config.port);
