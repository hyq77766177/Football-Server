/// <reference path="./app.ts" />

import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as qs from 'querystring';
import * as _ from 'lodash';
import * as mongoDb from 'mongodb';
import * as log4js from 'log4js';
import * as bodyParser from 'body-parser';
import * as assert from 'assert';

import { config } from './config';
import { mongoUtil } from './mongolib';
import { errorCode } from './errorCode';
import { types } from './types';
import { server } from './app';
import { util } from './util';

log4js.configure(config.log4js_conf);

const logger = log4js.getLogger('referee');
const MongoClient = mongoDb.MongoClient;
const DB_CONN_STR = mongoUtil.mongoUrl;

export class Referee {

  public refereeName: string;
  public refereeHeight: string;
  public refereeWeight: string;
  public refereePhoneNumber: string;
  public refereeIdNumber: string;
  public refereeScholarId: string;
  public refereeBankNumber: string;
  public refereeCardNumber: string;
  public refereeClass: string;
  public openid: string;

  public parse(data: types.refereeData) {
    for (let element in data) {
      let key = element as keyof types.refereeData;
      this[element] = util.getValue(data, key);
    }
  }

  public constructor(data: types.refereeData) {
    this.parse(data);
  }

  public static adminOpenids = ["o7TkA0Xr2Kz-xGFxkFU3c56lpmQY"];

  public static regist(req: express.Request, res: express.Response, next: express.NextFunction) {
    logger.info("incoming referee regist data: ", req.body);
    let document = req.body as types.refereeData;
    logger.debug('document: ', document);
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("referee regist mongo connect success");
        this_db = db;
        const filter = { "openid": document.openid };
        const update = document;
        return mongoUtil.update(db, config.refereeCollection, filter, update, { upsert: true, });
      })
      .then(writeRes => {
        logger.info("referee regist insert success");
        this_db.close();
        res.write("referee regist success");
        next();
      })
      .catch(err => {
        logger.error("referee regist failed, error: ", err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.refereeRegistError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close()
      });
  }

  public static showReferee(req: express.Request, res: express.Response) {
    logger.info("incoming show referee data: ", req.body);
    let data = req.body as types.refereeShowData;
    let this_db: mongoDb.Db = null
    let response = {};
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("referee show mongo connect success");
        this_db = db;
        return mongoUtil.queryByOpenId(db, config.refereeCollection, data.openid);
      })
      .then(refereeRes => {
        response['myInfo'] = refereeRes;
        return mongoUtil.queryMany<types.refereeData>(this_db, config.refereeCollection, {});
      })
      .then(manyRes => {
        logger.info("referee show query success");
        this_db.close();
        response['refereesInfo'] = manyRes;
        response['isAdmin'] = Referee.adminOpenids.indexOf(data.openid) >= 0;
        res.send(response);
      })
      .catch(err => {
        logger.error("referee show failed, error: ", err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.refereeShowError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close()
      });
  }
}
