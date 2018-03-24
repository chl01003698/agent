import { Service, Context } from 'egg'
import reply from '../const/reply';
import user from '../model/user';
var IDValidator = require('id-validator');
var GB2260 = require('id-validator/src/GB2260');
var Raven = require('raven');
import * as md5 from 'md5';
import RankManager from '../manager/rankManager';
import KEY from '../const/key';
var fs = require('fs')
    , gm = require('gm').subClass({ imageMagick: true });
var QRCode = require('qrcode');

export class AgentService extends Service {
    raven: any;
    config: any;
    constructor(ctx: Context) {
        super(ctx);
        this.config = this.app.config;
        this.raven = Raven.config(this.config.raven.key).install();
    }
    //用户登录
    async userLogin(phone: number, pwd: string) {
        let result: object = {};
        let helper: any = this.ctx.helper;
        const account = await this.ctx.model.User.findPhoneToUserInfo(phone);
        if (account[0] != null) {
            //禁用账号
            if (account[0].mobileAuth.auth) {
                //身份验证
                // if (account[0].realAuth.auth) {
                if (this.getPassWord(pwd) == account[0].mobileAuth.password) {
                    this.ctx.session.userId = account[0]._id;
                    this.ctx.session.auth = account[0].mobileAuth.auth;
                    this.ctx.session.phone = account[0].mobileAuth.phone;
                    this.ctx.session.shortId = account[0].shortId;
                    this.ctx.session.expireTime = Date.now() + 84600;
                    this.ctx.session.curatorId = account[0].curator._id;
                    this.ctx.session.curatorName = account[0].curator.name;
                    this.ctx.session.curatorShortId = account[0].curator.shortId;
                    this.ctx.session.nickname = account[0].nickname;
                    this.ctx.session.wechatNumber = account[0].wechatNumber;
                    this.ctx.session.friendCardUrl = account[0].nameCard.friendCardUrl;
                    this.ctx.session.curatorCardUrl = account[0].nameCard.curatorCardUrl;
                    const identity = {
                        agent: typeof account[0].agent == "undefined" ? false : account[0].agent.enabled,
                        curator: typeof account[0].curator == "undefined" ? false : account[0].curator.enabled
                    }

                    const identityInfo = this.ctx.service.agent.getUserIdentity(identity);
                    //身份认证
                    let auth: number = 3;
                    if (!account[0].realAuth.auth) {
                        auth = 1;
                    } else if (!account[0].realAuth.auth || !account[0].bank.auth) {
                        auth = 2;
                    }
                    //前端使用数据
                    if (identityInfo.current != "undefined") {
                        this.ctx.session.identity = identityInfo;
                        let data: any = {
                            _id: account[0]._id,
                            createdAt: account[0].createdAt,
                            identity: identityInfo,
                            shortId: account[0].shortId,
                            phone: account[0].mobileAuth.phone,
                            money: account[0].money,
                            stock: account[0].coin.stock,
                            card: account[0].coin.card,
                            nickname: account[0].nickname,
                            level: account[0].level,
                            wechatNumber: account[0].wechatNumber,
                            bankCardholder: account[0].bank.bankCardholder,
                            bankName: account[0].bank.bankName,
                            bankOpening: account[0].bank.bankOpening,
                            bankCode: account[0].bank.bankCode,
                            bankPhone: account[0].bank.bankPhone,
                            city: account[0].realAuth.city,
                            province: account[0].realAuth.province,
                            realname: account[0].realAuth.realname,
                            identityCode: account[0].realAuth.identity,
                            curatorName: account[0].curator.name,
                            curatorDeclaration: account[0].curator.declaration,
                            systemTiem: helper.formatTime(),
                            auth: auth,
                        };
                        if (identityInfo.current == "curator") {
                            data.curatorId = account[0].curator._id;
                            data.curatorShortId = account[0].curator.shortId;
                            data.curatorCreatedAt = account[0].curator.createdAt;
                            data.curatorChildCount = account[0].curator.childCount;
                            data.curatorLevel = account[0].curator.level;
                            //埋点统计
                            this.ctx.service.keenio.login(this.ctx.session.identity.current, account[0]._id, identityInfo);
                        } else if (identityInfo.current == "agent") {
                            this.ctx.session.agentId = account[0].agent._id;
                            this.ctx.session.agentShortId = account[0].agent.shortId;
                            data.agentId = account[0].agent._id;
                            data.agentShortId = account[0].agent.shortId;
                            data.agentCreatedAt = account[0].agent.createdAt;
                            data.agentChildCount = account[0].agent.childCount;
                            data.agentLevel = account[0].agent.level;
                            //埋点统计
                            this.ctx.service.keenio.login(this.ctx.session.identity.current, account[0]._id, identityInfo);
                        }
                        result = reply.success(data);
                    } else {
                        result = reply.err("您还未开通此系统使用权限,请联系客服!")
                    }
                } else {
                    result = reply.err("密码错误,请重新输入!")
                }
                // } else {
                //     result = reply.err("未验证,请联系客服!")

                // }
            } else {
                result = reply.err("账号已禁用,请联系客服!")
            }
        } else {
            result = reply.err('用户不存在')
        }
        return result;
    }

    //切换用户身份验证
    async checkIdentity(identity: string) {
        let result: any = reply.err('您无此权限');
        let helper: any = this.ctx.helper;
        const account = await this.ctx.model.User.findPhoneToUserInfo(this.ctx.session.phone);
        let data: any = {}

        if (account[0] != null) {
            //身份认证
            let auth: number = 3;
            if (!account[0].realAuth.auth) {
                auth = 1;
            } else if (!account[0].realAuth.auth || !account[0].bank.auth) {
                auth = 2;
            }
            data = {
                _id: account[0]._id,
                createdAt: account[0].createdAt,
                shortId: account[0].shortId,
                phone: account[0].mobileAuth.phone,
                money: account[0].money,
                stock: account[0].coin.stock,
                card: account[0].coin.card,
                nickname: account[0].nickname,
                level: account[0].level,
                wechatNumber: account[0].wechatNumber,
                bankCardholder: account[0].bank.bankCardholder,
                bankName: account[0].bank.bankName,
                bankOpening: account[0].bank.bankOpening,
                bankCode: account[0].bank.bankCode,
                bankPhone: account[0].bank.bankPhone,
                city: account[0].realAuth.city,
                province: account[0].realAuth.province,
                realname: account[0].realAuth.realname,
                identityCode: account[0].realAuth.identity,
                curatorName: account[0].curator.name,
                curatorDeclaration: account[0].curator.declaration,
                systemTiem: helper.formatTime(),
                auth: auth,
            };
            this.ctx.session.userId = account[0]._id;
            this.ctx.session.auth = account[0].mobileAuth.auth;
            this.ctx.session.phone = account[0].mobileAuth.phone;
            this.ctx.session.shortId = account[0].shortId;
            if (identity == "curator" && account[0].curator.enabled) {
                data.curatorId = account[0].curator._id;
                data.curatorShortId = account[0].curator.shortId;
                data.curatorCreatedAt = account[0].curator.createdAt;
                data.curatorChildCount = account[0].curator.childCount;
                data.curatorLevel = account[0].curator.level;
                data.curatorName = account[0].curator.name;
                data.identity = {
                    identity: 'agentSuper',
                    current: 'curator'
                };
                this.ctx.session.identity = data.identity;
                this.ctx.session.curatorId = account[0].curator._id;
                this.ctx.session.curatorShortId = account[0].curator.shortId;
            } else if (identity == "agent" && account[0].agent.enabled) {
                data.agentId = account[0].agent._id;
                data.agentShortId = account[0].agent.shortId;
                data.agentCreatedAt = account[0].agent.createdAt;
                data.agentChildCount = account[0].agent.childCount;
                data.agentLevel = account[0].agent.level;
                data.identity = {
                    identity: 'agentSuper',
                    current: 'agent'
                };
                this.ctx.session.identity = data.identity;
                this.ctx.session.agentId = account[0].agent._id;
                this.ctx.session.agentShortId = account[0].agent.shortId;
            }
            else {
                data = reply.err("没有此权限");
            }
        }
        return reply.success(data);
    }

    /**
     * 获取用户身份
     * 未知  unknown
     * 馆长  agent
     * 代理+ agentSuper
     * 代理  curator
     */
    getUserIdentity(obj: { agent: boolean, curator: boolean }) {
        let data: any = {
            identity: 'unknown',
            current: 'unknown'
        };
        if (obj.agent && obj.curator) {
            data.identity = 'agentSuper';
            data.current = 'agent';
        } else if (obj.agent) {
            data.identity = 'agent';
            data.current = 'agent';
        } else if (obj.curator) {
            data.identity = 'curator';
            data.current = 'curator';
        }

        return data;

    }
    //我的棋牌室
    async myChessRoom(phone: number) {
        let data: any = {};
        let result: any = reply.err("无数据");
        const account = await this.ctx.model.User.findPhoneToUserInfo(phone);
        if (account.length > 0) {
            data.name = account[0].curator.name,
                data.nickname = account[0].nickname,
                data.stock = account[0].coin.stock
            result = reply.success(data);
        }
        return result;
    }

    //修改密码
    async editPassword(id: string, password: string, oldpassword: string) {
        let result: any = reply.err("无此用户,不能修改密码!");
        const uresult = await this.ctx.model.User.findClientUser(id);
        if (uresult != null) {
            //新旧密码一致没有判断
            if (uresult.mobileAuth.password == this.getPassWord(oldpassword)) {
                const account = await this.ctx.model.User.findUserAndUpdatePasswordInfo(id, this.getPassWord(password));
                if (account.mobileAuth.password == this.getPassWord(password)) {
                    result = reply.success(true, "密码修改成功!");
                    //数据埋点
                    this.ctx.service.keenio.chengePassWord(this.ctx.session.identity.current, account._id);
                } else {
                    result = reply.err("密码修改失败,请重新修改!");
                }
            } else {
                result = reply.err("原密码输入错误!");
            }
        }
        return result;
    }

    //获取棋牌室信息
    async getChessInfo(phone: number) {
        let result: any = {};
        let data: any = {
            name: '',
            declaration: '',
            childCount: '',
            nickname: '',
            stock: '',
            money: '',
            curatorShortId: '',
        }
        const account = await this.ctx.model.User.findPhoneToUserInfo(phone);
        if (account.length > 0) {
            data.name = account[0].curator.name;
            data.declaration = account[0].curator.declaration;
            data.childCount = account[0].curator.childCount;
            data.nickname = account[0].nickname;
            data.stock = account[0].coin.stock;
            data.money = account[0].money;
            data.curatorShortId = account[0].curator.shortId;
            result = data;
        }
        return reply.success(result);
    }

    //修改棋牌室名称信息
    async myChessNameEditor(curatorId: string, name: string) {
        const account = await this.ctx.model.Curator.findUserAndUpdateChessNameInfo(curatorId, name);
        const findUrl = await this.ctx.model.User.findShortId(this.ctx.session.shortId);
        let del:Array<string> = [];
        if(findUrl.nameCard.friendCardUrl != null){
            del = findUrl.nameCard.friendCardUrl.split("com/");
        }else if(findUrl.nameCard.curatorCardUrl != null){
            del = findUrl.nameCard.curatorCardUrl.split("com/");
        }
        if(del.length >0){
            this.ctx.oss.delete(del[1]);
        }

        this.ctx.session.curatorName = name;
        const friend = this.createFriendCard(
            this.ctx.session.shortId,
            this.ctx.session.curatorName,
            this.ctx.session.nickname,
            this.ctx.session.phone,
            this.ctx.session.wechatNumber,
            "friend"
        );
        const curator = this.createFriendCard(
            this.ctx.session.shortId,
            this.ctx.session.curatorName,
            this.ctx.session.nickname,
            this.ctx.session.phone,
            this.ctx.session.wechatNumber,
            "curator"
        );
        this.ctx.session.friendCardUrl = friend;
        this.ctx.session.curatorCardUrl = curator;

        return reply.success(account);
    }
    //修改棋牌室宣言信息
    async myChessDeclarationEditor(curatorId: string, declaration: string) {
        const account = await this.ctx.model.Curator.findUserAndUpdateDeclarationInfo(curatorId, declaration);
        return reply.success(account);
    }

    //修改微信号
    async wechatNumberEditor(id: string, wechatNumber: string) {
        let result: any = {};
        const account = await this.ctx.model.User.findUserAndUpdatewechatNumberInfo(id, wechatNumber);
        if (account != null && account.wechatNumber == wechatNumber) {
            const findUrl = await this.ctx.model.User.findShortId(this.ctx.session.shortId);
            let del:Array<string> = [];
            if(findUrl.nameCard.friendCardUrl != null){
                del = findUrl.nameCard.friendCardUrl.split("com/");
            }else if(findUrl.nameCard.curatorCardUrl != null){
                del = findUrl.nameCard.curatorCardUrl.split("com/");
            }
            if(del.length >0){
                this.ctx.oss.delete(del[1]);
            }
            
            this.ctx.session.wechatNumber = wechatNumber;
            const friend = this.createFriendCard(
                this.ctx.session.shortId,
                this.ctx.session.curatorName,
                this.ctx.session.nickname,
                this.ctx.session.phone,
                this.ctx.session.wechatNumber,
                "friend"
            );
            const curator = this.createFriendCard(
                this.ctx.session.shortId,
                this.ctx.session.curatorName,
                this.ctx.session.nickname,
                this.ctx.session.phone,
                this.ctx.session.wechatNumber,
                "curator"
            );
            this.ctx.session.friendCardUrl = friend;
            this.ctx.session.curatorCardUrl = curator;
            result = reply.success(true, "微信号修改成功!");
        } else {
            result = reply.err("微信号修改失败,请重新修改!");
        }
        return result;
    }

    //解绑用户
    async untyingUsers(id: string, childrenShortId: string, ) {
        let result: any = {};
        //管内用户
        const children = await this.ctx.model.User.byShortId(childrenShortId);
        if (children != null && children.curatorParent + '' == id + '') {
            //馆长
            const curatorInfo = await this.ctx.model.User.byShortId(this.ctx.session.shortId);
            //清空 父id清空 管内卡清零
            const user = await this.ctx.model.User.findUserAndUpdateParentInfo(children._id);
            //馆长表减员
            const curator = await this.ctx.model.Curator.findUserAndUpdateChildrenClearInfo(this.ctx.session.curatorShortId, children._id);
            //数据埋点
            this.ctx.service.keenio.untyingUsers(this.ctx.session.identity.current, children._id, this.ctx.session.curatorShortId);

            if (user.curatorParent == null) {
                result = reply.success(true, "解绑用户成功!");
            } else {
                result = reply.err("解绑用户失败!");
            }
        } else {
            result = reply.err("不允许该操作,此用户未和您关联!");
        }
        return result;
    }

    //认证用户姓名身份证
    async realAuthRealname(id: string, identity: number, realname: string) {
        let result = reply.err("请正确输入身份证号!");
        const validator = new IDValidator(GB2260);
        if (validator.isValid(identity)) {
            const code = validator.getInfo(identity);
            const user = await this.ctx.model.User.findUserAndUpdateRealAuth(id, code.addrCode, realname, code.birth, code.addr, code.sex, identity, true);
            if (user != null && user.realAuth.auth) {
                result = reply.success("认证真实姓名和身份证成功!");
            }
        }
        return result;
    }

    //认证用户省市
    async realAuthRealCity(id: string, city: string, province: string) {
        let result = reply.err("省市信息更新失败!");
        const user = await this.ctx.model.User.findUserAndUpdateRealAuthCity(id, city, province);
        if (user != null && user.realAuth.city == city) {
            result = reply.success("省市信息更新成功!");
        }
        return result;
    }

    //馆长数据统计
    async curatorDataCount() {
        const session = this.ctx.session;
        let data: any = {
            stockCard: 0, // 库存桌卡数
            sumMoney: 0, //总计收入
            childCount: 0,// 管内总用户
            newlyAdded: 0, // 新增用户
            money: 0, // 待提金额
            purchaseAmount: 0, //进货额

        };
        const userInfo = await this.ctx.model.User.byShortId(session.shortId);
        if (userInfo != null) {
            data.stockCard = userInfo.coin.stock; // 库存桌卡数
            data.sumMoney = userInfo.sumMoney; // 库存桌卡数
            data.money = userInfo.money; // 待提金额
        }
        const curatorInfo = await this.ctx.model.Curator.findInfo(session.curatorShortId);
        if (curatorInfo != null) {
            data.childCount = curatorInfo.childCount;// 管内总用户
        }
        const findNewlyAdded = await this.ctx.model.User.findNewlyAdded(session.userId);
        if (findNewlyAdded != null) {
            data.newlyAdded = findNewlyAdded; // 新增用户
        }

        //进货额
        const order = await this.ctx.model.AgentOrder.findBuyer(this.ctx.session.userId);
        let rmbSum: number = 0;
        if (typeof order != "undefined" && order.length > 0) {
            for (let i in order) {
                rmbSum += order[i].rmb;
            }
        }
        data.purchaseAmount = rmbSum;

        return reply.success(data);
    }

    //代理数据统计
    async agentDataCount() {
        let data: any = {
            sumMoney: 0, //总收益
            money: 0, //待提金额
            newAddCurator: 0,  //新增馆长
            // newAddUser:0, //新增管内用户
            currentCurator: 0, //当前馆长总数
            purchaseAmount: 0, //进货额
            intraUserCount: 0, //当前馆长管内总用户
        };
        const session = this.ctx.session;
        const userInfo = await this.ctx.model.User.byShortId(session.shortId);

        if (userInfo != null) {
            data.sumMoney = userInfo.sumMoney; //总收益
            data.money = userInfo.money; //待提金额
        }

        //当前馆长总数
        const agentInfo = await this.ctx.model.Agent.findInfo(session.agentShortId);
        if (agentInfo != null) {
            data.currentCurator = agentInfo.childCount;
        }

        //新增馆长
        const findNewlyAdded = await this.ctx.model.User.findNewlyCurator(session.userId);
        if (findNewlyAdded != null) {
            data.newAddCurator = findNewlyAdded;
        }

        // 当前馆长管内总用户
        const intraUser = await this.ctx.model.Agent.findIntraUser(session.agentShortId);
        if (intraUser.length > 0) {
            let curatorArr: Array<string> = [];
            intraUser[0].children.forEach(element => {
                curatorArr.unshift(element.curator);
            });
            const count = await this.ctx.model.Curator.findChildrenCount(curatorArr);
            let intraUserCount: number = 0;
            if (count.length > 0) {
                for (let i in count) {
                    intraUserCount += count[i].childCount;
                }
            }
            data.intraUserCount = intraUserCount;
        }

        //进货额
        const order = await this.ctx.model.AgentOrder.findBuyer(this.ctx.session.userId);
        let rmbSum: number = 0;
        if (typeof order != "undefined" && order.length > 0) {
            for (let i in order) {
                rmbSum += order[i].rmb;
            }
        }
        data.purchaseAmount = rmbSum;

        return reply.success(data);
    }

    //获取加密密码
    getPassWord(pwd: string) {
        const config: any = this.app.config;
        return md5(config.code.key + pwd);
    }

    //馆长用户排行榜 代理 馆长业绩排行榜
    async getUserCharts(type: string, limit: number = 10, page: number = 0) {
        const redis = this.app.redis.get('payRank');
        const rank = new RankManager(redis);

        // 用户排行榜
        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd434d",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd434d",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd434d",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd434b",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd434b",Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd434b",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd434a",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd434a",Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd434a",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd4349",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd4349",Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd4349",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd4348",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd4348",Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd4348",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd4347",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd4347",Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd4347",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,"5a746e4b7024aa381cdd4346",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,"5a746e4b7024aa381cdd4346",Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,"5a746e4b7024aa381cdd4346",Math.ceil(Math.random() * 1000),KEY.TOTAL);

        // rank.incrBy(KEY.PAY_DAY,105004,Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.PAY_MONTH,105004,Math.ceil(Math.random() * 100),KEY.MONTH);
        // rank.incrBy(KEY.PAY_TOTAL,105004,Math.ceil(Math.random() * 1000),KEY.TOTAL);

        //代理
        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4b7024aa381cdd4345",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4b7024aa381cdd4345",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4b7024aa381cdd4345",Math.ceil(Math.random() * 10),KEY.TOTAL);


        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4b7024aa381cdd433a",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4b7024aa381cdd433a",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4b7024aa381cdd433a",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4b7024aa381cdd432f",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4b7024aa381cdd432f",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4b7024aa381cdd432f",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4b7024aa381cdd4324",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4b7024aa381cdd4324",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4b7024aa381cdd4324",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4a7024aa381cdd4319",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4a7024aa381cdd4319",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4a7024aa381cdd4319",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4a7024aa381cdd430e",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4a7024aa381cdd430e",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4a7024aa381cdd430e",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4a7024aa381cdd4303",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4a7024aa381cdd4303",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4a7024aa381cdd4303",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4a7024aa381cdd42f8",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4a7024aa381cdd42f8",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4a7024aa381cdd42f8",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4a7024aa381cdd42ed",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4a7024aa381cdd42ed",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4a7024aa381cdd42ed",Math.ceil(Math.random() * 10),KEY.TOTAL);

        // rank.incrBy(KEY.CAWARD_DAY,  "5a746e4a7024aa381cdd42e2",Math.ceil(Math.random() * 10),KEY.DAY);
        // rank.incrBy(KEY.CAWARD_MONTH,"5a746e4a7024aa381cdd42e2",Math.ceil(Math.random() * 10),KEY.MONTH);
        // rank.incrBy(KEY.CAWARD_TOTAL,"5a746e4a7024aa381cdd42e2",Math.ceil(Math.random() * 10),KEY.TOTAL);

        let result: any = {};
        let list: any = [];

        const date = {
            keyDay: KEY.PAY_DAY,
            day: KEY.DAY,
            keyMonth: KEY.PAY_MONTH,
            month: KEY.MONTH,
            keyTotal: KEY.PAY_TOTAL,
            total: KEY.TOTAL,
        }
        if (this.ctx.session.identity.current == "agent") {
            date.keyDay = KEY.CAWARD_DAY;
            date.keyMonth = KEY.CAWARD_MONTH;
            date.keyTotal = KEY.CAWARD_TOTAL;
        }

        switch (type) {
            case "day":
                result = await rank.revrange(date.keyDay, page, limit, true, date.day, 0);
                break;
            case "month":
                result = await rank.revrange(date.keyMonth, page, limit, true, date.month, 0);
                break;
            case "total":
                result = await rank.revrange(date.keyTotal, page, limit, true, date.total, 0);
                break;
        }
        const data = this.assembling(result);
        const userData = await this.ctx.model.User.findByIds(data.id, "_id shortId curatorParent nickname scores agentParent realAuth.realname curator");
        let ids: any = [];
        for (let j in data.data) {
            for (let i = 0; i < userData.length; i++) {
                let _temp: any = {};
                if ((userData[i].curatorParent == this.ctx.session.userId)
                    || (userData[i].agentParent == this.ctx.session.userId)) {
                    if (userData[i]._id == data.data[j].id) {
                        _temp.id = userData[i]._id;
                        _temp.shortId = userData[i].shortId;
                        _temp.nickname = userData[i].nickname;
                        _temp.revenue = data.data[j].scores; //馆长下是总销售  代理下是创收
                        ids.push(userData[i]._id);
                        if (this.ctx.session.identity.current == "agent") {
                            _temp.realname = userData[i].realAuth.realname;
                            const curator = await this.ctx.model.Curator.findById(userData[i].curator);
                            _temp.userCount = curator[0].childCount;
                        }
                        list.push(_temp);
                    }
                }
            }
        }

        if (this.ctx.session.identity.current == "agent") {
            let keenDate: any = {};
            switch (type) {
                case "day":
                    keenDate = await this.ctx.service.keenio.getDayCurator(ids, "this_1_days");
                    break;
                case "month":
                    keenDate = await this.ctx.service.keenio.getDayCurator(ids, "this_1_months");
                    break;
                case "total":
                    keenDate = await this.ctx.service.keenio.getDayCurator(ids, "this_1_years");
                    break;
            }
            for (let i in list) {
                for (let j in keenDate.result) {
                    if (list[i].id == keenDate.result[j].curatorParent) {
                        list[i].sale = keenDate.result[j].result;
                    }
                }
            }
        }

        return list;
    }
    //
    private assembling(arr: any) {
        let array: any = [];
        let id: any = [];
        let result: any = [];
        for (let i = 0; i < arr.length; i++) {
            let _arr: any = {};
            if (i % 2 == 0) {
                _arr.id = arr[i];
                _arr.scores = arr[i + 1];
                array.push(_arr);
                id.push(arr[i]);
            }
        }
        result.id = id;
        result.data = array;
        return result;
    }

    //用户相关信息
    async getUserInfo(shortId: string) {
        const user = await this.ctx.model.User.byShortId(shortId);
        let result: any = {};
        if (user != null) {
            result = {
                _id: user.id,
                shortId: user.shortId,
                createdAt: user.createdAt,
                curator: user.curator,
                agent: user.agent,
                agentParent: user.agentParent,
                curatorParent: user.curatorParent,
                bank: user.bank,
                money: user.money,
                sumMoney: user.sumMoney,
                sumPay: user.sumPay,
                chessRoomId: user.chessRoomId,
                realAuth: user.realAuth,
                phone: user.mobileAuth.phone,
                coin: user.coin,
            }
        }
        return result;
    }

    //馆长获取所有用户 代理获取所有馆长和用户
    async getShortId() {
        let result: any = reply.err("身份不符");
        if (this.ctx.session.identity.current == "curator") {
            let user: any = await this.ctx.model.User.findByCuratorParent(this.ctx.session.userId, "shortId curatorParent");
            result = reply.success(user);
        }
        if (this.ctx.session.identity.current == "agent") {
            const agentShortId = await this.ctx.model.Agent.findInfo(this.ctx.session.agentShortId);
            let user: any = await this.ctx.model.User.findByCuratorParents(agentShortId.children, "shortId curatorParent");
            result = reply.success(user);
        }
        return result;
    }

    //生成二维码
    async  qrCode(shortId: string, url: string, disturb: string = "friend") {
        const md5id = md5(shortId + disturb);
        const qrcodePath = `${process.cwd()}/app/public/card/${md5id}qrcode.png`;
        await new Promise((resolve, reject) => {
            QRCode.toFile(qrcodePath, url, {
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
        return qrcodePath;
    }

    //合并图像
    async mergeImage(shortId: string, cardPath: string, qrcodePath: string, disturb: string = "friend") {
        const md5id = `${md5(shortId + disturb)}.png`;
        const mergePath = `${process.cwd()}/app/public/card/${md5id}`;
        let this_: any = this;
        //名片 + 二维码 合成
        return new Promise((resolve, reject) => {
            gm()
                .in('-page', '+0+0')
                .in(cardPath)
                .in('-page', '+95+30')
                .in(qrcodePath)
                .mosaic()
                .write(mergePath, function (err) {
                    resolve(err)
                });
        }).then((result) => {
            //阿里OSS
            return this_.ctx.oss.put(this_.config.oss.client.nameCardPaht + md5id, mergePath)
                .then((aliOss) => {
                    return Promise.resolve(aliOss);
                }).then((aliOss) => {
                    if (disturb == "friend") {
                        this_.ctx.model.User.findUpdateFriendCardUrl(this_.ctx.session.shortId, aliOss.url)
                            .then((friendResult) => {
                                this_.ctx.session.friendCardUrl = aliOss.url;
                            });
                    }
                    return Promise.resolve(aliOss);
                }).then((aliOss) => {
                    if (disturb == "curator") {
                        this_.ctx.model.User.findUpdateCuratorCardUrl(this_.ctx.session.shortId, aliOss.url)
                            .then((curatorResult) => {
                                this_.ctx.session.curatorCardUrl = aliOss.url;
                            });
                    }
                    return Promise.resolve(aliOss)
                }).then(aliOss => {
                    fs.exists(qrcodePath, exists => {
                        if (exists) fs.unlinkSync(qrcodePath);
                    })
                    fs.exists(cardPath, exists => {
                        if (exists) fs.unlinkSync(cardPath);
                    })
                    fs.exists(mergePath, exists => {
                        if (exists) fs.unlinkSync(mergePath);
                    })
                    return Promise.resolve(aliOss)
                })
        }).then((aliOss) => {
            return Promise.resolve(aliOss.url);
        })
    }
    /**
     * 生成邀请好友名片
     * id 棋牌室shortId
     * url 跳转地址
     * classRoom 棋牌室名称
     * nickName 用户昵称
     * phone 登录用的手机号
     * wechat 微信名称
     */
    async createFriendCard(shortId: string, classRoom: string, nickName: string, phone: string, wechat: string, disturb: string = "friend", url: string = 'http://www.369qipai.cn/') {
        const md5id = md5(shortId + disturb);
        const cardPath = `${process.cwd()}/app/public/card/${md5id}card.png`;
        let template: any = "";
        const ttc = `${process.cwd()}/app/public/card/MSYH.ttc`;
        //生成二维码
        const qrcodePath = await this.qrCode(shortId, url, disturb);
        let num = 500 - (classRoom.length * 30);
        let card: any = {}
        if (disturb == "friend" || disturb == "curator") {
            if (disturb == "friend") {
                //friend
                template = `${process.cwd()}/app/public/card/frinedTemplate.jpg`;
                card = new Promise((resolve, reject) => {
                    gm(template)
                        .fill("#787979")
                        .fontSize(31)
                        .font(ttc, 28)
                        .drawText(93, 255, wechat)
                        .drawText(93, 315, phone)
                        .font(ttc, 28)
                        .fill("#fff")
                        .drawText(560, 412, nickName)
                        .font(ttc, 35)
                        .fill("#fff")
                        .drawText(num, 85, classRoom)
                        .write(cardPath, function (err) {
                            resolve(err);
                        });
                }).then(err => {
                    const merge = this.mergeImage(shortId, cardPath, qrcodePath, disturb);
                    return Promise.resolve(merge);
                });

            }
            if (disturb == "curator") {
                template = `${process.cwd()}/app/public/card/curatorTemplate.jpg`;
                card = new Promise((resolve, reject) => {
                    gm(template)
                        .fill("#fff")
                        .fontSize(31)
                        .font(ttc, 28)
                        .drawText(100, 413, wechat)
                        .drawText(93, 381, phone)
                        .font(ttc, 35)
                        .fill("#fff")
                        .drawText(num, 85, classRoom)
                        .write(cardPath, function (err, charge) {
                            resolve(err);
                        });
                }).then(err => {
                    const merge = this.mergeImage(shortId, cardPath, qrcodePath, disturb);
                    return Promise.resolve(merge);
                });
            }
        }
        return card;
    }

    //检查文件 type friend  curator
    async  findFile(type: string = "friend") {
        let result: any = {};
        let flag: boolean = false;
        const findUrl = await this.ctx.model.User.findShortId(this.ctx.session.shortId);
        if (findUrl != null) {
            switch (type) {
                case "friend":
                    result = findUrl.nameCard.friendCardUrl;
                    if (findUrl.nameCard.friendCardUrl == "") {
                        flag = true;
                    }
                    break;
                case "curator":
                    result = findUrl.nameCard.curatorCardUrl;
                    if (findUrl.nameCard.curatorCardUrl == "") {
                        flag = true;
                    }
                    break;
            }
            if (flag) {
                console.log(123);
                result = this.createFriendCard(
                    this.ctx.session.shortId,
                    this.ctx.session.curatorName,
                    this.ctx.session.nickname,
                    this.ctx.session.phone,
                    this.ctx.session.wechatNumber,
                    type
                );
            }
        }
        return result;
    }
}

module.exports = AgentService;