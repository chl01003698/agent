import * as Boom from 'boom';
import { close } from 'inspector';

module.exports = function (app) {
  app.role.use('auth', async ctx => {
    const auth = typeof ctx.session.userId != "undefined" && ctx.session.userId != null ? true : false;
    console.log("登录验证", auth);
    return auth;
  });

  app.role.use('error404', async ctx => {
    if (ctx.status == '404') {
      ctx.body = { code: -2, msg: "请登录" }
      return;
    }
  });
  app.role.use('public', async ctx => {
    ctx.redirect('/public/index.html');
    return;
  });

  app.role.failureHandler = function (ctx, action) {
    if (ctx.session == "") {
      ctx.body = { code: -2, msg: "请登录" }
      return;
    }
    if (ctx.session.expireTime <= Date.now()) {
      ctx.session = null;
      ctx.body = { code: -2, msg: "请登录" }
      return;
    }
    if (ctx.status == '404') {
      if (ctx.acceptJSON) {
        ctx.body = { code: -2, msg: "请登录" }
        return;
      } else {
        ctx.redirect('/public/index.html');
      }
    }
    if (ctx.status == '422') {
      ctx.body = { code: -1, msg: "请检查字段" }
      return;
    }

    if (action == 'auth') {
      if (ctx.acceptJSON) {
        throw Boom.unauthorized('权限不足')
        // ctx.body = Boom.unauthorized('权限不足').output.payload
      } else {
        ctx.realStatus = 200;
        ctx.redirect('/public/index.html');
      }
    }
    if (action == 'public') {
      ctx.realStatus = 200;
      ctx.redirect('/public/index.html');
    }
  }
};