"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class AgentMailsService extends egg_1.Service {
    async getUserMailList(id, limit = 5, page = 1) {
        page = page <= 0 ? 1 : page;
        page = (page - 1) * limit;
        const result = await this.ctx.model.AgentMail.list(id, limit, page);
        return result;
    }
    async getUserMailListCount(id) {
        const result = await this.ctx.model.AgentMail.listCount(id);
        return result;
    }
}
exports.AgentMailsService = AgentMailsService;
module.exports = AgentMailsService;
