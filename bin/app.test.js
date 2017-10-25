"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var request = require("supertest");
var log4js = require("log4js");
var app_1 = require("./app");
var app = app_1.server.app;
var expect = chai.expect;
var logger = log4js.getLogger("test");
describe("创建比赛", function () {
    it("创建比赛成功", function (done) {
        request(app)
            .post('/creategame')
            .send({
            formData: {
                gameName: "2135",
                gameDate: "2017-01-11",
                gameEndTime: "23:59",
                gameTime: "00:18",
                refereeNumber: "3",
                openid: "65489784941",
            }
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe("获取openid", function () {
    it("获取到openid", function (done) {
        request(app)
            .post('openid')
            .send({
            code: "6651818s1ad8f1",
        })
            .expect(200, function (err, res) {
            logger.debug('openid是：', res);
            done();
        });
    });
});
//# sourceMappingURL=app.test.js.map