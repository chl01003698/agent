'use strict';
module.exports = appInfo => {
    const config = exports
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
    config.sessionRedis = {
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
        resultUrl: "http://192.168.225.106:7001/public/index.html#/index/account",
        // 测试key sk_test_5eHaHSnHqjL80ij5GSHqnDOC
    };
    config.notfound = {
        pageUrl: '/public/index.html',
    }
    config.raven = {
        key: 'https://f4e43ec8a9244179aafaf635f2598181:145f4ef8307444c18ea3831667074c5d@sentry.io/272159',
    }
    //keen.io 埋点统计
    config.keenio = {
        agentId: '5a6fe2e7c9e77c00011f78ff',
        agentWriteKey: 'DDCF78621EEDC29DDCCE9C8B87C28527190C26FBA0DFEBBD80855F76039D6D8D4BF9F5D78788AE7AC8D3F5B28EFDF89A92EC91B1B9789FB10AE96647315414FE08789DE9A7F7D69DAF462BAFAEC7B4C82FE7409489183AE35296F5DE01C11DE2',
        chesstId: '5a7169edc9e77c00011f7a15',
        chessReadKey: '3C0B01A46022DB0AFF8F416D88D5C0891402914BC31D3EE3B8831DA5D4B681D5A534F358F3A35706CA49246628D0207EC8E49AB66564C57BAEC42E395A2F72CF2B3067429543D797C2D5E85A65A70A97E61D6F8CD43F1EC3A6FCD432E2E828BE',
    };
    config.code = {
        key: 'ZzdNXzHkY0fqAr4SX8vnMAG*q7ivMCuiaxO8xTUGOivtpqOST*C0B!k5%H8z%U5!3XG#pB$#QUS8HDUoASR9hrTgqv0tljNp1V@',
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