'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const reply_1 = require("../../const/reply");
class AgentCardsController extends egg_1.Controller {
    //转卡列表 馆长 代理
    async index() {
        const query = this.ctx.query;
        const userId = this.ctx.session.userId;
        let limit = 5;
        let page = 1;
        let sortId = 0;
        if (typeof query.limit != "undefined") {
            limit = parseInt(query.limit);
        }
        if (typeof query.page != "undefined") {
            page = parseInt(query.page);
        }
        this.ctx.body = await this.ctx.service.agentCards.getCardList(userId, this.ctx.session.identity.current, limit, page);
    }
    //查找  馆长查用户 代理查馆长
    async show() {
        let result = {};
        const Joi = this.app.Joi;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            id: Joi.string().required(),
        }), this.ctx.params, {}, false);
        if (error != null && error.name == "ValidationError") {
            result = reply_1.default.err("输入id有误");
        }
        else {
            const params = this.ctx.params;
            let sortId = 0;
            if (typeof params.id != "undefined") {
                sortId = parseInt(params.id);
            }
            switch (this.ctx.session.identity.current) {
                case "curator":
                    result = await this.ctx.service.agentCards.getChildInfo(sortId);
                    break;
                case "agent":
                    result = await this.ctx.service.agentCards.findCurator(sortId);
                    break;
            }
        }
        this.ctx.body = result;
    }
    //转卡给指定用户
    async create() {
        const Joi = this.app.Joi;
        const params = this.ctx.request.body;
        const userId = this.ctx.session.userId;
        let result = {};
        let { error, value } = this.ctx.validate(Joi.object().keys({
            childrenid: Joi.string().required(),
            cardnum: Joi.string().required(),
        }), this.ctx.request.body, {}, false);
        if (error != null && error.name == "ValidationError") {
            result = reply_1.default.err("请检查转卡数");
        }
        else {
            result = reply_1.default.err("请输入大于0的转卡数");
            if (parseInt(params.cardnum) > 0) {
                result = await this.ctx.service.agentCards.transferStockToBindCard(userId, params.childrenid, parseInt(params.cardnum));
            }
        }
        this.ctx.body = result;
    }
    //转卡给自己 和上面接口逻辑一样更新字段不一样
    async transferStockToCard() {
        const Joi = this.app.Joi;
        const params = this.ctx.request.body;
        const userId = this.ctx.session.userId;
        let result = {};
        let { error, value } = this.ctx.validate(Joi.object().keys({
            cardnum: Joi.string().required(),
        }), this.ctx.request.body, {}, false);
        if (error != null && error.name == "ValidationError") {
            result = reply_1.default.err("请检查转卡数");
        }
        else {
            result = reply_1.default.err("请输入大于0的转卡数");
            if (parseInt(params.cardnum) > 0) {
                result = await this.ctx.service.agentCards.transferStockToCard(userId, parseInt(params.cardnum));
            }
        }
        this.ctx.body = result;
    }
    //库存列表
    async stockList() {
        const query = this.ctx.query;
        let data = {};
        let limit = 5;
        let page = 1;
        let type = 0;
        if (typeof query.limit != "undefined") {
            limit = parseInt(query.limit);
        }
        if (typeof query.page != "undefined") {
            page = parseInt(query.page);
        }
        if (typeof query.page != "undefined") {
            type = parseInt(query.type);
        }
        if (typeof query.date != 'undefined') {
            data = await this.ctx.service.agentCards.findStockList(query.date, type, limit, page);
        }
        else {
            data = await this.ctx.service.agentCards.findStockTypeList(type, limit, page);
        }
        this.ctx.body = reply_1.default.success(data);
    }
    //进货
    async purchase() {
        const Joi = this.app.Joi;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            num: Joi.string().min(1).required(),
            channel: Joi.string().required(),
        }), this.ctx.request.body, {}, false);
        const body = this.ctx.request.body;
        const userId = this.ctx.session.userId;
        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply_1.default.err("请检查进货数");
        }
        else {
            //卡数
            const cardnum = parseInt(body.num) * 300;
            //金额
            const money = parseInt(body.num) * 200;
            let clientip = this.ctx.ip;
            if (clientip == "::1") {
                clientip = "127.0.0.1";
            }
            const data = await this.ctx.service.agentCards.purchase(userId, cardnum, money, clientip, body.channel);
            this.ctx.body = reply_1.default.success(data);
        }
    }
    //Ping++ callback
    async pingCallBack() {
        console.log("接收到  Ping++ POST =============> id", this.ctx.request.body);
        const data = await this.ctx.service.agentCards.pingCallBack(this.ctx.request.body);
        this.ctx.body = true;
    }
    //订单状态
    async orderStatus() {
        const Joi = this.app.Joi;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            transactionid: Joi.string().required(),
        }), this.ctx.request.body, {}, false);
        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply_1.default.err("请检查进货数");
        }
        else {
            const body = this.ctx.request.body;
            const data = await this.ctx.service.agentCards.orderStatus(body.transactionid);
            this.ctx.body = data;
        }
    }
}
module.exports = AgentCardsController;
