"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var app_1 = require("./app");
var app = app_1.server.app;
var expect = chai.expect;
// request(app).post('/creategame').expect(200)
describe("创建比赛数据", function () {
    it("创建成功", function () {
        expect(1).to.be.eql(2);
    });
});
//# sourceMappingURL=app.test.js.map