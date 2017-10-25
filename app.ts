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
    assert(!!result, `bad request data, the key is missed or wrong written from path: ${arg.join("=>")}`);
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
    logger.debug(req.body);
    let formData = req.body.formData;
    try {
      let document: createGameData = formData;
      logger.debug('document: ', document);
      MongoClient.connect(DB_CONN_STR, (err, db) => {
        if (err) {
          logger.error('[createGame] mongo connect error!', err);
        }
        logger.debug("mongo insert");
        mongoUtil.insertData(db, 'games', document, result => {
          logger.debug(result)
          db.close();
          next();
        })
      })
    } catch (e) {
      logger.error(e);
    }
  })

  export type openidData = {
    code: string,
  };

  app.post('/openid', (req, res, next) => {
    logger.debug('req_body: ', req.body);
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

  app.post('/all', (req, res, next) => {
    let reqData: allData = req.body;
    logger.debug("incoming all data: ", reqData);
    MongoClient.connect(DB_CONN_STR, (err, db) => {
      logger.debug('mongo show all');
      const openid = getValue(reqData, "openid");
      mongoUtil.allGames(db, 'games', resAll => {
        logger.debug('allGames:', resAll);
        mongoUtil.myCreatedGames(db, 'games', openid, resultC => {
          logger.debug('myCreatedGames:', resultC);
          mongoUtil.myEnroledGames(db, 'games', openid, resultE => {
            logger.debug('myEnroledGames:', resultE);
            let availableGames = resAll.filter(r => !resultC.some(c => c._id.toHexString() === r._id.toHexString()) && !resultE.some(e => e._id.toHexString() === r._id.toHexString()));
            logger.debug('availableGames: ', availableGames);
            let responseData = {
              availableGames: availableGames,
              myCreatedGames: resultC,
              myEnroledGames: resultE,
            }
            res.write(JSON.stringify(responseData));
            db.close();
            res.end();
          })
        })
      })
    })
  })

  export type assignData = {
    openid: string,
    gameId: string,
    assign: boolean,
  };

  app.post('/assign', (req, res, next) => {
    let reqData = req.body as assignData;
    logger.debug('assign incoming data: ', req.body);
    MongoClient.connect(DB_CONN_STR, (e, db) => {
      if (e) {
        logger.error('[assign] mongo connect error! ', e);
        return;
      }
      mongoUtil.assign(db, 'games', reqData, err => {
        if (err) {
          res.status(400);
          const errMsg: server.errMsg = {
            status: errorCode.errCode.assignError,
            msg: err,
          }
          db.close();
          res.end(JSON.stringify(errMsg));
        } else {
          db.close();
          res.end('assign Success!' + new Date().toLocaleString());
        }
      })
    })
  })

  app.post('/gamebyid', (req, res, next) => {
    try {
      MongoClient.connect(DB_CONN_STR, (err, db) => {
        logger.debug('mongo query by id connected, request: ', req.body);
        mongoUtil.queryGameById(db, 'games', req.body.colId, result => {
          logger.debug(result);
          res.write(JSON.stringify(result));
          db.close();
          res.end();
        })
      })
    } catch (e) {
      logger.error(e);
    }
  });

  export type enrolReq = {
    gameId: string,
    openid: string,
    startRefTime: string,
    endRefTime: string,
    refereeName: string,
  };

  app.post('/enrol', (req, res, next) => {
    logger.debug('enrol data: ', req.body);
    try {
      let data = req.body.data as enrolReq;
      if (data) {
        MongoClient.connect(DB_CONN_STR, (err, db) => {
          if (err) {
            logger.error('[enrol] mongo connect error!', err);
            return;
          }
          try {
            mongoUtil.queryGameById(db, 'games', data.gameId, result => {
              const resl = result as gameData;
              logger.debug('find result: ', resl);
              logger.debug('find result.referees: ', resl['referees']);
              let exists = resl.referees && resl['referees'].some(r => r.openid === data.openid);
              if (exists) {
                logger.debug('exists：', exists);
                const errMsg: server.errMsg = {
                  status: errorCode.errCode.enrolExist,
                  msg: '不能重复报名！',
                }
                res.status(400); // errorCode.errCode.enrolExist);
                res.end(JSON.stringify(errMsg));
                db.close();
              } else {
                mongoUtil.enrol(db, 'games', data, err => {
                  if (err) {
                    const errMsg: server.errMsg = {
                      status: errorCode.errCode.enrolError,
                      msg: err,
                    }
                    db.close();
                    res.end(JSON.stringify(errMsg));
                  } else {
                    db.close();
                    res.end('Enrol Success!' + new Date().toLocaleString());
                  }
                });
              }
            })
          } catch (e) {
            logger.error(e);
          }
        })
      } else {
        logger.error('no enrol data!');
      }
    } catch (e) {
      logger.error(e);
    }
  })

  export type cancelEnrolData = {
    gameId: string,
    openid: string
  };

  app.post('/cancelenrol', (req, res) => {
    let data = req.body as cancelEnrolData;
    logger.debug(req.body);
    MongoClient.connect(DB_CONN_STR, (err, db) => {
      if (err) {
        logger.error('[cancel enrol] mongo connect error!', err);
        return;
      }
      mongoUtil.cancelEnrol(db, 'games', data, err => {
        if (err) {
          res.status(400);
          const errMsg: server.errMsg = {
            status: errorCode.errCode.cancelError,
            msg: err,
          }
          db.close();
          res.end(JSON.stringify(errMsg));
        } else {
          db.close();
          res.end('Cancel Success!' + new Date().toLocaleString());
        }
      })
    })
  });

  app.post('/updateenrol', (req, res, next) => {
    const data = req.body.data as enrolReq;
    if (data) {
      MongoClient.connect(DB_CONN_STR, (err, db) => {
        if (err) {
          logger.error('[update enrol] mongo connect error!', err);
          return;
        }
        try {
          mongoUtil.enrolUpdate(db, 'games', data, err => {
            if (err) {
              res.status(400);
              const errMsg: server.errMsg = {
                status: errorCode.errCode.enrolUpdateError,
                msg: err,
              }
              db.close();
              res.end(JSON.stringify(errMsg));
            } else {
              db.close();
              res.end('update enrol Success!' + new Date().toLocaleString());
            }
          });
        } catch (e) {
          logger.error(e);
        }
      })
    } else {
      logger.error('No update data!');
    }
  });

  export type deleteGameData = {
    openid: string,
    gameId: string,
  };

  app.post('/deletegame', (req, res, next) => {
    logger.debug('incoming delete game data: ', req.body);
    MongoClient.connect(DB_CONN_STR, (e, db) => {
      if (e) {
        logger.error('delete game connect error: ', e);
        return;
      }
      mongoUtil.queryGameById(db, 'games', req.body.gameId, (game) => {
        if (game.openid !== req.body.openid) {
          res.status(400);
          const errMsg: server.errMsg = {
            status: errorCode.errCode.deleteGameError,
            msg: '不能删除非自己发布的比赛！',
          }
          db.close();
          res.end(JSON.stringify(errMsg));
        } else {
          mongoUtil.deleteGame(db, 'games', req.body, (err) => {
            if (err) {
              res.status(400);
              const errMsg: server.errMsg = {
                status: errorCode.errCode.deleteGameError,
                msg: err,
              }
              db.close();
              res.end(JSON.stringify(errMsg));
            } else {
              db.close();
              res.end('delete game success!' + new Date().toLocaleString());
            }
          });
        }
      })
    })
  })

  app.use((req, res, next) => {
    res.write('Response from express, ' + new Date());
    res.end();
  })
  app.listen(config.port);

  logger.info(`server listening at 127.0.0.1: ${config.port}`);

}
