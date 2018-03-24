import {Service,Context} from 'egg'

export class AgentMessagesService extends Service{

    async getMessageList(){
        // this.getTest();
        const result = await this.ctx.model.AgentMessage.list();
        return result;
    }
    // async getTest(){
    //     let users =  new this.ctx.model.AgentMessage({"content":"全服发钱了快快领取"});
    //     let userInfo = await users.save();
    //      users =  new this.ctx.model.AgentMessage({"content":"全服发钱了快快领取"});
    //      userInfo = await users.save();
    //     return userInfo;
    // }
}

module.exports = AgentMessagesService;