import { Service, Context } from 'egg'
import raven from 'raven'
import reply from '../const/reply';
import * as ulid from 'ulid';
var Raven = require('raven');


export class AgentBanksService extends Service {

    raven: any;
    constructor(ctx: Context) {
        super(ctx);
        const config:any = this.app.config;
        this.raven =  Raven.config(config.raven.key).install();
    }
    //获取用户银行信息
    async getUserBankInfo(id: string) {
        let result:any = {
            id: "",
            shortId: "",
            createdAt: "",
            bankOpening: "", //开户行
            bankCardholder: "", //银行持卡人
            bankName: "", //银行名称
            bankCode: "",  //银行卡号
            bankPhone: "",  //银行卡号            
            money: "",
        };
        const userInfo = await this.ctx.model.User.findClientUser(id);
        if(userInfo != null){
            result.id =  userInfo._id;
            result.shortId =  userInfo.shortId;
            result.createdAt =  userInfo.createdAt;
            result.bankOpening =  userInfo.bank.bankOpening; //开户行
            result.bankCardholder =  userInfo.bank.bankCardholder; //银行持卡人
            result.bankName =  userInfo.bank.bankName; //银行名称
            result.bankCode =  userInfo.bank.bankCode;  //银行卡号
            result.bankPhone =  userInfo.bank.bankPhone;  //银行卡号            
            result.money =  userInfo.money;
        }
        return reply.success(result);
    }

    //修改银行卡信息
    async editUserBankInfo(id: string, bankOpening: string, bankCardholder: string, bankName: string, bankCode: number, phone: string) {
        let result: any = reply.err("手机号输入有误!");
        if (this.ctx.service.sms.checkPhone(phone)) {
            const cresult = await this.ctx.model.User.findUserAndUpdateBankInfo(id, bankOpening, bankCardholder, bankName, bankCode, phone);
            //数据埋点 修改手机号
            this.ctx.service.keenio.bindPhone(this.ctx.session.identity.current,this.ctx.session.userId,phone);
            //更换银行卡
            this.ctx.service.keenio.chengeBankCard(this.ctx.session.identity.current,this.ctx.session.userId,bankCardholder,cresult.realAuth.addrCode,cresult.realAuth.sex,bankCode,phone);
            result = reply.success(true, "银行卡信息修改成功");
        }
        return result;
    }

    //用户申请提现
    async withdrawals(userId: string, shortId: string, mongey: number) {
        let result = reply.err("提现失败请重试");
        const user = await this.ctx.model.User.findClientUser(userId);
        if (user != null) {
            //取款次数
            const countDays = await this.ctx.model.Withdrawals.findWithdrawalsSameDayCount(userId,  1);
            if(parseInt(countDays)<3){
                if (user.money >= mongey) {
                    const userlUpdate = await this.ctx.model.User.findUserAndUpdateMoney(userId, -mongey);
                    if (userlUpdate.money == (user.money - mongey)) {
                        const orderSn: any = ulid.ulid();
                        const cresult = await this.ctx.model.Withdrawals.createWithdrawals(userId, mongey, 1,orderSn);
                        result = reply.success(cresult, "申请提现操作成功");
                        //数据埋点
                        this.ctx.service.keenio.withdrawals(this.ctx.session.identity.current,user._id,this.ctx.session.curatorShortId,mongey,countDays,orderSn,user.bank.bankCode,user.bank.bankCode);
                    } else {
                        const rollBackUserl = await this.ctx.model.User.findUserAndUpdateMoney(userId, +mongey);
                        let helper:any = this.ctx.helper;

                        //只做尝试一次回滚!多次回滚怕有意外情况
                        if (rollBackUserl.money != user.money) {
                            // 提现接口回滚失败 userId
                            const err = `提现接口回滚失败 shortId: ${shortId} mongey: ${mongey} ${helper.formatTime()}`;
                            this.raven.captureException(err);
                        } else {
                            // 提现接口第一次回滚成功 userId
                            const err = `提现接口回滚成功 shortId: ${shortId} mongey: ${mongey} ${helper.formatTime()}`;
                            this.raven.captureException(err);
                        }
                    }
                } else {
                    result = reply.err("提现失败,提现金额大于可提现金额!");
                }
            }else{
                result = reply.err("提现失败,每天最多能提3笔!");
            }
        }
        return result;
    }

    //提现列表
    async withdrawalsList(id: string, limit: number = 10, page: number = 1) {
        page = page <= 0 ? 1 : page;
        page = (page - 1) * limit;
        const list = await this.ctx.model.Withdrawals.findWithdrawalsList(id, limit, page);
        const count = await this.ctx.model.Withdrawals.findWithdrawalsListCount(id);
        return reply.success({ list: list, count: count }, "ok");
    }

    //转卡列表
    async getCardList(id: string, identity: string, limit: number, page: number) {
        let data: any = {};
        //代理
        if (identity == 'agent') {
            const CuratorList = await this.getCardAgentList(id, limit, page);
            if (CuratorList.children != null) {
                data = reply.success(CuratorList);
            } else {
                data = reply.err("没有用户数据");
            }
        }
        //馆长 馆长+
        if (identity == 'curator' || identity == 'curator+') {
            const CuratorList = await this.getCardCuratorList(id, limit, page);
            if (CuratorList.children != null) {
                data = reply.success(CuratorList);
            } else {
                data = reply.err("没有管内用户数据");
            }
        }
        return data;
    }

    //馆长 馆长+卡列表
    async getCardCuratorList(id: string, limit: number, page: number) {
        let result: any = {
            children: {},
            curatorInfo: {}
        };
        const curatorId = await this.ctx.model.User.findGameUser(id);
        let curatorlist = await this.ctx.model.Curator.cardList(curatorId.curator, limit, page);
        if (curatorlist[0] != null) {
            result.children = curatorlist[0];
            result.curatorInfo = {
                coin: curatorId.coin,
                nickname: curatorId.nickname,
                shortId: curatorId.shortId
            }
        }
        return result;
    }

    //代理卡列表
    async getCardAgentList(id: string, limit: number, page: number) {
        let result: any = {
            children: {},
            curatorInfo: {}
        };
        const agentId = await this.ctx.model.User.findGameUser(id);
        let agentList = await this.ctx.model.Agent.cardList(agentId.agent, limit, page);
        if (agentList[0] != null) {
            result.children = agentList[0];
            result.curatorInfo = {
                coin: agentId.coin,
                nickname: agentId.nickname,
                shortId: agentId.shortId
            }
        }
        return result;
    }
}

module.exports = AgentBanksService;