"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const jayson = require("jayson/promise");
class RPCService extends egg_1.Service {
    constructor(ctx) {
        super(ctx);
        const jaysonConfig = this.app.config.jayson;
        console.log('jaysonConfig', jaysonConfig);
        this.client = jayson.client.http({
            port: jaysonConfig.port,
            host: jaysonConfig.host
        });
    }
    async updateConfig() {
        const response = await this.client.request('add', [1, 2]);
        return response;
    }
    async setMJControlType(args) {
        const response = await this.client.request('setMJControlType', args);
        return response;
    }
}
exports.RPCService = RPCService;
module.exports = RPCService;
