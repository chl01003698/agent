'use strict';
import { Controller } from 'egg'
import reply from '../../const/reply';
import { ADDRCONFIG } from 'dns';
// import * as fs  from  'fs';
var fs = require('fs');

class AgentsController extends Controller {
    //用户登录
    async login() {
        let result: any = {};
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        let { error, value } = this.ctx.validate(Joi.object().keys({
            phone: Joi.number().min(11).required(),
            password: Joi.number().min(6).required(),
        }), this.ctx.request.body, {}, false);
        if (error != null && error.name == "ValidationError") {
            result = reply.err("手机号应为11位,密码不能应小于6位");
        } else {
            result = await this.ctx.service.agent.userLogin(request.phone, request.password);
        }
        console.log("用户登录------>",result);
        this.ctx.body =  result;
    }
    //用户退出
    async logout() {
        this.ctx.session = null;
        this.ctx.body = reply.success(true, "退出成功");
    }

    //我的棋牌室
    async myChessRoom() {
        const phone = this.ctx.session.phone;
        const account = await this.ctx.service.agent.myChessRoom(phone);
        this.ctx.body = account;
    }

    //用户修改密码
    async editPassword() {
        console.log('用户修改密码');
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            password: Joi.string().min(6).required(),
            checkpassword: Joi.string().min(6).required(),
            oldpassword: Joi.string().min(6).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("密码长度不能小于6位");
        } else {
            if(request.password == request.checkpassword){
                const account = await this.ctx.service.agent.editPassword(userId, request.password, request.oldpassword);
                this.ctx.body = account;
            }else{
                this.ctx.body = reply.err("新密码输入不一致");
            }
        }
    }

    //修改棋牌室名称
    async myChessNameEditor() {
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const curatorId = this.ctx.session.curatorId;

        console.log('修改棋牌室名称');

        let { error, value } = this.ctx.validate(Joi.object().keys({
            name: Joi.string().min(1).max(8).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("棋牌室名称只能输入1~8位字符");
        } else {
            const account = await this.ctx.service.agent.myChessNameEditor(curatorId, request.name);
            this.ctx.body = account;
        }
    }

    //修改棋牌室宣言
    async myChessDeclarationEditor() {
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const curatorId = this.ctx.session.curatorId;

        console.log('修改棋牌室宣言');

        let { error, value } = this.ctx.validate(Joi.object().keys({
            declaration: Joi.string().min(1).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("宣言不能小于1位");
        } else {
            const account = await this.ctx.service.agent.myChessDeclarationEditor(curatorId, request.declaration);
            this.ctx.body = account;
        }
    }

    //获取棋牌室信息
    async getChessInfo() {
        const phone = this.ctx.session.phone;
        console.log('获取棋牌室信息');
        this.ctx.body = await this.ctx.service.agent.getChessInfo(phone);
    }

    //修改微信号
    async wechatNumberEditor() {
        console.log('修改微信号');
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            wechatNumber: Joi.string().min(1).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("微信号不能小于1位");
        } else {
            const account = await this.ctx.service.agent.wechatNumberEditor(userId, request.wechatNumber);
            this.ctx.body = account;
        }
    }
    /**
     * 馆长 解绑用户 
     * 解绑user.parent
     * curator.childCount 减少 1
     * curator.children 删除相应 objectId
     */
    async untyingUsers() {
        let result:any ={};
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            childrenShortId: Joi.string().min(1).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            result= reply.err("解绑字段不能小于1位");
        } else {
            const account = await this.ctx.service.agent.untyingUsers(userId, request.childrenShortId);
             result= account;
        }
        this.ctx.body =result;
    }
    //切换身份
    async switchIdentity() {
        console.log("切换身份=== >");
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            identity: Joi.string().min(1).required(),
        }), this.ctx.request.body, {}, false);
        let result: any = {};
        if (error != null && error.name == "ValidationError") {
            result = reply.err("切换身份字段不能小于1位");
        } else {
            //身份在列表中.
            const arr = ['curator', 'agentSuper', 'agent'];
            result = reply.err('身份切换失败');
            let flag :boolean = false;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == request.identity.toLowerCase()) {
                    flag = true;
                    break;
                }
            }
            if(flag){
                const identity = request.identity.toLowerCase();
                if(this.ctx.session.identity.current != identity){
                    this.ctx.session.identity.current = identity;
                    result = await this.ctx.service.agent.checkIdentity(identity);
                }else{
                    result = reply.err("当前身份不需要切换");
                }
            }
        }
        this.ctx.body = result;
    }

    //认证用户姓名身份证
    async realAuthRealname() {
        console.log("认证用户姓名身份证=== >");
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            identity: Joi.string().min(1).required(),
            realname: Joi.string().min(1).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("真实姓名和身份证号不能小于1位");
        } else {
            const user = await this.ctx.service.agent.realAuthRealname(userId, request.identity, request.realname);
            this.ctx.body = user;
        }

    }

    //认证用户省市
    async realAuthRealCity() {
        console.log("认证用户省市=== >");
        const Joi = this.app.Joi;
        const request = this.ctx.request.body as any
        const userId = this.ctx.session.userId;
        let { error, value } = this.ctx.validate(Joi.object().keys({
            city: Joi.string().min(1).required(),
            province: Joi.string().min(1).required(),
        }), this.ctx.request.body, {}, false);

        if (error != null && error.name == "ValidationError") {
            this.ctx.body = reply.err("请选择省市信息");
        } else {
            const user = await this.ctx.service.agent.realAuthRealCity(userId, request.city, request.province);
            this.ctx.body = user;
        }
    }
    //馆长数据统计
    async curatorDataCount(){
        const data = await this.ctx.service.agent.curatorDataCount();
        this.ctx.body =  data;
    }

    //代理统计数据
    async agentDataCount(){
        const data = await this.ctx.service.agent.agentDataCount();
        this.ctx.body =  data;
    }
    //用户排行榜
    async getUserCharts(){
        const Joi = this.app.Joi;
        const query = this.ctx.query as any;
        let result:any = {}
        let { error, value } = this.ctx.validate(Joi.object().keys({
            type: Joi.string().required(), //day month  total
            limit:Joi.string().required(),
            page : Joi.string().required(), //day month  total
            // data : Joi.string(),
        }), this.ctx.query, {}, false);
        if (error != null && error.name == "ValidationError") {
            result = reply.err("请选择查看时间范围");
        } else {
            // const date:number = query.date != undefined ? parseInt(query.date) : 0;
            const account = await this.ctx.service.agent.getUserCharts(query.type,parseInt(query.limit),parseInt(query.page));
            result = account;
        }
        this.ctx.body = result;
    }

    //用户相关信息
    async getUserInfo(){
        this.ctx.body = await this.ctx.service.agent.getUserInfo(this.ctx.session.shortId );;
    }

    //代理获取所有馆长和用户
    async getShortId(){
        this.ctx.body = await this.ctx.service.agent.getShortId();;
    }

    //邀请好友地址
    async getFriendNameCard(){
        console.log("邀请好友地址",this.ctx.session.friendCardUrl);
        const result = await this.ctx.service.agent.findFile("friend");
        this.ctx.body = reply.success(result);
    }

    //邀请馆长地址
    async getCuratorNameCard(){
        console.log("邀请馆长地址",this.ctx.session.curatorCardUrl);
        const result = await this.ctx.service.agent.findFile("curator");
        this.ctx.body = reply.success(result);
    }
}

module.exports = AgentsController;
