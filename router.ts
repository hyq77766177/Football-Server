/// <reference path="./app.ts" />

import * as express from 'express';
import * as log4js from 'log4js';
import * as bodyParser from 'body-parser';

import { server } from './app';
import { game } from './game';
import { Referee } from './referee';
import { config } from './config';

const logger = log4js.getLogger('router.ts');

export class Routers {

  public static RouterMgr: Routers = null;

  constructor(app: express.Express) {
    if (Routers.RouterMgr !== null) {
      throw new Error('cannot create multy Routers!');
    }
    this.createAppRouters(app);
  }

  private createAppRouters(app: express.Express) {

    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    /** 创建比赛 */
    app.post('/creategame', game.createGame);
    /** 获取openid */
    app.post('/openid', game.openid);
    /** 获取所有比赛信息 */
    app.post('/all', game.getAllGameData);
    /** 根据比赛ID查询 */
    app.post('/gamebyid', game.queryGameById);
    /** 选派和撤销 */
    app.post('/assign', game.assign);
    /** 报名 */
    app.post('/enrol', game.enrol);
    /** 取消报名 */
    app.post('/cancelenrol', game.cancelEnrol);
    /** 更新报名信息 */
    app.post('/updateenrol', game.updateEnrolInfo);
    /** 删除比赛 */
    app.post('/deletegame', game.deleteGame);

    /** 裁判信息注册 */
    app.post('/registinfo', Referee.regist);

    /** 统一处理的中间件 */
    app.use((req, res, next) => {
      res.write('Response from express, ' + new Date());
      res.end();
    })
    app.listen(config.port);

    logger.info(`server listening at 127.0.0.1: ${config.port}`);

  }

}
