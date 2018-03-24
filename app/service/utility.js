"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class UtilityService extends egg_1.Service {
    getCheckLogin() {
        let result = false;
        if (this.ctx.session.userId != null) {
            result = true;
        }
        return result;
    }
}
exports.UtilityService = UtilityService;
module.exports = UtilityService;
