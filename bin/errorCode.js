"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errorCode;
(function (errorCode) {
    var errCode;
    (function (errCode) {
        errCode[errCode["badData"] = -1] = "badData";
        errCode[errCode["enrolExist"] = 100] = "enrolExist";
        errCode[errCode["createGameError"] = 101] = "createGameError";
        errCode[errCode["queryGameError"] = 102] = "queryGameError";
        errCode[errCode["noOpenId"] = 103] = "noOpenId";
        errCode[errCode["cancelError"] = 104] = "cancelError";
        errCode[errCode["enrolUpdateError"] = 105] = "enrolUpdateError";
        errCode[errCode["enrolError"] = 106] = "enrolError";
        errCode[errCode["assignError"] = 107] = "assignError";
        errCode[errCode["deleteGameError"] = 108] = "deleteGameError";
        errCode[errCode["refereeRegistError"] = 109] = "refereeRegistError";
    })(errCode = errorCode.errCode || (errorCode.errCode = {}));
})(errorCode = exports.errorCode || (exports.errorCode = {}));
//# sourceMappingURL=errorCode.js.map