/// <reference path="./app.ts" />

import * as chai from 'chai';
import * as request from 'supertest';
import * as express from 'express';
import * as log4js from 'log4js';

import { server } from './app';
import { types } from './types';

const app = server.app;
const expect = chai.expect;
const logger = log4js.getLogger("test");

const openid = "123456789";
let gameId = "";

const gameDataObj: types.gameData = {
  _id: null,
  gameName: "",
  gameDate: "",
  gameEndTime: "",
  gameTime: "",
  refereeNumber: 3,
  openid: "",
}

describe("获取openid", () => {
  it("获取到openid", done => {
    request(app)
      .post('/openid')
      .send({
        code: "6651818s1ad8f1",
      })
      .expect(200, (err, res) => {
        logger.info('openid是：', res.text);
        done();
      });
  })
});

describe("创建比赛", () => {
  it("应该创建比赛成功", (done) => {
    request(app)
      .post('/creategame')
      .send({
        formData: {
          gameName: "2135",
          gameDate: "2017-01-11",
          gameEndTime: "23:59",
          gameTime: "00:18",
          refereeNumber: "3",
          openid: openid,
        }
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      })
  })
})

describe("查询比赛数据", () => {
  it("应该成功查询到数据", (done) => {
    request(app)
      .post('/all')
      .send({
        openid: openid,
      })
      .expect(200, (err, res) => {
        gameId = JSON.parse(res.text).myCreatedGames.shift()._id;
        logger.debug("gameId是：", gameId);
        logger.info("返回结果是：", res.text);
        expect(err).to.be.equal(null);
        expect(JSON.parse(res.text)).to.have.all.keys("myCreatedGames", "myEnroledGames", "availableGames");
        done();
      })
  })
})

describe('按照Id查找比赛信息', () => {
  it('应该查找成功', done => {
    request(app)
      .post('/gamebyid')
      .send({
        colId: gameId,
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        expect(JSON.parse(res.text)).to.have.all.keys(Object.keys(gameDataObj));
        done();
      });
  });
});

describe('报名', () => {
  it('应该报名成功', done => {
    request(app)
      .post('/enrol')
      .send({
        data: {
          gameId: gameId,
          openid: openid,
          startRefTime: "00:15",
          endRefTime: "02:15",
          refereeName: "HYQ",
        }
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      });
  });
});

describe('更新报名', () => {
  it('应该更新报名成功', done => {
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
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      });
  });
});

describe('选派裁判', () => {
  it('应该选派成功', done => {
    request(app)
      .post('/assign')
      .send({
        openid: openid,
        gameId: gameId,
        assign: false,
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      });
  });
});

describe('取消报名', () => {
  it('应该报名成功', done => {
    request(app)
      .post('/cancelenrol')
      .send({
        gameId: gameId,
        openid: openid,
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      });
  });
});

describe('删除比赛', () => {
  it('应该删除成功', done => {
    request(app)
      .post('/deletegame')
      .send({
        openid: openid,
        gameId: gameId,
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      });
  });
});

describe('裁判注册', () => {
  it('应该注册成功', done => {
    request(app)
      .post('/registinfo')
      .send({
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
      })
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      });
  });
});
