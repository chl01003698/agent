"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class PingppService extends egg_1.Service {
    async create(feild) {
        const model = this.ctx.model;
        return new Promise((resolve, reject) => {
            const config = this.app.config;
            const pingpp = require('pingpp')(config.pingxx.apiKey);
            pingpp.setPrivateKeyPath(__dirname + "/apiclient_key.pem");
            pingpp.charges.create(feild, function (err, charge) {
                if (err != null) {
                    console.log('pingpp.charges.create failed: ', err);
                    reject(err);
                }
                else {
                    resolve(charge);
                }
            });
        }).then((charge) => {
            return charge;
        }).catch((err) => {
            return err;
        });
    }
}
exports.PingppService = PingppService;
module.exports = PingppService;
