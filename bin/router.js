"use strict";
/// <reference path="./app.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var bodyParser = require("body-parser");
var game_1 = require("./game");
var referee_1 = require("./referee");
var config_1 = require("./config");
var logger = log4js.getLogger('router.ts');
var Routers = /** @class */ (function () {
    function Routers(app) {
        if (Routers.RouterMgr !== null) {
            throw new Error('cannot create multy Routers!');
        }
        this.createAppRouters(app);
    }
    Routers.prototype.createAppRouters = function (app) {
        app.use(bodyParser.json({ limit: '1mb' }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        /** 创建比赛 */
        app.post('/creategame', game_1.game.createGame);
        /** 获取openid */
        app.post('/openid', game_1.game.openid);
        /** 获取所有比赛信息 */
        app.post('/all', game_1.game.getAllGameData);
        /** 根据比赛ID查询 */
        app.post('/gamebyid', game_1.game.queryGameById);
        /** 选派和撤销 */
        app.post('/assign', game_1.game.assign);
        /** 报名 */
        app.post('/enrol', game_1.game.enrol);
        /** 取消报名 */
        app.post('/cancelenrol', game_1.game.cancelEnrol);
        /** 更新报名信息 */
        app.post('/updateenrol', game_1.game.updateEnrolInfo);
        /** 删除比赛 */
        app.post('/deletegame', game_1.game.deleteGame);
        /** 裁判信息注册 */
        app.post('/registinfo', referee_1.Referee.regist);
        /** 载入裁判信息 */
        app.post('/showreferee', referee_1.Referee.showReferee);
        /** 统一处理的中间件 */
        app.use(function (req, res, next) {
            res.write('Response from express, ' + new Date());
            res.end();
        });
        app.listen(config_1.config.port);
        logger.info("server listening at 127.0.0.1: " + config_1.config.port);
    };
    Routers.RouterMgr = null;
    return Routers;
}());
exports.Routers = Routers;
//# sourceMappingURL=router.js.map