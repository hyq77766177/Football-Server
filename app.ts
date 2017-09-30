/// <reference path="./config.ts" />

import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as qs from 'querystring';
import * as _ from 'lodash';
import * as mongoDb from 'mongodb';
import * as log4js from 'log4js';

import { config } from './config';
import { mongoUtil } from './mongolib';

log4js.configure(config.log4js_conf);

const logger = log4js.getLogger('app.js');

namespace server {

  const MongoClient = mongoDb.MongoClient;
  const DB_CONN_STR = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`

  let app = express();

  app.use('/creategame', (req, res, next) => {
    // console.log(req)
    let formData = req.query.formData;
    let document = JSON.parse(formData);
    document['openid'] = req.query.openid;
    // console.log('document: ', document)
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
  })

  app.use('/openid', (req, res, next) => {
    logger.debug('req_query: ', req.query);
    let code = req.query.code;
    if (code) {
      let url = `https://api.weixin.qq.com/sns/jscode2session?appId=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`;
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

  app.use('/all', (req, res, next) => {
    MongoClient.connect(DB_CONN_STR, (err, db) => {
      logger.debug('mongo show all');
      mongoUtil.showAllData(db, 'games', result => {
        logger.debug(result);
        res.write(JSON.stringify(result));
        db.close();
        res.end();
      })
    })
  })

  app.use('/gamebyid', (req, res, next) => {
    try {
      MongoClient.connect(DB_CONN_STR, (err, db) => {
        logger.debug('mongo query by id connected, request: ', req.query);
        mongoUtil.queryGameById(db, 'games', req.query.colId, result => {
          logger.debug(result);
          result = result[0];
          res.write(JSON.stringify(result));
          db.close;
          res.end();
        })
      })
    } catch (e) {
      logger.error(e);
    }
  })

  app.use('/enrol', (req, res, next) => {
    res.write('Enrol succeess!');
    res.end();
  })

  app.use((req, res, next) => {
    res.write('Response from express, ' + new Date());
    res.end();
  })
  app.listen(config.port);

  logger.info(`server listening at 127.0.0.1: ${config.port}`);

}
