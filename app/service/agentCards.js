"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
// import Raven from 'raven'
const reply_1 = require("../const/reply");
const ulid = require("ulid");
const mongoose = require("mongoose");
var Raven = require('raven');
class AgentCardsService extends egg_1.Service {
    constructor(ctx) {
        super(ctx);
        const config = this.app.config;
        this.raven = Raven.config(config.raven.key).install();
    }
    //转卡列表
    async getCardList(id, identity, limit, page) {
        let data = {};
        if (identity == 'agent') {
            const CuratorList = await this.getCardAgentList(id, limit, page);
            if (CuratorList.children != null) {
                data = reply_1.default.success(CuratorList);
            }
            else {
                data = reply_1.default.success({});
            }
        }
        //馆长 
        if (identity == 'curator') {
            const CuratorList = await this.getCardCuratorList(id, limit, page);
            if (CuratorList.children != null) {
                data = reply_1.default.success(CuratorList);
            }
            else {
                data = reply_1.default.success({});
            }
        }
        return data;
    }
    //馆长转卡列表
    async getCardCuratorList(id, limit = 5, page = 1) {
        let result = {
            children: {},
            curatorInfo: {}
        };
        page = page <= 0 ? 1 : page;
        page = (page - 1) * limit;
        const curatorId = await this.ctx.model.User.findGameUser(id);
        if (curatorId != null) {
            let curatorlist = await this.ctx.model.Curator.cardList(curatorId.curator, limit, page);
            if (curatorlist.length > 0) {
                result.children = curatorlist[0];
                result.curatorInfo = {
                    coin: curatorId.coin,
                    nickname: curatorId.nickname,
                    shortId: curatorId.shortId
                };
            }
        }
        return result;
    }
    //代理卡列表
    async getCardAgentList(id, limit, page) {
        let data = {};
        page = page <= 0 ? 1 : page;
        page = (page - 1) * limit;
        const agentId = await this.ctx.model.User.findGameUser(id);
        if (agentId != null) {
            let result = {};
            let agentList = JSON.parse(JSON.stringify(await this.ctx.model.Agent.cardList(agentId.agent, limit, page)));
            // let userCount:number  = 0;
            if (agentList.length > 0) {
                result.children = agentList[0];
                result.children.userCount = 0;
                let childCount = 0;
                for (let i = 0; i < result.children.children.length; i++) {
                    // "5a6fe4d21082fb514ab6dbaf
                    //进货额 馆长维度
                    const order = await this.ctx.model.AgentOrder.findBuyer(result.children.children[i].curator._id);
                    let rmbSum = 0;
                    result.children.children[i].purchaseAmount = rmbSum;
                    if (typeof order != "undefined" && order.length > 0) {
                        for (let i in order) {
                            rmbSum += order[i].rmb;
                        }
                        result.children.children[i].purchaseAmount = rmbSum;
                    }
                    //销售额度 桌卡消耗 用户维度
                    const userIds = await this.ctx.model.User.findByIds(result.children.children[i].curator.children);
                    let cardConsume = 0;
                    let sumPay = 0;
                    result.children.children[i].cardConsume = cardConsume;
                    if (typeof userIds != "undefined" && userIds.length > 0) {
                        for (let i in userIds) {
                            cardConsume += userIds[i].cardConsume;
                            sumPay += userIds[i].sumPay;
                        }
                        result.children.children[i].cardConsume = cardConsume;
                        result.children.children[i].sumPay = sumPay + result.children.children[i].sumPay;
                    }
                    result.children.userCount += result.children.children[i].curator.childCount;
                }
                result.agentInfo = {
                    coin: agentId.coin,
                    nickname: agentId.nickname,
                    shortId: agentId.shortId,
                };
                data = result;
            }
        }
        return data;
    }
    //管长查指定用户
    async getChildInfo(shortId) {
        let result = reply_1.default.err("未查找到该用户", -1);
        const childInfo = await this.ctx.model.User.byShortId(shortId);
        if (childInfo != null && childInfo.curatorParent == this.ctx.session.userId) {
            const data = {
                id: childInfo._id,
                shortId: childInfo.shortId,
                createdAt: childInfo.createdAt,
                bindCard: childInfo.coin.bindCard,
                nickname: childInfo.nickname,
                realname: childInfo.realAuth.realname,
            };
            result = reply_1.default.success(data);
        }
        return result;
    }
    //代理查指定馆长 
    async findCurator(shortId) {
        let result = reply_1.default.err("未查找到该用户");
        const childInfo = await this.ctx.model.User.findCurator(shortId);
        if (childInfo != null && childInfo.agentParent == this.ctx.session.userId) {
            const order = await this.ctx.model.AgentOrder.findBuyer(childInfo._id);
            let rmbSum = 0;
            if (typeof order != "undefined" && order.length > 0) {
                for (let i in order) {
                    rmbSum += order[i].rmb;
                }
            }
            let sumPay = 0;
            let cardConsume = 0;
            const users = await this.ctx.model.User.findByCuratorParent(childInfo._id);
            if (users.length > 0) {
                for (let i in users) {
                    cardConsume += users[i].cardConsume;
                    sumPay += users[i].sumPay;
                }
            }
            sumPay;
            const data = {
                id: childInfo._id,
                shortId: childInfo.shortId,
                createdAt: childInfo.createdAt,
                bindCard: childInfo.coin.bindCard,
                childCount: childInfo.curator.childCount,
                stock: childInfo.coin.stock,
                nickname: childInfo.nickname,
                realname: childInfo.realAuth.realname,
                phone: childInfo.mobileAuth.phone,
                purchaseAmount: rmbSum,
                sumPay: childInfo.sumPay + sumPay,
                cardConsume: cardConsume // 卡消耗 用户维度
            };
            result = reply_1.default.success(data);
        }
        return result;
    }
    //转房卡给指定用户 
    async transferStockToBindCard(id, childrenId, cardNum) {
        let result = {};
        result = reply_1.default.success(true, "转卡成功");
        //获取馆长
        const uresult = await this.ctx.model.User.findClientUser(id);
        //获取用户
        const cresult = await this.ctx.model.User.byShortId(childrenId);
        let helper = this.ctx.helper;
        if (cresult == null) {
            result = reply_1.default.err("此用户没有和您关联,请联系客服", -1);
        }
        else {
            let parent = "";
            if (this.ctx.session.identity.current == "curator") {
                parent = cresult.curatorParent;
            }
            if (this.ctx.session.identity.current == "agent") {
                parent = cresult.agentParent;
            }
            if (parent + '' != uresult._id + '') {
                result = reply_1.default.err("此用户没有和您关联,请联系客服", -1);
            }
            else {
                if (uresult.coin.stock > 0 && uresult.coin.stock >= cardNum) {
                    //减少自己库存
                    const ustock = await this.ctx.model.User.findUserAndUpdateStock(id, -cardNum);
                    const errInfo = `[时间 ${Date.now()} 馆长/代理 shortId:${uresult.shortId} 原有库存卡数:${ustock.coin.stock} 转出库存卡数:${cardNum} ],转卡给用户[用户shortId:${cresult.shortId},用户原有卡数:${cresult.coin.card},用户收入卡数: ${cardNum}] ${helper.formatTime()}`;
                    if ((uresult.coin.stock - cardNum) == ustock.coin.stock) {
                        //增加用户房卡
                        const cstock = await this.ctx.model.User.findUserAndUpdateBindCard(childrenId, +cardNum);
                        if ((cresult.coin.bindCard + cardNum) == cstock.coin.bindCard) {
                            //转出历史记录
                            let create = new this.ctx.model.AgentStockToCard({
                                "type": 3,
                                "source": uresult._id,
                                "target": cresult._id,
                                "sourceStock": uresult.coin.stock,
                                "changeStock": cardNum,
                                "targetStock": cresult.coin.bindCard,
                            });
                            let createInfo = await create.save();
                            //数据埋点
                            this.ctx.service.keenio.transferCard(this.ctx.session.identity.current, uresult._id, cresult._id, cardNum + '', (parseInt(uresult.coin.stock) - cardNum) + '', uresult.coin.stock);
                        }
                        else {
                            result = reply_1.default.err("转卡失败,请重新尝试", -1);
                            // 管内用户 转卡失败后恢复数据
                            const creset = await this.ctx.model.User.findUserAndUpdateBindCard(childrenId, -cardNum);
                            this.raven.captureException(`转卡给用户:[用户]收卡失败,` + errInfo);
                            if (creset.coin.bingCard != cresult.coin.bingCard) {
                                //发送邮件
                                this.raven.captureException(`转卡给用户:[用户]数据恢复失败,` + errInfo);
                            }
                        }
                    }
                    else {
                        result = reply_1.default.err("转卡失败,请重新尝试", -1);
                        // 馆长/代理 转卡失败后恢复数据
                        const ureset = await this.ctx.model.User.findUserAndUpdateStock(id, +cardNum);
                        this.raven.captureException(`转卡给用户:[馆长/馆长+/代理]转卡失败,` + errInfo);
                        if (ureset.coin.stock != uresult.coin.stock) {
                            //发送邮件
                            this.raven.captureException(`转卡给用户:[馆长/馆长+/代理]转卡数据恢复失败,` + errInfo);
                        }
                    }
                }
                else {
                    result = reply_1.default.err("库存不足,请进货", -1);
                }
            }
        }
        return result;
    }
    //转卡给自己 
    async transferStockToCard(id, cardNum) {
        // const config:any = this.app.config;
        // raven.config(config.raven.token).install();
        let result = {};
        result = reply_1.default.success(true, "转卡成功");
        //获取 
        const uresult = await this.ctx.model.User.findClientUser(id);
        if (uresult.coin.stock > 0 && uresult.coin.stock >= cardNum) {
            //减少自己库存
            const ustock = await this.ctx.model.User.findUserAndUpdateStock(id, -cardNum);
            const errInfo = `[馆长/馆长+/代理shortId:${uresult.shortId} 原有库存卡数:${ustock.coin.stock} 转出库存卡数:${cardNum} ],转卡给用户[用户shortId:${uresult.shortId},用户原有卡数:${uresult.coin.card},用户收入卡数: ${cardNum}]`;
            if ((uresult.coin.stock - cardNum) == ustock.coin.stock) {
                //增加自己房卡
                const cstock = await this.ctx.model.User.findUserAndUpdateCard(id, +cardNum);
                if ((uresult.coin.card + cardNum) == cstock.coin.card) {
                    //转入历史记录
                    let createInput = new this.ctx.model.AgentStockToCard({
                        "type": 2,
                        "source": uresult._id,
                        "target": uresult._id,
                        "sourceStock": uresult.coin.stock,
                        "changeStock": cardNum,
                        "targetStock": uresult.coin.card,
                    });
                    await createInput.save();
                    let create = new this.ctx.model.AgentStockToCard({
                        "type": 3,
                        "source": uresult._id,
                        "target": uresult._id,
                        "sourceStock": uresult.coin.stock,
                        "changeStock": cardNum,
                        "targetStock": uresult.coin.card,
                    });
                    await create.save();
                }
                else {
                    result = reply_1.default.err("转卡失败,请重新尝试");
                    // 管内用户 转卡失败后恢复数据
                    const creset = await this.ctx.model.User.findUserAndUpdateCard(id, -cardNum);
                    // 管内用户 恢复数据ISODate("2016-01-01T00:00:00Z")失败
                    this.raven.captureException(`转卡给用户:[用户]收卡失败,` + errInfo);
                    if (creset.coin.card != uresult.coin.card) {
                        //发送邮件
                        this.raven.captureException(`转卡给用户:[用户]数据恢复失败,` + errInfo);
                    }
                }
            }
            else {
                result = reply_1.default.err("转卡失败,请重新尝试");
                // 馆长/代理 转卡失败后恢复数据
                const ureset = await this.ctx.model.User.findUserAndUpdateStock(id, +cardNum);
                // r.captureException(`转卡给用户:[馆长/馆长+/代理]转卡失败,`+errInfo);
                this.raven.captureException(`转卡给用户:[馆长/馆长+/代理]转卡失败,` + errInfo);
                if (ureset.coin.stock != uresult.coin.stock) {
                    //发送邮件
                    // r.captureException(`转卡给用户:[馆长/馆长+/代理]转卡数据恢复失败,`+errInfo);
                    this.raven.captureException(`转卡给用户:[馆长/馆长+/代理]转卡数据恢复失败,` + errInfo);
                }
            }
        }
        else {
            result = reply_1.default.err("库存不足,请进货");
        }
        return result;
    }
    //库存列表  带日期
    async findStockList(date, type = 0, limit = 5, page = 1) {
        let types = (type == -1) ? [0, 1, 2, 3] : [type];
        page = page <= 0 ? 1 : page;
        page = (page - 1) * limit;
        const dateArr = date.split("-");
        let year = parseInt(dateArr[0]);
        let month = parseInt(dateArr[1]);
        if (month == 12) {
            month = 1;
        }
        const start = date;
        const end = `${year}-${month + 1}`;
        const userId = this.ctx.session.userId;
        const list = await this.ctx.model.AgentStockToCard.createdAtList(start, end, userId, types, limit, page);
        const count = await this.ctx.model.AgentStockToCard.createdAtCountList(start, end, userId, types);
        //总页数
        return { list: list, count: count };
    }
    //库存列表
    async findStockTypeList(type = 0, limit = 5, page = 1) {
        let types = (type == -1) ? [0, 1, 2, 3] : [type];
        page = page <= 0 ? 1 : page;
        page = (page - 1) * limit;
        const userId = this.ctx.session.userId;
        const list = await this.ctx.model.AgentStockToCard.typeList(userId, types, limit, page);
        const count = await this.ctx.model.AgentStockToCard.typeCountList(userId, types);
        return { list: list, count: count };
    }
    /**
     * 进货
     * @param userId 当前身份用户Id
     * @param money 进货金额
     * @param amount 进货卡数
     * @param clientip 用户Ip
     * @param channel 渠道
     */
    async purchase(userId, amount, money, clientip, channel) {
        let result = true;
        const orderNo = ulid.ulid();
        const uId = new mongoose.Types.ObjectId(userId);
        const shortId = this.ctx.session.shortId;
        const resultUrl = '';
        let config = this.config;
        const feilds = {
            order_no: orderNo,
            app: { id: config.pingxx.appid },
            channel: channel,
            amount: amount,
            client_ip: clientip,
            currency: "cny",
            subject: "369代理系统",
            body: "房卡购买",
            extra: { "result_url": config.pingxx.resultUrl }
        };
        //ping++ 产生charges发送给前台
        const pingppResult = await this.ctx.service.pingpp.create(feilds);
        const orderFeilds = {
            buyer: uId,
            shortId: shortId,
            channel: channel,
            beforePayment: pingppResult,
            orderNo: orderNo,
            transaction_id: pingppResult.id,
            coinType: 'agent',
            rmb: money,
            amount: amount,
            client_ip: clientip,
        };
        //生成订单信息
        const agentOrder = new this.ctx.model.AgentOrder(orderFeilds);
        await agentOrder.save();
        //进货额
        await this.ctx.model.User.findPurchaseMoney(shortId, money);
        return pingppResult;
    }
    //Ping++ 回调
    async pingCallBack(callBackObj) {
        let results = false;
        if (callBackObj != null) {
            if (callBackObj.type == 'charge.succeeded') {
                //查找订单
                const findAgentOrder = await this.ctx.model.AgentOrder.findByTransactionId(callBackObj.data.object.id);
                if (findAgentOrder != null) {
                    if (findAgentOrder.transaction_id == callBackObj.data.object.id &&
                        findAgentOrder.orderNo == callBackObj.data.object.order_no &&
                        findAgentOrder.purchased == false) {
                        //确认订单生效
                        await this.ctx.model.AgentOrder.findUserAndUpdateStock(findAgentOrder._id, true, callBackObj);
                        //读取原始数据
                        const findUser = await this.ctx.model.User.findClientUser(findAgentOrder.buyer);
                        //增加库存
                        const stock = await this.ctx.model.User.findUserAndUpdateStock(findAgentOrder.buyer, findAgentOrder.amount);
                        const errInfo = `[馆长/馆长+/代理shortId:${findUser.shortId} 原有库存卡数:${findUser.coin.stock} 购入卡数:${findAgentOrder.amount} 进货金额:${findAgentOrder.rmb}]`;
                        //记录历史
                        const cresult = await this.ctx.model.Withdrawals.createWithdrawals(findAgentOrder.buyer, findAgentOrder.rmb, 2);
                        //购买
                        if ((findUser.coin.stock + findAgentOrder.amount) != stock.coin.stock) {
                            // 馆长/代理 转卡失败后恢复数据
                            const ureset = await this.ctx.model.User.findUserAndUpdateStock(findAgentOrder.buyer, -findAgentOrder.amount);
                            this.raven.captureException(`转卡给用户:[馆长/馆长+/代理]进货失败,` + errInfo);
                            if (findUser.coin.stock != stock.coin.stock) {
                                //发送邮件
                                this.raven.captureException(`转卡给用户:[馆长/馆长+/代理]进货失败并且数据恢复失败,` + errInfo);
                            }
                        }
                        else {
                            //购卡(进货)历史记录
                            let create = new this.ctx.model.AgentStockToCard({
                                "type": 0,
                                "target": findUser._id,
                                "source": findUser._id,
                                "sourceStock": findUser.coin.stock,
                                "changeStock": findAgentOrder.amount,
                                "targetStock": findAgentOrder.amount,
                            });
                            await create.save();
                            //数据埋点
                            this.ctx.service.keenio.purchase(findUser._id, this.ctx.session.curatorShortId, "curator-card", findAgentOrder.orderNo, findAgentOrder.transaction_id, findAgentOrder.rmb, "room-card", findAgentOrder.amount);
                        }
                        results = true;
                    }
                }
            }
        }
        return results;
    }
    //订单支付状态
    async orderStatus(transactionId) {
        let result = reply_1.default.err("数据异常");
        const order = await this.ctx.model.AgentOrder.findByTransactionId(transactionId);
        if (order != null) {
            result = reply_1.default.success({ "purchased": order.purchased });
        }
        return result;
    }
}
exports.AgentCardsService = AgentCardsService;
module.exports = AgentCardsService;
