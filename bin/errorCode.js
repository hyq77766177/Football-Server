"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errorCode;
(function (errorCode) {
    var errCode;
    (function (errCode) {
        errCode[errCode["badData"] = -1] = "badData";
        errCode[errCode["enrolExist"] = 100] = "enrolExist";
        errCode[errCode["queryGameError"] = 101] = "queryGameError";
        errCode[errCode["noOpenId"] = 102] = "noOpenId";
        errCode[errCode["cancelError"] = 103] = "cancelError";
        errCode[errCode["enrolUpdateError"] = 104] = "enrolUpdateError";
        errCode[errCode["enrolError"] = 105] = "enrolError";
        errCode[errCode["assignError"] = 106] = "assignError";
        errCode[errCode["deleteGameError"] = 107] = "deleteGameError";
    })(errCode = errorCode.errCode || (errorCode.errCode = {}));
})(errorCode = exports.errorCode || (exports.errorCode = {}));
//# sourceMappingURL=errorCode.js.map