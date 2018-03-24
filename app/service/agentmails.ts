import {Service,Context} from 'egg'

export class AgentMailsService extends Service{
    async getUserMailList(id:string,limit:number = 5,page:number=1){
        page = page<=0?1:page;
        page = (page-1) * limit;
        const result = await this.ctx.model.AgentMail.list(id, limit, page);
        return result;
    }

    async getUserMailListCount(id:string){
        const result =await this.ctx.model.AgentMail.listCount(id);
        return result;
    }
}

module.exports = AgentMailsService;