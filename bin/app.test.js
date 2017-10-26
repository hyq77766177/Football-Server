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
    it("应该创建比赛成功", function (done) {
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
describe("查询比赛数据", function () {
    it("应该成功查询到数据", function (done) {
        request(app)
            .post('/all')
            .send({
            openid: "o7TkA0Xr2Kz-xGFxkFU3c56lpmQY",
        })
            .expect(200, function (err, res) {
            logger.info("返回结果是：", res.text);
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe("获取openid", function () {
    it("获取到openid", function (done) {
        request(app)
            .post('/openid')
            .send({
            code: "6651818s1ad8f1",
        })
            .expect(200, function (err, res) {
            logger.info('openid是：', res.text);
            done();
        });
    });
});
describe('选派裁判', function () {
    it('应该选派成功', function (done) {
        request(app)
            .post('/assign')
            .send({
            openid: "o7TkA0Xr2Kz-xGFxkFU3c56lpmQY",
            gameId: "59d18bcb7c41dd20b8026dae",
            assign: false,
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe('删除比赛', function () {
    it('应该删除成功', function (done) {
        request(app)
            .post('/deletegame')
            .send({
            openid: "65489784941",
            gameId: "59f1ed174527fa801a26c809",
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe('报名', function () {
    it('应该报名成功', function (done) {
        request(app)
            .post('/enrol')
            .send({
            data: {
                gameId: "59f1f00109e27d81f67844dd",
                openid: "65489784941",
                startRefTime: "00:15",
                endRefTime: "02:15",
                refereeName: "HYQ",
            }
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
//# sourceMappingURL=app.test.js.map