/// <reference path="./config.ts" />

import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as qs from 'querystring';
import * as _ from 'lodash';
import * as mongoDb from 'mongodb';
import { config } from './config';
import { mongoUtil } from './mongolib';

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
        console.log(err);
      }
      console.log(new Date(), "mongo insert");
      mongoUtil.insertData(db, 'games', document, (result) => {
        console.log(result);
        db.close();
        next();
      })
    })
  })

  app.use('/openid', (req, res, next) => {
    console.log(req.query);
    let code = req.query.code;
    if (code) {
      let url = `https://api.weixin.qq.com/sns/jscode2session?appId=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`;
      let data = '';
      let hreq = https.get(url, hres => {
        hres.on('data', chunk => {
          data += chunk;
        })
        hres.on('end', () => {
          console.log(new Date(), '*** parsedData: ', data);
          res.write(data);
          res.end();
        })
      })
    }
  })

  app.use('/all', (req, res, next) => {
    let allGames = [];
    MongoClient.connect(DB_CONN_STR, (err, db) => {
      console.log(new Date(), 'mongo show all');
      mongoUtil.showAllData(db, 'games', result => {
        console.log(result);
        res.write(JSON.stringify(result));
        db.close();
        res.end();
      })
    })
  })

  app.use((req, res, next) => {
    res.write('Response from express, ' + new Date());
    res.end();
  })
  app.listen(config.port);

  console.log(new Date(), `server listening at 127.0.0.1: ${config.port}`);

}
