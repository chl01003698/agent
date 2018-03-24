"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sf = require("sf");
const yunpian_sdk_1 = require("yunpian-sdk");
const ms = require("ms");
const _ = require("lodash");
const egg_1 = require("egg");
const qs = require('querystring');
class SmsService extends egg_1.Service {
    async send(phoneNumber, authCode) {
        const config = this.app.config;
        const keyv = this.app.keyv.get('instance');
        const sms = new yunpian_sdk_1.SMS({
            apikey: config.sms.key
        });
        let result = false;
        let sendResults = {};
        if (yunpian_sdk_1.phone(phoneNumber)) {
            const minutes = config.sms.minutes;
            let content = config.sms.template;
            content = content.replace('#code#', authCode);
            content = sf(content, { code: authCode, minutes: minutes });
            const sendResult = await sms.singleSend({
                mobile: phoneNumber,
                text: content
            });
            // 返回错误结构
            // sendResult { http_status_code: 400,
            //     code: 22,
            //     msg: '验证码类短信1小时内同一手机号发送次数不能超过3次',
            //     detail: '验证码类短信1小时内同一手机号发送次数不能超过3次' }
            // sendResult { http_status_code: 400,
            //     code: 33,
            //     msg: null,
            //     detail: '号码：13717807729, 超过频率，同一个手机号同一验证码模板每30秒只能发送一条' }
            await keyv.set(`sms:${phoneNumber}`, authCode, ms(`${minutes}m`));
            // const realCode = await keyv.get(`sms:${phoneNumber}`)
            // console.log('realCode',realCode);
            if (sendResult.code == 0) {
                keyv.set(`sms:${phoneNumber}`, authCode, ms(`${minutes}m`));
                result = true;
            }
            sendResults = sendResult;
        }
        return { result: result, sendResult: sendResults };
    }
    async sendRegisterMsg(phoneNumber, url) {
        const config = this.app.config;
        const keyv = this.app.keyv.get('instance');
        const sms = new yunpian_sdk_1.SMS({
            apikey: config.sms.key
        });
        if (yunpian_sdk_1.phone(phoneNumber)) {
            const content = sf(config.sms.registerTemplate, { phone: phoneNumber, url: url });
            sms.singleSend({
                mobile: phoneNumber,
                text: content
            });
        }
    }
    async auth(phoneNumber, code) {
        let result = false;
        const keyv = this.app.keyv.get('instance');
        const realCode = await keyv.get(`sms:${phoneNumber}`);
        if (_.isString(realCode) && realCode == code) {
            result = true;
        }
        return result;
    }
    checkPhone(phoneNumber) {
        return yunpian_sdk_1.phone(phoneNumber);
    }
}
exports.SmsService = SmsService;
module.exports = SmsService;
