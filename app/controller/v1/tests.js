'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const md5 = require("md5");
const mongoose = require("mongoose");
var fs = require('fs'), gm = require('gm').subClass({ imageMagick: true });
var QRCode = require('qrcode');
//生成测试数据
class TestsController extends egg_1.Controller {
    //生成馆长数据
    async index() {
        console.log("生成测试数据");
        let userArr = [];
        let cur = new this.ctx.model.Curator({ "enabled": true });
        let curInfo = await cur.save();
        console.log("Curator 表创建");
        let age = new this.ctx.model.Agent({ "enabled": false });
        let ageInfo = await age.save();
        console.log("Agent 表创建");
        let pid = {};
        let log = '';
        for (let i = 1; i <= 10; i++) {
            const phone = '188' + Math.ceil(Math.random() * 100000000);
            let users = {};
            if (i != 1) {
                users = new this.ctx.model.User({
                    "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                    "mobileAuth.phone": phone,
                    "curator": cur,
                    "agent": age,
                    "curatorParent": pid,
                    "coin.stock": 10,
                    "coin.bindCard": 10,
                    "coin.card": 10,
                    "nickname": `测试用户${phone}`
                });
                await users.save();
            }
            else {
                users = new this.ctx.model.User({
                    "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                    "mobileAuth.phone": phone,
                    "mobileAuth.auth": true,
                    "curator": cur,
                    "agent": age,
                    "coin.stock": 10,
                    "coin.bindCard": 10,
                    "coin.card": 10,
                    "nickname": `测试馆长${phone}`,
                });
                await users.save();
                console.log(users);
                pid = users;
                // console.log('=================>',pid);
                log = `User 馆长测试->数据生成10条,ID===>${users._id} 手机号===> ${users.mobileAuth.phone} 密码==> 123456`;
            }
            userArr.unshift(users);
        }
        console.log(log);
        console.log(userArr.length);
        this.ctx.model.Curator.update({ "shortId": cur.shortId }, {
            $set: {
                "childCount": userArr.length,
            },
            $pushAll: {
                "children": userArr
            }
        }).exec();
        console.log("Curator 表关联");
        this.ctx.model.Agent.update({ "shortId": age.shortId }, {
            $set: {
                "childCount": userArr.length,
            },
            $pushAll: {
                "children": userArr
            }
        }).exec();
        await this.getMessage();
        await this.getMails();
        console.log("Agent 表关联");
        this.ctx.body = log;
        // this.ctx.body = this.ctx.model.Withdrawals.findWithdrawalsSameDayCount("101335",1);
    }
    //生成代理数据
    async agent() {
        console.log("生成测试数据");
        let curArr = [];
        let log = '';
        for (let c = 1; c <= 10; c++) {
            let cur = new this.ctx.model.Curator({ "enabled": true });
            let curInfo = await cur.save();
            console.log("Curator 表创建");
            let pid = {};
            let curators = {};
            let userArr = [];
            for (let i = 1; i <= 10; i++) {
                let users = {};
                const phone = '188' + Math.ceil(Math.random() * 100000000);
                if (i != 1) {
                    users = new this.ctx.model.User({
                        "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                        "mobileAuth.phone": phone,
                        "curator": cur,
                        // "agent": age,
                        "curatorParent": curators,
                        "coin.stock": 10,
                        "coin.bindCard": 10,
                        "coin.card": 10,
                        "nickname": `测试用户${phone}`
                    });
                    await users.save();
                }
                else {
                    curators = new this.ctx.model.User({
                        "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                        "mobileAuth.phone": phone,
                        "mobileAuth.auth": true,
                        "curator": cur,
                        // "agent": age,
                        "coin.stock": 10,
                        "coin.bindCard": 10,
                        "coin.card": 10,
                        "sumMoney": 999,
                        "money": 888,
                        "nickname": `测试代理${phone}`,
                    });
                    await curators.save();
                    curArr.unshift(curators);
                }
                userArr.unshift(users);
            }
            console.log(log);
            console.log(userArr.length);
            this.ctx.model.Curator.update({ "shortId": cur.shortId }, {
                $set: {
                    "childCount": userArr.length,
                },
                $pushAll: {
                    "children": userArr
                }
            }).exec();
            console.log("Agent 表关联");
        }
        //生成代理
        let age = new this.ctx.model.Agent({ "enabled": true });
        console.log("age---------_>", age);
        let ageInfo = await age.save();
        console.log("Agent 表创建");
        const phone = '188' + Math.ceil(Math.random() * 100000000);
        let agent = new this.ctx.model.User({
            "mobileAuth.password": "123456",
            "mobileAuth.phone": phone,
            "mobileAuth.auth": true,
            // "curator": cur,
            "agent": age,
            "coin.stock": 10,
            "coin.bindCard": 10,
            "coin.card": 10,
            "sumMoney": 999,
            "money": 888,
            "nickname": `测试用户${phone}`,
        });
        const agentsave = await agent.save();
        console.log("Curator 表关联");
        let agents = this.ctx.model.Agent.update({ "shortId": age.shortId }, {
            $set: {
                "childCount": curArr.length,
            },
            $pushAll: {
                "children": curArr
            }
        }).exec();
        for (let i = 0; i < curArr.length; i++) {
            this.ctx.model.User.update({ "_id": curArr[i] }, {
                $set: {
                    "agent": age._id,
                    "agentParent": agent._id,
                }
            }).exec();
        }
        log = `User 代理测试-->数据生成10条,ID===>${agent._id} 手机号===> ${agent.mobileAuth.phone} 密码==> 123456`;
        await this.getMessage();
        await this.getMails();
        this.ctx.body = log;
    }
    //生成代理+数据
    async agentSuper() {
        console.log("生成测试数据");
        let curArr = [];
        let log = '';
        for (let c = 1; c <= 10; c++) {
            console.log("Curator 表创建");
            let cur = new this.ctx.model.Curator({ "enabled": true });
            let curInfo = await cur.save();
            let pid = {};
            let curators = {};
            let userArr = [];
            for (let i = 1; i <= 10; i++) {
                let users = {};
                const phone = '188' + Math.ceil(Math.random() * 100000000);
                if (i != 1) {
                    //用户
                    users = new this.ctx.model.User({
                        "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                        "mobileAuth.phone": phone,
                        "curator": cur,
                        // "agent": age,
                        "curatorParent": pid,
                        "coin.stock": 10,
                        "coin.bindCard": 10,
                        "coin.card": 10,
                        "nickname": `测试用户${phone}`
                    });
                    await users.save();
                    userArr.unshift(users);
                }
                else {
                    let nick = `测试馆长${phone}`;
                    if (c == 1) {
                        nick = `测试代理${phone}`;
                    }
                    //馆长
                    curators = new this.ctx.model.User({
                        "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                        "mobileAuth.phone": phone,
                        "mobileAuth.auth": true,
                        "curator": cur,
                        // "agent": age,
                        "coin.stock": 10,
                        "coin.bindCard": 10,
                        "coin.card": 10,
                        "nickname": nick,
                    });
                    await curators.save();
                    curArr.unshift(curators);
                    pid = curators;
                }
            }
            this.ctx.model.Curator.update({ "shortId": cur.shortId }, {
                $set: {
                    "childCount": userArr.length,
                },
                $pushAll: {
                    "children": userArr
                }
            }).exec();
        }
        //生成代理
        let age = new this.ctx.model.Agent({ "enabled": true });
        let ageInfo = await age.save();
        let agents = this.ctx.model.Agent.update({ "shortId": age.shortId }, {
            $set: {
                "childCount": curArr.length,
            },
            $pushAll: {
                "children": curArr
            }
        }).exec();
        //馆长 赋值 代理
        for (let i = 0; i < curArr.length; i++) {
            this.ctx.model.User.update({ "_id": curArr[i] }, {
                $set: {
                    "agent": age._id,
                    "agentParent": curArr[0]._id,
                }
            }).exec();
        }
        // curatorParent 馆长变成代理
        this.ctx.model.User.update({ "_id": curArr[0] }, {
            $set: {
                "curatorParent": curArr[0]._id,
            }
        }).exec();
        log = `User 代理+测试-->数据生成10条,ID===>${curArr[0]._id} 手机号===> ${curArr[0].mobileAuth.phone} 密码==> 123456`;
        await this.getMessage();
        await this.getMails();
        this.ctx.body = log;
    }
    async getMessage() {
        let users = new this.ctx.model.AgentMessage({ "content": "全服发钱了快快领取" });
        let userInfo = await users.save();
        users = new this.ctx.model.AgentMessage({ "content": "369互娱斗地主上线了~~~~" });
        userInfo = await users.save();
        users = new this.ctx.model.AgentMessage({ "content": "369互娱斗地主添加新玩法啦~~~~" });
        userInfo = await users.save();
        users = new this.ctx.model.AgentMessage({ "content": "369互娱吉林麻将上线了" });
        userInfo = await users.save();
        users = new this.ctx.model.AgentMessage({ "content": "369互娱北京麻将上线了" });
        userInfo = await users.save();
        return userInfo;
    }
    async getMails() {
        console.log("--->getMails");
        let users = new this.ctx.model.AgentMail({ "type": 1, "title": "发桌卡了,快来领取", "content": "发桌卡了,快来领取" });
        let userInfo = await users.save();
        users = new this.ctx.model.AgentMail({ "type": 1, "title": "快来领钱", "content": "发桌卡了,快来领取" });
        userInfo = await users.save();
        users = new this.ctx.model.AgentMail({ "type": 1, "title": "开桌就挣钱", "content": "发桌卡了,快来领取" });
        userInfo = await users.save();
        users = new this.ctx.model.AgentMail({ "type": 1, "title": "快来领钱", "content": "发桌卡了,快来领取" });
        userInfo = await users.save();
        users = new this.ctx.model.AgentMail({ "type": 1, "title": "开桌就挣钱", "content": "发桌卡了,快来领取" });
        userInfo = await users.save();
    }
    //创建棋牌室 代理信息
    async createChessAndAgent() {
        let Curator = new this.ctx.model.Curator({ "enabled": true });
        let curatorSave = await Curator.save();
        let Agent = new this.ctx.model.Agent({ "enabled": true });
        let agentSave = await Agent.save();
        this.ctx.body = { curatorSave, agentSave };
    }
    //创建用户
    async createUsers() {
        let ids = [];
        //用户
        for (let i = 0; i <= this.ctx.query.num; i++) {
            const phone = '188' + Math.ceil(Math.random() * 100000000);
            let users = new this.ctx.model.User({
                "mobileAuth.password": md5('ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@' + "123456"),
                "mobileAuth.phone": phone,
                "coin.stock": 10,
                "coin.bindCard": 10,
                "coin.card": 10,
                "nickname": `测试用户${phone}`
            });
            let info = await users.save();
            console.log(info);
            let temp = {
                "id": users._id,
                "phone": phone,
                "password": 123456
            };
            ids.unshift(temp);
        }
        this.ctx.body = ids;
    }
    //创建馆长
    async createCurator() {
        let users = await this.ctx.model.User.update({ "_id": new mongoose.Types.ObjectId(this.ctx.query.userId) }, {
            $set: {
                "mobileAuth.auth": true,
                "chessRoomId": this.ctx.query.roomId,
                "curator": this.ctx.query.curatorId,
                "agentParent": this.ctx.query.agentId,
            }
        }).exec();
        this.ctx.body = users;
    }
    //创建代理关联
    async createAgentRelation() {
        let users = await this.ctx.model.User.update({ "_id": new mongoose.Types.ObjectId(this.ctx.query.userId) }, {
            $set: {
                "agent": this.ctx.query.curatorId,
            }
        }).exec();
        this.ctx.body = users;
    }
    //创建代理关联
    async createCuratorRelation() {
    }
    //用户关联馆长
    async createCuratorRelationUser() {
        let users = await this.ctx.model.User.update({ "_id": new mongoose.Types.ObjectId(this.ctx.query.userId) }, {
            $set: {
                "chessRoomId": this.ctx.query.roomId,
                "curatorParent": this.ctx.query.curatorParent
            }
        }).exec();
        this.ctx.body = users;
    }
    async gmjpg() {
        console.log(123);
        // id:string,url:string,classRoom:string,weket:string,phone:string,wechat:string
        //生成二维码
        const qrcodePath = `${process.cwd()}/app/public/card/${123}qrcode.png`;
        const cardPath = `${process.cwd()}/app/public/card/${123}card.png`;
        const mergePath = `${process.cwd()}/app/public/card/${123}merge.png`;
        const savePath = `public/card/${123}merge.png`;
        const template = `${process.cwd()}/app/public/card/curatorTemplate.jpg`;
        const ttc = `${process.cwd()}/app/public/card/MSYH.ttc`;
        new Promise((resolve, reject) => {
            QRCode.toFile(qrcodePath, 'http://www.qq.com', {
                color: {
                    dark: '#000',
                    light: '#fff'
                }
            }, function (err) {
                reject(err);
            });
        }).then((charge) => {
            return charge;
        }).catch((err) => {
            return err;
        });
        let str = "风光光发风光光发";
        let num = 500 - (str.length * 30);
        new Promise((resolve, reject) => {
            //生成名片
            gm(template)
                .fill("#fff")
                .fontSize(31)
                .font(ttc, 28)
                .drawText(100, 413, "zecheng")
                .drawText(93, 381, "18888888888")
                .font(ttc, 35)
                .fill("#fff")
                .drawText(num, 85, str)
                .write(cardPath, function (err, charge) {
                reject(err);
            });
        }).then((charge) => {
            return charge;
        }).catch((err) => {
            return err;
        });
        const merge = await new Promise((resolve, reject) => {
            //名片 + 二维码 合成
            gm().in('-page', '+0+0')
                .in(cardPath)
                .in('-page', '+95+30')
                .in(qrcodePath)
                .mosaic()
                .write(mergePath, function (err) {
                reject(err);
            });
        }).then((charge) => {
            return charge;
        }).catch((err) => {
            return err;
        });
        this.ctx.body = `<html><body><image src="http://${this.ctx.ip}:7001/public/card/123merge.png"></body></html>`;
        //好友
        // //生成二维码
        // const qrcodePath = `${process.cwd()}/app/public/card/${123}qrcode.png`;
        // const cardPath = `${process.cwd()}/app/public/card/${123}card.png`;
        // const mergePath = `${process.cwd()}/app/public/card/${123}merge.png`;
        // const savePath = `public/card/${123}merge.png`;
        // const template = `${process.cwd()}/app/public/card/frinedTemplate.jpg`;
        // const ttc =  `${process.cwd()}/app/public/card/MSYH.ttc`;
        //  new Promise((resolve, reject) => {
        //     QRCode.toFile(qrcodePath, 'http://www.qq.com', {
        //         color: {
        //             dark: '#000',
        //             light: '#fff'
        //         }
        //     }, function (err) {
        //         reject(err);
        //     });
        // }).then((charge) => {
        //     return charge;
        // }).catch((err) => {
        //     return err;
        // });
        // let str = "风光光发风光光发";
        // let num = 500 - (str.length * 30);
        // new Promise((resolve, reject) => {
        //     //生成名片
        //     gm(template)
        //         .fill("#787979")
        //         .fontSize(31)
        //         .drawText(93, 255, "zecheng")
        //         .drawText(93, 315, "18888888888")
        //         .font(ttc, 28)
        //         .channel("Yellow")
        //         .fill("#fff")
        //         .drawText(560, 412, "泽宬")
        //         .font(ttc, 35)
        //         .fill("#fff")
        //         .drawText(num, 85, str)
        //         .write(cardPath, function (err,charge) {
        //             reject(err);
        //         });
        // }).then((charge) => {
        //     return charge;
        // }).catch((err) => {
        //     return err;
        // });
        // const merge = await new Promise((resolve, reject) => {
        //     //名片 + 二维码 合成
        //    gm().in('-page', '+0+0')
        //         .in(cardPath)
        //         .in('-page', '+95+30') 
        //         .in(qrcodePath)
        //         .mosaic()
        //         .write(mergePath, function (err) {
        //             reject(err);
        //          });
        // }).then((charge) => {
        //     return charge;
        // }).catch((err) => {
        //     return err;
        // });
    }
}
module.exports = TestsController;
