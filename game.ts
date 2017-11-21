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
import { Referee } from './referee'

log4js.configure(config.log4js_conf);

const logger = log4js.getLogger('game.ts');
const MongoClient = mongoDb.MongoClient;
const DB_CONN_STR = mongoUtil.mongoUrl;

export class Game {

  constructor() {
    // TODO parse data
  }

  public gameName: string;
  public gameDate: number;
  public gameTime: number;
  public gameEndTime: number;
  public refereeNumber: string;
  public publisherOpenid: string;

  public referees: any[]; // Referee[];

}

export namespace game {

  /** 创建比赛 */
  export function createGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    logger.info("incoming createData: ", req.body);
    let document: types.createGameData = req.body.formData;
    logger.debug('document: ', document);
    let this_db: mongoDb.Db = null
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("mongo connect success");
        this_db = db;
        return mongoUtil.insertData<types.createGameData>(db, config.gameCollection, document);
      })
      .then(writeRes => {
        logger.info("insert success");
        this_db.close();
        res.write("create game success");
        next();
      })
      .catch(err => {
        logger.error("create game failed, error: ", err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.createGameError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close()
      });
  }

  /** 获取openid */
  export function openid(req: express.Request, res: express.Response) {
    logger.info('incoming openid data: ', req.body);
    const data: types.openidData = req.body;
    let code = util.getValue(data, "code");
    if (code) {
      let url = config.getWXOpenIdUrl(code);
      let data = '';
      let hreq = https.get(url, hres => {
        hres.on('data', chunk => {
          data += chunk;
        })
        hres.on('end', () => {
          logger.debug('parsedData: ', data);
          let dataObj = JSON.parse(data);
          if (dataObj.session_key) {
            delete dataObj.session_key;
          }
          dataObj["isAdmin"] = Referee.adminOpenids.indexOf(dataObj.openid) >= 0;
          res.write(JSON.stringify(dataObj));
          res.end();
        })
      })
    }
  }

  /** 获取所有比赛信息 */
  export function getAllGameData(req: express.Request, res: express.Response) {
    const reqData: types.allData = req.body;
    logger.info("incoming all data: ", reqData);
    let all_db: mongoDb.Db;
    let resultGameData = {
      myCreatedGames: null,
      myEnroledGames: null,
      availableGames: null,
    };
    const openid = util.getValue(reqData, "openid");
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("query all games mongo connected");
        all_db = db;
        return mongoUtil.queryMany<types.gameData>(all_db, config.gameCollection, { "openid": openid });
      })
      .then(myCreatedGames => {
        logger.info('myCreatedGames:', myCreatedGames);
        resultGameData.myCreatedGames = myCreatedGames;
        return mongoUtil.queryMany<types.gameData>(all_db, config.gameCollection, { "referees.openid": openid });
      })
      .then(myEnroledGames => {
        logger.info('myEnroledGames:', myEnroledGames);
        resultGameData.myEnroledGames = myEnroledGames;
        return mongoUtil.queryMany<types.gameData>(all_db, config.gameCollection, null);
      })
      .then(allGames => {
        logger.info('allGames: ', allGames);
        let availableGames = allGames.filter(r => !resultGameData.myEnroledGames.some(c => c._id.toHexString() === r._id.toHexString()) && !resultGameData.myCreatedGames.some(e => e._id.toHexString() === r._id.toHexString()));
        resultGameData.availableGames = availableGames;
        res.write(JSON.stringify(resultGameData));
        all_db.close();
        res.end();
      })
      .catch(e => {
        logger.error("query all games failed, error: ", e);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.queryGameError,
          msg: e
        }
        res.end(JSON.stringify(errMsg));
        all_db.close();
      })
  }

  /** 选派/撤销裁判 */
  export function assign(req: express.Request, res: express.Response, next: express.NextFunction) {
    let reqData = req.body as types.assignData;
    logger.info('incoming assign data: ', req.body);
    let assign_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        assign_db = db;
        logger.info("assign mongo connected");
        const id = new mongoDb.ObjectId(util.getValue(reqData, "gameId"));
        const filter = {
          "_id": id,
          "referees.openid": util.getValue(reqData, 'openid'),
        };
        const assign = util.getValue(reqData, 'assign');
        const update = {
          "$set": { "referees.$.assigned": !assign },
        }
        return mongoUtil.update(db, config.gameCollection, filter, update);
      })
      .then(writeRes => {
        logger.info("assign success");
        assign_db.close();
        res.write('assign Success!');
        next();
      })
      .catch(e => {
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.assignError,
          msg: e
        }
        res.end(JSON.stringify(errMsg));
        assign_db.close();
      })
  }

  /** 根据gameId查询比赛信息 */
  export function queryGameById(req: express.Request, res: express.Response) {
    const data = req.body as types.gameByIdReqData;
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        this_db = db;
        logger.info('mongo query by id connected, request: ', data);
        const id = util.getValue(data, "colId");
        return mongoUtil.queryById(db, config.gameCollection, id);
      })
      .then(game => {
        logger.info("query game by id success, game: ", game);
        res.end(JSON.stringify(game));
        this_db.close();
      })
      .catch(err => {
        logger.error('query game by id failed, error: ', err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.queryGameError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close();
      })
  }

  /** 报名 */
  export function enrol(req, res, next) {
    logger.info('incoming enrol data: ', req.body);
    const data = req.body.data as types.enrolReqData;
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        this_db = db;
        logger.info("enrol mongo connected");
        const gameId = util.getValue(data, "gameId");
        return mongoUtil.queryById<types.gameData>(db, config.gameCollection, gameId);
      })
      .then(game => {
        const exists = game.referees && game.referees.some(r => r.openid === util.getValue(data, "openid"));
        if (exists) {
          logger.error('Error! enrol exists：', exists);
          const errMsg: types.errMsg = {
            status: errorCode.errCode.enrolExist,
            msg: '不能重复报名！',
          }
          res.status(400);
          res.end(JSON.stringify(errMsg));
          this_db.close();
          throw 'Error! enrol exists';
        } else {
          const objId = new mongoDb.ObjectId(util.getValue(data, "gameId"));
          const filter = { "_id": objId, };
          const update = { "$push": { "referees": data } };
          return mongoUtil.update(this_db, config.gameCollection, filter, update, { upsert: true });
        }
      })
      .then(r => {
        this_db.close();
        res.write('Enrol Success!');
        next();
      })
      .catch(err => {
        logger.error("enrol failed, error: ", err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.enrolError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close();
      })
  }

  /** 取消报名 */
  export function cancelEnrol(req: express.Request, res: express.Response, next: express.NextFunction) {
    let data = req.body as types.cancelEnrolData;
    let this_db: mongoDb.Db = null;
    logger.info("incoming cancel enrol data: ", req.body);

    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        this_db = db;
        const filter = {
          "_id": new mongoDb.ObjectId(util.getValue(data, "gameId")),
        }
        const update = {
          "$pull": {
            "referees": {
              openid: util.getValue(data, "openid"),
            }
          },
        }
        return mongoUtil.update(this_db, config.gameCollection, filter, update);
      })
      .then(updateRes => {
        this_db.close();
        res.write('Cancel Success');
        next();
      })
      .catch(err => {
        logger.error('cancel enrol failed, error: ', err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.cancelError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close();
      })
  }

  /** 更新报名信息 */
  export function updateEnrolInfo(req: express.Request, res: express.Response, next: express.NextFunction) {
    const data = req.body.data as types.enrolReqData;
    logger.info('incoming update enrol data: ', data);
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info('update enrol mongo connected');
        this_db = db;
        const filter = {
          "_id": new mongoDb.ObjectId(util.getValue(data, "gameId")),
          "referees.openid": util.getValue(data, "openid"),
        }
        const update = {
          "$set": {
            "referees.$": data,
          },
        }
        return mongoUtil.update(this_db, config.gameCollection, filter, update);
      })
      .then(writeRes => {
        logger.info("update enrol success");
        this_db.close();
        res.write('update enrol Success!');
        next();
      })
      .catch(err => {
        logger.error("update enrol failed, error: ", err);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.enrolUpdateError,
          msg: err,
        }
        this_db.close();
        res.end(JSON.stringify(errMsg));
      })
  }

  /** 删除比赛 */
  export function deleteGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    logger.info('incoming delete game data: ', req.body);
    let this_db: mongoDb.Db = null;
    const reqData = req.body as types.deleteGameData;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("delete game mongo connected");
        this_db = db;
        return mongoUtil.queryById<types.gameData>(db, config.gameCollection, req.body.gameId);
      })
      .then(game => {
        if (!game) throw new Error("no such game!");
        if (game.openid !== req.body.openid) {
          res.status(400);
          const errMsg: types.errMsg = {
            status: errorCode.errCode.deleteGameError,
            msg: '不能删除非自己发布的比赛！',
          }
          this_db.close();
          res.end(JSON.stringify(errMsg));
        } else {
          const id = new mongoDb.ObjectId(util.getValue(reqData, "gameId"))
          return mongoUtil.deleteById(this_db, config.gameCollection, id);
        }
      })
      .then(mongoRes => {
        logger.info('delete game succeed');
        this_db.close();
        res.write('delete game success!');
        next();
      })
      .catch(e => {
        logger.error("delete game failed, error", e);
        res.status(400);
        const errMsg: types.errMsg = {
          status: errorCode.errCode.deleteGameError,
          msg: e,
        }
        this_db.close();
        res.end(JSON.stringify(errMsg));
      })
  }
}
