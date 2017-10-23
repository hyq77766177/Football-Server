import * as chai from 'chai';
import * as request from 'supertest';
import * as express from 'express';
import * as log4js from 'log4js';
import { server } from './app';

const app = server.app;
const expect = chai.expect;
const logger = log4js.getLogger("test");

describe("创建比赛", () => {
  it("创建比赛成功", (done) => {
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
      .expect(200, (err, res) => {
        expect(err).to.be.equal(null);
        done();
      })
  })
})

describe("获取openid", () => {
  it("获取到openid", done => {
    request(app)
      .post('openid')
      .send({
        code: "6651818s1ad8f1",
      })
      .expect(200, (err, res) => {
        logger.debug('openid是：', res);
        done();
      });
  })
})
