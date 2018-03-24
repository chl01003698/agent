"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class AgentMessagesService extends egg_1.Service {
    async getMessageList() {
        // this.getTest();
        const result = await this.ctx.model.AgentMessage.list();
        return result;
    }
}
exports.AgentMessagesService = AgentMessagesService;
module.exports = AgentMessagesService;
