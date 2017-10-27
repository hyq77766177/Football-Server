/// <reference path="./config.ts" />

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

log4js.configure(config.log4js_conf);

const logger = log4js.getLogger('app.js');

export namespace server {

  // getValue 相关 >>>
  export function getValue<T, K1 extends keyof T>(request: T, key1: K1): T[K1]
  export function getValue<T, K1 extends keyof T, K2 extends keyof T[K1]>(request: T, key1: K1, key2?: K2): T[K1][K2]
  export function getValue(request: any, ...arg) {
    let result = _.get(request, arg);
    if (result === null || result === undefined) {
      logger.fatal(`bad request data, the key is missed or wrong written from path: ${arg.join("=>")}`);
      throw new Error(`bad request data, the key is missed or wrong written from path: ${arg.join("=>")}`);
    }
    return result;
  }
  // <<<

  export type errMsg = {
    status: number,
    msg: string,
  }

  export type gameData = {
    "_id": mongoDb.ObjectId,
    "gameName": string,
    "gameDate": string,
    "gameTime": string,
    "gameEndTime": string,
    "refereeNumber": number,
    "openid": string,
    "referees"?: enrolReq[],
  };

  const MongoClient = mongoDb.MongoClient;
  const DB_CONN_STR = mongoUtil.mongoUrl;

  export const app = express();

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  export type createGameData = {
    gameName: string,
    gameDate: string,
    gameEndTime: string,
    gameTime: string,
    refereeNumber: string,
    openid: string,
  };

  app.post('/creategame', (req, res, next) => {
    logger.info("incoming createData: ", req.body);
    let document: createGameData = req.body.formData;
    logger.debug('document: ', document);
    let this_db: mongoDb.Db = null
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("mongo connect success");
        this_db = db;
        return mongoUtil.insertData(db, config.gameCollection, document);
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.createGameError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close()
      });
  })

  export type openidData = {
    code: string,
  };

  app.post('/openid', (req, res) => {
    logger.info('incoming openid data: ', req.body);
    const data: openidData = req.body;
    let code = getValue(data, "code");
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
          res.write(JSON.stringify(dataObj));
          res.end();
        })
      })
    }
  })

  export type allData = {
    openid: string,
  };

  app.post('/all', (req, res) => {
    const reqData: allData = req.body;
    logger.info("incoming all data: ", reqData);
    let all_db: mongoDb.Db;
    let resultGameData = {
      myCreatedGames: null,
      myEnroledGames: null,
      availableGames: null,
    };
    const openid = getValue(reqData, "openid");
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("query all games mongo connected");
        all_db = db;
        return mongoUtil.queryGames(all_db, config.gameCollection, { "openid": openid });
      })
      .then(myCreatedGames => {
        logger.info('myCreatedGames:', myCreatedGames);
        resultGameData.myCreatedGames = myCreatedGames;
        return mongoUtil.queryGames(all_db, config.gameCollection, { "referees.openid": openid });
      })
      .then(myEnroledGames => {
        logger.info('myEnroledGames:', myEnroledGames);
        resultGameData.myEnroledGames = myEnroledGames;
        return mongoUtil.queryGames(all_db, config.gameCollection, null);
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.queryGameError,
          msg: e
        }
        res.end(JSON.stringify(errMsg));
        all_db.close();
      })
  })

  export type assignData = {
    openid: string,
    gameId: string,
    assign: boolean,
  };

  app.post('/assign', (req, res, next) => {
    let reqData = req.body as assignData;
    logger.info('incoming assign data: ', req.body);
    let assign_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        assign_db = db;
        logger.info("assign mongo connected");
        const id = new mongoDb.ObjectId(server.getValue(reqData, "gameId"));
        const filter = {
          "_id": id,
          "referees.openid": server.getValue(reqData, 'openid'),
        };
        const assign = server.getValue(reqData, 'assign');
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.assignError,
          msg: e
        }
        res.end(JSON.stringify(errMsg));
        assign_db.close();
      })
  })

  export type gameByIdReqData = {
    colId: string,
  };

  app.post('/gamebyid', (req, res) => {
    const data = req.body as gameByIdReqData;
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        this_db = db;
        logger.info('mongo query by id connected, request: ', data);
        const id = getValue(data, "colId");
        return mongoUtil.queryGameById(db, config.gameCollection, id);
      })
      .then(game => {
        logger.info("query game by id success, game: ", game);
        res.end(JSON.stringify(game));
        this_db.close();
      })
      .catch(err => {
        logger.error('query game by id failed, error: ', err);
        res.status(400);
        const errMsg: server.errMsg = {
          status: errorCode.errCode.queryGameError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close();
      })
  });

  export type enrolReq = {
    gameId: string,
    openid: string,
    startRefTime: string,
    endRefTime: string,
    refereeName: string,
  };

  app.post('/enrol', (req, res, next) => {
    logger.info('incoming enrol data: ', req.body);
    const data = req.body.data as enrolReq;
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        this_db = db;
        logger.info("enrol mongo connected");
        const gameId = getValue(data, "gameId");
        return mongoUtil.queryGameById(db, config.gameCollection, gameId);
      })
      .then(game => {
        const exists = game.referees && game.referees.some(r => r.openid === getValue(data, "openid"));
        if (exists) {
          logger.debug('exists：', exists);
          const errMsg: server.errMsg = {
            status: errorCode.errCode.enrolExist,
            msg: '不能重复报名！',
          }
          res.status(400);
          res.end(JSON.stringify(errMsg));
          this_db.close();
        } else {
          const filter = { "_id": new mongoDb.ObjectId(getValue(data, "gameId")), };
          const update = { "$pull": { "referees": { openid: server.getValue(data, "openid"), } } }
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.enrolError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close();
      })
  });

  export type cancelEnrolData = {
    gameId: string,
    openid: string
  };

  app.post('/cancelenrol', (req, res, next) => {
    let data = req.body as cancelEnrolData;
    let this_db: mongoDb.Db = null;
    logger.info("incoming cancel enrol data: ", req.body);

    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        this_db = db;
        const filter = {
          "_id": new mongoDb.ObjectId(getValue(data, "gameId")),
        }
        const update = {
          "$pull": {
            "referees": {
              openid: server.getValue(data, "openid"),
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.cancelError,
          msg: err
        }
        res.end(JSON.stringify(errMsg));
        this_db.close();
      })
  });

  app.post('/updateenrol', (req, res, next) => {
    const data = req.body.data as enrolReq;
    let this_db: mongoDb.Db = null;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info('update enrol mongo connected');
        this_db = db;
        const filter = {
          "_id": new mongoDb.ObjectId(getValue(data, "gameId")),
          "referees.openid": server.getValue(data, "openid"),
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.enrolUpdateError,
          msg: err,
        }
        this_db.close();
        res.end(JSON.stringify(errMsg));
      })
  });

  export type deleteGameData = {
    openid: string,
    gameId: string,
  };

  app.post('/deletegame', (req, res, next) => {
    logger.info('incoming delete game data: ', req.body);
    let this_db: mongoDb.Db = null;
    const reqData = req.body as deleteGameData;
    MongoClient.connect(DB_CONN_STR)
      .then(db => {
        logger.info("delete game mongo connected");
        this_db = db;
        return mongoUtil.queryGameById(db, config.gameCollection, req.body.gameId);
      })
      .then(game => {
        if (!game) throw new Error("no such game!");
        if (game.openid !== req.body.openid) {
          res.status(400);
          const errMsg: server.errMsg = {
            status: errorCode.errCode.deleteGameError,
            msg: '不能删除非自己发布的比赛！',
          }
          this_db.close();
          res.end(JSON.stringify(errMsg));
        } else {
          const id = new mongoDb.ObjectId(getValue(reqData, "gameId"))
          return mongoUtil.deleteGameById(this_db, config.gameCollection, id);
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
        const errMsg: server.errMsg = {
          status: errorCode.errCode.deleteGameError,
          msg: e,
        }
        this_db.close();
        res.end(JSON.stringify(errMsg));
      })
  })

  app.use((req, res, next) => {
    res.write('Response from express, ' + new Date());
    res.end();
  })
  app.listen(config.port);

  logger.info(`server listening at 127.0.0.1: ${config.port}`);

}
