'use strict';
module.exports = appInfo => {
    const config = exports,
        object = {};
    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1515399912006_4674';
    config.middleware = ['errorHandler'];
    config.security = {
        xframe: {
            enable: false,
        },
        csrf: {
            enable: false,
        },
        // domainWhiteList: ['http://localhost:8000'],
    };
    config.cors = {
        credentials: true,
        enable: true,
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
    }
    config.multipart = {
        fileExtensions: ['.apk', '.pptx', '.docx', '.csv', '.doc', '.ppt', '.pdf', '.pages', '.wav', '.mov'],
    };
    config.onerror = {
        errorPageUrl: '/index.html#/exception/500',
        json(err, ctx) {
            ctx.body = {
                code: ctx.response.status,
                msg: err.message
            };
            ctx.status = ctx.response.status;
        }
    };
    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/chess',
        options: {},
    };
    config.jwt = {
        secret: 'Great4-M',
        enable: true,
        match: '/jwt',
    };
    config.mongooseLogger = {
        debug: true,
        // custom formatter, optional
        formatter: function (meta) {
            const query = JSON.stringify(meta.query);
            const options = JSON.stringify(meta.options || {});
            return `db.getCollection('${meta.collectionName}').${meta.methodName}(${query}, ${options})`;
        },
    };
    config.redis = {
        clients: {
          session: {
            port: 6379, // Redis port
            host: '127.0.0.1', // Redis host
            password: '',
            db: 0
          },
          payRank: {
            port: 6379,
            host: '127.0.0.1',
            password: '',
            db: 1,
          },
        }
      };
    exports.sessionRedis = {
        name: 'session',
    };
    config.joi = {
        options: {},
        locale: {
            'zh-cn': {}
        },
        throw: false
    };
    config.logrotator = {
        filesRotateByHour: [],
        hourDelimiter: '-',
        filesRotateBySize: [],
        maxFileSize: 50 * 1024 * 1024,
        maxFiles: 10,
        rotateDuration: 60000,
        maxDays: 31,
    };
    config.jayson = {
        host: 'localhost',
        port: 3003
    };
    config.passportLocal = {
        usernameField: 'phone',
        passwordField: 'password'
    };
    //验证插件
    config.joi = {
        options: {},
        locale: {
            'zh-cn': {}
        },
        throw: true
    };

    config.keyv = {
        clients: {
            instance: {
                port: 6379, // Redis port
                host: '127.0.0.1', // Redis host
                password: '',
                db: 0,
                namespace: 'keyv',
                adapter: 'redis'
            }
        }
    };

    config.sms = {
        key: 'b38226f48679c7eab0cd6835cab0f0fc',
        minutes: 1,
        template: '【369互娱】您的手机验证码是#code#',
        registerTemplate: '',
    };
    config.pingxx = {
        appid: "app_m5izjTjT40WPjPK8",
        apiKey: "sk_test_5eHaHSnHqjL80ij5GSHqnDOC",
        resultUrl: "http://www.369qipai.cn/",
    };
    config.notfound = {
        pageUrl: '/public/index.html',
    }
    config.raven ={
        key:'https://f4e43ec8a9244179aafaf635f2598181:145f4ef8307444c18ea3831667074c5d@sentry.io/272159',
    }
    //keen.io 埋点统计
    config.keenio = {
        projectId: '5a6fe441c9e77c00018eb75d',
        writeKey: 'B5C9B5CF1A1C84ED3DA66754599CDE2D1DB4A2297FD722B05EC1BF17BFA945392CA940BEAB5F8E33EA9FC84ABCAD9D0BFB05A52A72F3C14C404F04ABFFF8DE1083DD4B3C1DF2EC89292177DCB3CF3D9F533CDDC28854AF6FC4C846E9E31F5AFF'
    };
    config.code ={
        key:'ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@',
    }
    //阿里OSS
    config.oss = {
        client: {
            accessKeyId: 'LTAI0pAXumCVVog9',
            accessKeySecret: '6gUYu6nMYoOLjECNzyPjQMS2f9ZBHI',
            bucket: 'chess-dev',
            endpoint: 'oss-cn-beijing.aliyuncs.com',
            timeout: '60s',
            nameCardPaht:'/data/default/name-card/',
        },
    };
    return config;
};