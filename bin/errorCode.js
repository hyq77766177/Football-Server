"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errorCode;
(function (errorCode) {
    var errCode;
    (function (errCode) {
        errCode[errCode["enrolExist"] = 100] = "enrolExist";
        errCode[errCode["noOpenId"] = 101] = "noOpenId";
        errCode[errCode["cancelError"] = 102] = "cancelError";
        errCode[errCode["enrolUpdateError"] = 103] = "enrolUpdateError";
        errCode[errCode["enrolError"] = 104] = "enrolError";
        errCode[errCode["assignError"] = 105] = "assignError";
    })(errCode = errorCode.errCode || (errorCode.errCode = {}));
})(errorCode = exports.errorCode || (exports.errorCode = {}));
//# sourceMappingURL=errorCode.js.map