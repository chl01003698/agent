'use strict';
module.exports = appInfo => {
  const config = exports

  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/chess',
    options: {},
  };

  config.mongooseLogger = {
    debug: false,
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
        db: 2,
      },
    }
  };

  config.keyv = {
    clients: {
      instance: {
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 0,
        namespace: 'agent',
        adapter: 'redis'
      }
    }
  };

  config.pingxx = {
    appid: "app_m5izjTjT40WPjPK8",
    apiKey: "sk_test_5eHaHSnHqjL80ij5GSHqnDOC",
    resultUrl: "http://192.168.225.106:7001/public/index.html#/index/account",
    // 测试key sk_test_5eHaHSnHqjL80ij5GSHqnDOC
  };

  //keen.io 埋点统计
  config.keenio = {
    agentId: '5a6fe2e7c9e77c00011f78ff',
    agentWriteKey: 'DDCF78621EEDC29DDCCE9C8B87C28527190C26FBA0DFEBBD80855F76039D6D8D4BF9F5D78788AE7AC8D3F5B28EFDF89A92EC91B1B9789FB10AE96647315414FE08789DE9A7F7D69DAF462BAFAEC7B4C82FE7409489183AE35296F5DE01C11DE2',
    chesstId: '5a7169edc9e77c00011f7a15',
    chessReadKey: '3C0B01A46022DB0AFF8F416D88D5C0891402914BC31D3EE3B8831DA5D4B681D5A534F358F3A35706CA49246628D0207EC8E49AB66564C57BAEC42E395A2F72CF2B3067429543D797C2D5E85A65A70A97E61D6F8CD43F1EC3A6FCD432E2E828BE',
  };
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