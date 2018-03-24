'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const code = {
    FAILED: -1,
    SUCCESS: 0
};
exports.default = {
    code: code,
    success: function (data, msg = "ok") {
        return { code: 0, msg: msg, data: data };
    },
    err: function (msg, code = -1) {
        return { code: code, msg: msg };
    }
};
