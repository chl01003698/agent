'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const _ = require("lodash");
class RankManager {
    constructor(redis) {
        this.redis = redis;
    }
    formatDate(token, distance = 0) {
        let result = '';
        if (token == 'total') {
            result = token;
            return result;
        }
        if (distance == 0) {
            if (token == 'day') {
                result = moment().format('YYYYMMDD');
            }
            else if (token == 'week') {
                result = moment().format('YYYYww');
            }
            else if (token == 'month') {
                result = moment().format('YYYYMM');
            }
            else if (token == 'year') {
                result = moment().format('YYYY');
            }
        }
        else if (distance > 0) {
            let tokens = token + 's';
            if (token == 'day') {
                result = moment().subtract(distance, tokens).format('YYYYMMDD');
            }
            else if (token == 'week') {
                result = moment().subtract(distance, tokens).format('YYYYww');
            }
            else if (token == 'month') {
                result = moment().subtract(distance, tokens).format('YYYYMM');
            }
            else if (token == 'year') {
                result = moment().subtract(distance, tokens).format('YYYY');
            }
        }
        return result;
    }
    tokensToKeys(tokens, distance = 0) {
        const results = [];
        _.forEach(tokens, (v) => {
            const dateStr = this.formatDate(v, distance);
            if (dateStr != "") {
                results.push(`${v}:${dateStr}`);
            }
        });
        return results;
    }
    // redis-key |  user  |  money | date
    add(keys, member, score, tokens) {
        _.forEach(tokens, (v) => {
            const dateStr = this.formatDate(v);
            if (dateStr != "") {
                _.forEach(keys, (key) => {
                    this.redis.zadd(`rank:${key}:${v}:${dateStr}`, score, member);
                });
            }
        });
    }
    addMulti(keys, members, tokens) {
        const dateKeys = this.tokensToKeys(tokens);
        const args = [];
        _.forEach(members, (v, k) => {
            args.push(v);
            args.push(k);
        });
        const commands = [];
        _.forEach(keys, (key) => {
            _.forEach(dateKeys, (v) => {
                args.unshift(`rank:${key}:${v}`);
                commands.push(args);
            });
        });
        _.forEach(commands, (v) => {
            this.redis.zadd.apply(this.redis, v);
        });
    }
    getRankKey(key, token, distance = 0) {
        return `rank:${key}:${token}:${this.formatDate(token, distance)}`;
    }
    async count(key, token, distance = 0) {
        return this.redis.zcard(this.getRankKey(key, token, distance));
    }
    async countByScore(key, min, max, token, distance = 0) {
        return this.redis.zcount(this.getRankKey(key, token, distance), min, max);
    }
    incrBy(key, member, score, token) {
        this.redis.zincrby(this.getRankKey(key, token, 0), score, member);
    }
    incrByMulti(keys, member, score, tokens) {
        _.forEach(keys, (key) => {
            _.forEach(tokens, (token) => {
                this.redis.zincrby(this.getRankKey(key, token, 0), score, member);
            });
        });
    }
    // 获取排行榜集合
    async revrange(key, min, max, withscores, token, distance = 0) {
        return this.redis.zrevrange(this.getRankKey(key, token, distance), min, max, withscores == true ? 'WITHSCORES' : '');
    }
    // 获取用户排名
    async revrank(key, token, distance, member) {
        return this.redis.zrevrank(this.getRankKey(key, token, distance), member);
    }
    //获取用户积分
    async score(key, token, distance, member) {
        return this.redis.zscore(this.getRankKey(key, token, distance), member);
    }
}
exports.default = RankManager;
