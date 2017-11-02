"use strict";
/// <reference path="./config.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router_1 = require("./router");
var server;
(function (server) {
    server.app = express();
    router_1.Routers.RouterMgr = new router_1.Routers(server.app);
})(server = exports.server || (exports.server = {}));
//# sourceMappingURL=app.js.map