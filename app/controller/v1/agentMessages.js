'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const reply_1 = require("../../const/reply");
class AgentMessageController extends egg_1.Controller {
    //公告列表
    async index() {
        const list = await this.ctx.service.agentMessages.getMessageList();
        this.ctx.body = reply_1.default.success(list);
    }
}
module.exports = AgentMessageController;
