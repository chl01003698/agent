'use strict';
import { Controller } from 'egg'
import reply from '../../const/reply';

class AgentMailController extends Controller {
  //邮件列表
  async index() {
    const query = this.ctx.query as any
    const userId = this.ctx.session.userId;

    let limit: number = 5;
    let page: number = 0;

    if (typeof query.limit != "undefined") {
      limit = parseInt(query.limit);
    }
    if (typeof query.page != "undefined") {
      page = parseInt(query.page);
    }
    const list = await this.ctx.service.agentmails.getUserMailList(userId, limit, page);
    const count = await this.ctx.service.agentmails.getUserMailListCount(userId);
    const data = { list: list, count: count };
    this.ctx.body = reply.success(data);

  }

}
module.exports = AgentMailController;