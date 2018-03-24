'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const reply_1 = require("../../const/reply");
class AgentMailController extends egg_1.Controller {
    //邮件列表
    async index() {
        const query = this.ctx.query;
        const userId = this.ctx.session.userId;
        let limit = 5;
        let page = 0;
        if (typeof query.limit != "undefined") {
            limit = parseInt(query.limit);
        }
        if (typeof query.page != "undefined") {
            page = parseInt(query.page);
        }
        const list = await this.ctx.service.agentmails.getUserMailList(userId, limit, page);
        const count = await this.ctx.service.agentmails.getUserMailListCount(userId);
        const data = { list: list, count: count };
        this.ctx.body = reply_1.default.success(data);
    }
}
module.exports = AgentMailController;
