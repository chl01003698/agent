'use strict';
import { Controller } from 'egg'
import reply from '../../const/reply';

class AgentMessageController extends Controller {
  //公告列表
  async index() {
      const list = await this.ctx.service.agentMessages.getMessageList();
      this.ctx.body =  reply.success(list);
  }
}
module.exports = AgentMessageController;