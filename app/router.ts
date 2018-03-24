'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;
    //本地验证
    // app.passport.mount('local', {
    //   loginURL: '/',
    //   successRedirect: null
    // })
    //注册验证
    const auth = app.role.can('auth');
    const error404 = app.role.can('error404');
    const p = app.role.can("public");
    router.get("/",p,error404);
    //API验证
    //登录
    router.post("/agent/login",'v1.agents.login');
    router.use('/api/v1', auth);

    //代理邮箱
    router.resources('mails', '/api/v1/agentmails/', 'v1.agentMails');
    //代理公告
    router.get('/api/v1/agentmessages', 'v1.agentMessages.index');
    //我的棋牌室
    router.get("/api/v1/agents/myChessRoom",'v1.agents.myChessRoom');
    //修改密码
    router.post("/api/v1/agents/editPassword",'v1.agents.editPassword');
    //退出
    router.get("/api/v1/agents/logout",'v1.agents.logout');
    //棋牌室名称修改
    router.post("/api/v1/agents/chessName",'v1.agents.myChessNameEditor');
    //棋牌室宣言修改
    router.post("/api/v1/agents/chessDeclaration",'v1.agents.myChessDeclarationEditor');
    //获取棋牌室信息
    router.get("/api/v1/agents/getChessInfo",'v1.agents.getChessInfo');
    //微信号修改
    router.post("/api/v1/agents/wechatNumber",'v1.agents.wechatNumberEditor');
    //馆长 解绑用户
    router.post("/api/v1/agents/untyingUsers",'v1.agents.untyingUsers');
    //切换身份
    router.post("/api/v1/agents/switchidentity",'v1.agents.switchIdentity');
    //认证用户姓名身份证
    router.post("/api/v1/agents/realauthrealname",'v1.agents.realAuthRealname');
    //认证用户省市
    router.post("/api/v1/agents/realauthrealcity",'v1.agents.realAuthRealCity');
    //馆长数据统计
    router.get("/api/v1/agents/curatordatacount",'v1.agents.curatorDataCount');
    //用户详细信息
    router.get("/api/v1/agents/userinfo",'v1.agents.getUserInfo');
    //用户提现
    router.post("/api/v1/agentbanks/withdrawals",'v1.agentBanks.withdrawals');
    //提现验证码
    router.post("/api/v1/agentbanks/verificationCode",'v1.agentBanks.verificationCode');
    //提现历史列表
    router.get("/api/v1/agentbanks/withdrawalslist",'v1.agentBanks.withdrawalsList');
    //银行卡
    router.resources('banks', '/api/v1/agentbanks/', 'v1.agentBanks');
    //代理转卡列表查询
    router.resources('cards', '/api/v1/agentcards/', 'v1.agentCards');
    //库存列表
    router.get("/api/v1/stocklist",'v1.agentCards.stockList');
    //进货
    router.post("/api/v1/purchase",'v1.agentCards.purchase');
    //ping++CallBack
    router.post("/api/pingcallback","v1.agentCards.pingCallBack");
    //订单状态查询
    router.post("/api/v1/agentcards/orderstatus","v1.agentCards.orderStatus");
    //转卡给自己 
    router.post("/api/v1/agentcards/stocktocard","v1.agentCards.transferStockToCard");
    // //下挂馆长
    // router.get("/api/v1/curatorlist",'v1.agentCards.curatorLists');
    //代理查找馆长
    // router.post("/api/v1/findcurator",'v1.agentCards.findCurator');
    //代理数据统计
    router.get("/api/v1/agents/agentdatacount",'v1.agents.agentDataCount');
    //馆长用户排行榜
    router.get("/api/v1/agents/getusercharts",'v1.agents.getUserCharts');
    //获取用户/代理ShortId
    router.get("/api/v1/agents/getshortid",'v1.agents.getShortId');
    //获取用户/代理ShortId
    // router.get("/api/v1/agents/getshortid",'v1.agents.getShortId');
    //获取邀请好友名片地址
    router.get("/api/v1/agents/getfriendcard",'v1.agents.getFriendNameCard');
    //获取邀请馆长名片地址
    router.get("/api/v1/agents/getcuratorcard",'v1.agents.getCuratorNameCard');
    

    //馆长详情
    // router.get("/api/v1/agents/curatorinfolist",'v1.agents.getCuratorInfoList');

    // //生成测试数据 生成用户+馆长
    // router.get("/api/tests/index",'v1.tests.index');
    // //生成测试数据 代理 +馆长
    // router.get("/api/tests/agent",'v1.tests.agent');
    // //生成测试数据 代理+
    // router.get("/api/tests/agentsuper",'v1.tests.agentSuper');
    // router.get("/api/tests/createchessandagent",'v1.tests.createChessAndAgent');
    // router.get("/api/tests/createusers",'v1.tests.createUsers');
    // router.get("/api/tests/createcurator",'v1.tests.createCurator');

    // router.get("/tests/gmjpg",'v1.tests.gmjpg');

};