"use strict";
/// <reference path="./app.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var request = require("supertest");
var log4js = require("log4js");
var app_1 = require("./app");
var app = app_1.server.app;
var expect = chai.expect;
var logger = log4js.getLogger("test");
var openid = "123456789";
var gameId = "";
var gameDataObj = {
    _id: null,
    gameName: "",
    gameDate: "",
    gameEndTime: "",
    gameTime: "",
    gameAvailablePeriod: [],
    refereeNumber: 3,
    openid: "",
};
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
                gameAvailablePeriod: ["112", "123"],
                openid: openid,
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
            openid: openid,
        })
            .expect(200, function (err, res) {
            gameId = JSON.parse(res.text).myCreatedGames.shift()._id;
            logger.debug("gameId是：", gameId);
            logger.info("返回结果是：", res.text);
            expect(err).to.be.equal(null);
            expect(JSON.parse(res.text)).to.have.all.keys("myCreatedGames", "myEnroledGames", "availableGames");
            done();
        });
    });
});
describe('按照Id查找比赛信息', function () {
    it('应该查找成功', function (done) {
        request(app)
            .post('/gamebyid')
            .send({
            colId: gameId,
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            expect(JSON.parse(res.text)).to.have.all.keys(Object.keys(gameDataObj));
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
                gameId: gameId,
                openid: openid,
                availableGames: "123",
                refereeName: "HYQ",
            }
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe('更新报名', function () {
    it('应该更新报名成功', function (done) {
        request(app)
            .post('/updateenrol')
            .send({
            data: {
                gameId: gameId,
                openid: openid,
                startRefTime: "01:15",
                endRefTime: "03:15",
                refereeName: "HHHYQ",
            }
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe('选派裁判', function () {
    it('应该选派成功', function (done) {
        request(app)
            .post('/assign')
            .send({
            openid: openid,
            gameId: gameId,
            assign: false,
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
describe('取消报名', function () {
    it('应该报名成功', function (done) {
        request(app)
            .post('/cancelenrol')
            .send({
            gameId: gameId,
            openid: openid,
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
            openid: openid,
            gameId: gameId,
        })
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
var registData = {
    refereeName: "2",
    refereeHeight: "3",
    refereeWeight: "4",
    refereePhoneNumber: "6",
    refereeScholarId: "1",
    refereeIdNumber: "5",
    refereeBankNumber: "7",
    refereeCardNumber: "8",
    refereeClass: "9",
    openid: "10",
};
describe('裁判注册', function () {
    it('应该注册成功', function (done) {
        request(app)
            .post('/registinfo')
            .send(registData)
            .expect(200, function (err, res) {
            expect(err).to.be.equal(null);
            done();
        });
    });
});
var refereeQueryData = {
    myInfo: "",
    isAdmin: "",
    refereesInfo: "",
};
describe('裁判查询', function () {
    it('应该查询成功', function (done) {
        request(app)
            .post('/showreferee')
            .send({
            openid: "10",
        })
            .expect(200, function (err, res) {
            logger.debug("裁判查询得到数据：", res.text);
            expect(JSON.parse(res.text)).to.have.all.keys(Object.keys(refereeQueryData));
            expect(err).to.be.equal(null);
            done();
        });
    });
});
var refereeData = {
    refereeName: "2",
    refereeHeight: "3",
    refereeWeight: "4",
    refereePhoneNumber: "6",
    refereeScholarId: "1",
    refereeIdNumber: "5",
    refereeBankNumber: "7",
    refereeCardNumber: "8",
    refereeClass: "9",
    openid: "",
    _id: "",
};
describe('根据id的裁判查询', function () {
    it('应该查询成功', function (done) {
        request(app)
            .post('/refereebyid')
            .send({
            refereeId: "5a0427ccf97dda464b0aafcc",
        })
            .expect(200, function (err, res) {
            logger.debug("根据id裁判查询得到数据：", res.text);
            expect(JSON.parse(res.text)).to.have.keys(Object.keys(refereeData));
            expect(err).to.be.equal(null);
            done();
        });
    });
});
//# sourceMappingURL=app.test.js.map