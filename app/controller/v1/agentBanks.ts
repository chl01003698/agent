'use strict';
import { Controller } from 'egg'
import reply from '../../const/reply';
import { phone } from 'yunpian-sdk';
import * as generate from 'nanoid/generate'
var IDValidator = require('id-validator');
var GB2260 = require('id-validator/src/GB2260');

class AgentBanksController extends Controller {
    //获取用户银行信息
    async index() {
        const query = this.ctx.query as any
        const userId = this.ctx.session.userId;

        let limit: number = 5;
        let page: number = 1;
        let sortId: number = 0;

        if (typeof query.limit != "undefined") {
            limit = parseInt(query.limit);
        }
        if (typeof query.page != "undefined") {
            page = parseInt(query.page);
        }

        let list = await this.ctx.service.agentBanks.getUserBankInfo(userId);
        this.ctx.body = list;

    }

    //修改用户银行卡信息
    async create() {
        const Joi = this.app.Joi;
        const params = this.ctx.request.body as any
        const userId = this.ctx.session.userId;

        let { error, value } = this.ctx.validate(Joi.object().keys({
            bankopening: Joi.string().required(),
            bankcardholder: Joi.string().required(),
            bankname: Joi.string().required(),
            bankcode: Joi.string().required(),
            bankphone: Joi.string().min(11).max(11).required(),
            authcode: Joi.string().min(4).max(4).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("请仔细检查录入信息");
        } else {
            const auth = await this.ctx.service.sms.auth(params.bankphone, params.authcode);
            console.log("修改银行啊验证码", auth);
            if (auth) {
                const childInfo = await this.ctx.service.agentBanks.editUserBankInfo(userId, params.bankopening, params.bankcardholder, params.bankname, parseInt(params.bankcode),params.bankphone);
                this.ctx.body = childInfo;
            } else {
                this.ctx.body = reply.err('验证码错误请重试');
            }
        }

    }

    //用户申请提现
    async withdrawals() {
        const Joi = this.app.Joi;
        const params = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        const userShortId = this.ctx.session.shortId;
        let   result :any = {};
        let { error, value } = this.ctx.validate(Joi.object().keys({
            money: Joi.number().required(),
            phone: Joi.string().min(11).max(11).required(),
            authCode: Joi.string().min(4).max(4).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            result = reply.err("输入有误,请检查金额,手机号,验证码");
        } else {
            //认证 1填写真实姓名和身份证 2.填写银行卡信息 3已填写过
                const auth = await this.ctx.service.sms.auth(params.phone, params.authCode);
                console.log("用户申请提现", auth);
                if (auth) {
                    result = reply.err("请输入大于0的提款金额")
                    if(parseInt(params.money) >0){
                        result = await this.ctx.service.agentBanks.withdrawals(userId, userShortId, parseInt(params.money));
                    }
                } else {
                    result = reply.err('验证码错误请重试');
                }
            
        }
        this.ctx.body =   result;
    }

    //手机验证码
    async verificationCode() {
        const Joi = this.app.Joi;
        const reqBody = this.ctx.request.body as any;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            phone: Joi.string().min(11).required()
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("输入有误,请检查手机号");
        } else {
            const phoneNumber = reqBody.phone;
            const validatePhone = phone(phoneNumber);
            if (validatePhone) {
                const authCode = generate('1234567890', 4);
                console.log("手机验证码", authCode);
                const result = await this.ctx.service.sms.send(phoneNumber, authCode);
                if (result.result) {
                    this.ctx.body = reply.success({ smscode: authCode },"验证码发送成功");
                } else {
                    this.ctx.body = reply.err(result.sendResult.detail, result.sendResult.code);
                }
            } else {
                this.ctx.body = reply.err('手机号码校验失败');
            }
        }
    }

    //提现历史列表
    async withdrawalsList() {
        const Joi = this.app.Joi;
        const request = this.ctx.query as any
        const userId = this.ctx.session.userId;
        console.log("传入参数withdrawals===>", request);
        let limit: number = 5;
        let page: number = 1;
        if (typeof request.limit != "undefined") {
            limit = parseInt(request.limit);
        }
        if (typeof request.page != "undefined") {
            page = parseInt(request.page);
        }
        const useInfo = await this.ctx.service.agentBanks.withdrawalsList(userId, limit, page);
        this.ctx.body = useInfo;
    }

}

module.exports = AgentBanksController;
