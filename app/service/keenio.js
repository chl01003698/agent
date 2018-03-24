"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
var KeenTracking = require('keen-tracking');
const Keen = require("keen-analysis");
class KeenioService extends egg_1.Service {
    constructor(ctx) {
        super(ctx);
        const config = this.app.config;
        this.client = new KeenTracking({
            projectId: config.keenio.agentId,
            writeKey: config.keenio.agentWriteKey
        });
        this.readChess = new Keen({
            projectId: config.keenio.chesstId,
            readKey: config.keenio.chessReadKey
        });
    }
    /**写入**/
    //登录 
    login(identity, id, userType) {
        this.client.recordEvent('OnLogin', {
            createdAt: Date.now(),
            identity: identity,
            id: id,
            platform: "agentSystem",
            channel: "web",
            userType: userType,
        });
    }
    //转卡
    transferCard(identity, transferCardId, receiveId, transferCardNum, afterStock, beforeStock) {
        this.client.recordEvent('OnTransferCard', {
            createdAt: Date.now(),
            identity: identity,
            transferCardId: transferCardId,
            receiveId: receiveId,
            transferCardNum: transferCardNum,
            afterStock: afterStock,
            beforeStock: beforeStock // 转后库存 
        });
    }
    //绑定手机
    bindPhone(identity, id, phone) {
        this.client.recordEvent('OnBindPhone', {
            createdAt: Date.now(),
            identity: identity,
            id: id,
            phone: phone,
        });
    }
    // 实名认证 
    realNameAuth(identity, shortId, realname, addrCode, sex, bankCode) {
        this.client.recordEvent('OnRealNameAuth', {
            createdAt: Date.now(),
            identity: identity,
            shortId: shortId,
            realname: realname,
            addrCode: addrCode,
            sex: sex,
            bankCode: bankCode,
        });
    }
    //更换银行卡 
    chengeBankCard(identity, id, realname, addrCode, sex, bankCode, phone) {
        this.client.recordEvent('OnChengeBankCard', {
            createdAt: Date.now(),
            identity: identity,
            id: id,
            realname: realname,
            addrCode: addrCode,
            sex: sex,
            bankCode: bankCode,
            phone: phone,
        });
    }
    //取关棋牌室
    cancelChess(identity, shortId, chessRoomId) {
        this.client.recordEvent('OnCancelChess', {
            createdAt: Date.now(),
            identity: identity,
            shortId: shortId,
            chessRoomId: chessRoomId,
        });
    }
    //进货
    purchase(id, chessRoomId, PurchaseProject, orderSn, thirdPartyOrderSn, money, propType, propNum) {
        this.client.recordEvent('OnPurchase', {
            createdAt: Date.now(),
            id: id,
            chessRoomId: chessRoomId,
            purchaseProject: PurchaseProject,
            orderSn: orderSn,
            thirdPartyOrderSn: thirdPartyOrderSn,
            money: money,
            propType: propType,
            propNum: propNum // 下发道具数量
        });
    }
    // 提现
    withdrawals(identity, id, chessRoomId, money, operationCount, orderSn, bankCode, bindPhone) {
        this.client.recordEvent('OnWithdrawals', {
            createdAt: Date.now(),
            identity: identity,
            id: id,
            chessRoomId: chessRoomId,
            money: money,
            operationCount: operationCount,
            orderSn: orderSn,
            bankCode: bankCode,
            bindPhone: bindPhone // 绑定手机号
        });
    }
    //删除关联用户
    untyingUsers(identity, childrenId, chessRoomId) {
        this.client.recordEvent('OnUntyingUsers', {
            createdAt: Date.now(),
            identity: identity,
            id: childrenId,
            chessRoomId: chessRoomId,
        });
    }
    // 修改密码
    chengePassWord(identity, shortId) {
        this.client.recordEvent('OnUntyingUsers', {
            createdAt: Date.now(),
            identity: identity,
            shortId: shortId,
        });
    }
    /**查询**/
    async getDayCurator(curatorParent, timeframe = "this_1_days") {
        const result = await new Promise((resolve, reject) => {
            this.readChess.query("sum", {
                event_collection: "onUserPay",
                filters: [{ "operator": "in", "property_name": "curatorParent", "property_value": curatorParent }],
                group_by: ["curatorParent"],
                target_property: "money",
                timeframe: timeframe,
                timezone: "Asia/Singapore"
            })
                .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        }).then((res) => {
            return res;
        }).catch((err) => {
            return err;
        });
        return result;
    }
}
exports.KeenioService = KeenioService;
module.exports = KeenioService;
