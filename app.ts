/// <reference path="./config.ts" />

import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as qs from 'querystring';
import * as _ from 'lodash';
import * as mongoDb from 'mongodb';
import * as log4js from 'log4js';
import * as bodyParser from 'body-parser';

import { config } from './config';
import { mongoUtil } from './mongolib';
import { errorCode } from './errorCode';

log4js.configure(config.log4js_conf);

const logger = log4js.getLogger('app.js');

export namespace server {

  export type errMsg = {
    status: number,
    msg: string,
  }

  export type gameData = {
    "_id" : mongoDb.ObjectId,
    "gameName" : string,
    "gameDate" : string,
    "gameTime" : string,
    "gameEndTime" : string,
    "refereeNumber" : number,
    "openid" : string,
    "referees" : enrolReq[],
  }

  const MongoClient = mongoDb.MongoClient;
  const DB_CONN_STR = mongoUtil.mongoUrl;

  let app = express();

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.post('/creategame', (req, res, next) => {
    logger.debug(req.body);
    let formData = req.body.formData;
    try {
      let document = formData;
      logger.debug('document: ', document);
      MongoClient.connect(DB_CONN_STR, (err, db) => {
        if (err) {
          logger.error(err);
        }
        logger.debug("mongo insert");
        mongoUtil.insertData(db, 'games', document, result => {
          logger.debug(result)
          db.close();
          next();
        })
      })
    } catch(e) {
      logger.error(e);
    }
  })

  app.post('/openid', (req, res, next) => {
    logger.debug('req_body: ', req.body);
    let code = req.body.code;
    if (code) {
      let url = config.getWXOpenIdUrl(code);
      let data = '';
      let hreq = https.get(url, hres => {
        hres.on('data', chunk => {
          data += chunk;
        })
        hres.on('end', () => {
          logger.debug('parsedData: ', data);
          res.write(data);
          res.end();
        })
      })
    }
  })

  app.post('/all', (req, res, next) => {
    MongoClient.connect(DB_CONN_STR, (err, db) => {
      logger.debug('mongo show all');
      const openid = req.body.openid;
      if (!openid) {
        const errMsg: server.errMsg = {
          status: errorCode.errCode.noOpenId,
          msg: '没有openid',
        }
        res.status(400);
        res.end(JSON.stringify(errMsg));
        return;
      }
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

  app.post('/gamebyid', (req, res, next) => {
    try {
      MongoClient.connect(DB_CONN_STR, (err, db) => {
        logger.debug('mongo query by id connected, request: ', req.body);
        mongoUtil.queryGameById(db, 'games', req.body.colId, result => {
          logger.debug(result);
          result = result[0];
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
            logger.error(err);
            return;
          }
          try {
            mongoUtil.queryGameById(db, 'games', data.gameId, result => {
              const resl = result[0] as gameData;
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
          } catch(e) {
            logger.error(e);
          }
        })
      } else {
        logger.error('no enrol data!');
      }
    } catch(e) {
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
        logger.error(err);
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
          logger.error(err);
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
        } catch(e) {
          logger.error(e);
        }
      })
    } else {
      logger.error('No update data!');
    }
  });

  app.use((req, res, next) => {
    res.write('Response from express, ' + new Date());
    res.end();
  })
  app.listen(config.port);

  logger.info(`server listening at 127.0.0.1: ${config.port}`);

}
