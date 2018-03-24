import { Service, Context } from 'egg'
var KeenTracking = require('keen-tracking');
import * as Keen from 'keen-analysis';

export class KeenioService extends Service {
    client: any;
    readChess:any;
    constructor(ctx: Context) {
        super(ctx);
        const config: any = this.app.config;
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
    login(identity:string,id: string, userType: string) {
        this.client.recordEvent('OnLogin', {
            createdAt: Date.now(),// 时间
            identity:identity,//身份
            id: id,// 用户ID
            platform: "agentSystem",// 平台
            channel: "web",// 渠道
            userType: userType,// 用户类型
        });
    }
    //转卡
    transferCard(identity:string,transferCardId: string, receiveId: string, transferCardNum: string, afterStock: string, beforeStock: string) {
        this.client.recordEvent('OnTransferCard', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            transferCardId: transferCardId,// 转卡用户ID
            receiveId: receiveId,// 被转用户ID
            transferCardNum: transferCardNum,// 转卡数量
            afterStock: afterStock,// 转前库存
            beforeStock: beforeStock// 转后库存 
        });
    }

    //绑定手机
    bindPhone(identity:string,id: string, phone: string) {
        this.client.recordEvent('OnBindPhone', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            id: id,// 用户ID
            phone: phone,// 手机号 
        });
    }
    // 实名认证 
    realNameAuth(identity:string,shortId: string, realname: string, addrCode: number, sex: string, bankCode: number) {
        this.client.recordEvent('OnRealNameAuth', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            shortId: shortId,// 用户ID
            realname: realname,// 姓名
            addrCode: addrCode,// 身份证
            sex: sex,// 性别
            bankCode: bankCode,// 银行卡卡号
        });
    }
    //更换银行卡 
    chengeBankCard(identity:string,id: string, realname: string, addrCode: number, sex: string, bankCode: number,phone:string) {
        this.client.recordEvent('OnChengeBankCard', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            id: id,// 用户ID
            realname: realname,// 姓名
            addrCode: addrCode,// 身份证
            sex: sex,// 性别
            bankCode: bankCode,// 银行卡卡号
            phone: phone,// 手机号 
        });
    }

    //取关棋牌室
    cancelChess(identity:string,shortId: string, chessRoomId: string) {
        this.client.recordEvent('OnCancelChess', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            shortId: shortId,// 关联用户ID
            chessRoomId: chessRoomId,// 棋牌室ID
        });
    }
    //进货
    purchase(id: string, chessRoomId: string, PurchaseProject: string, orderSn: string,thirdPartyOrderSn:string, money: string, propType: string, propNum: string) {
        this.client.recordEvent('OnPurchase', {
            createdAt: Date.now(), // 时间
            id: id,// 用户ID
            chessRoomId: chessRoomId,// 棋牌室ID
            purchaseProject: PurchaseProject,// 内购项
            orderSn: orderSn,// 订单ID
            thirdPartyOrderSn:thirdPartyOrderSn, //第三方订单id
            money: money,// 充值金额
            propType: propType,// 下发道具类型
            propNum: propNum// 下发道具数量
        });
    }
    // 提现
    withdrawals(identity:string,id: string, chessRoomId: string, money: number, operationCount: string, orderSn: string, bankCode: string, bindPhone: string) {
        this.client.recordEvent('OnWithdrawals', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            id: id,// 用户ID
            chessRoomId: chessRoomId,// 棋牌室ID
            money: money,// 提现金额
            operationCount: operationCount,// 提现次数
            orderSn: orderSn,// 本系统提现订单ID
            bankCode: bankCode,// 提现银行卡号
            bindPhone: bindPhone// 绑定手机号
        });
    }

    //删除关联用户
    untyingUsers(identity:string,childrenId: string, chessRoomId: string) {
        this.client.recordEvent('OnUntyingUsers', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            id: childrenId,// 关联用户ID
            chessRoomId: chessRoomId,// 棋牌室ID
        });
    }
    // 修改密码
    chengePassWord(identity:string,shortId: string) {
        this.client.recordEvent('OnUntyingUsers', {
            createdAt: Date.now(), // 时间
            identity:identity,//身份
            shortId: shortId,// 用户ID
        });
    }
    /**查询**/
    async getDayCurator(curatorParent:any,timeframe:string = "this_1_days"){
        const result = await new Promise((resolve, reject) => {
            this.readChess.query("sum", {
                event_collection: "onUserPay",
                filters: [{"operator":"in","property_name":"curatorParent","property_value":curatorParent}],
                group_by: ["curatorParent"],
                target_property: "money",
                timeframe: timeframe,
                timezone: "Asia/Singapore"
              })
              .then((res) =>{
                    resolve(res)
              }).catch((err) => {
                    reject(err);
              });
        }).then((res)=>{
            return res;
        }).catch((err)=>{
            return err;
        });
        return result
    }
}

module.exports = KeenioService;