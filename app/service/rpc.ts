import { Service, Context } from 'egg'
import * as jayson from 'jayson/promise'

export class RPCService extends Service {
  client
  constructor(ctx: Context) {
    super(ctx)
    const jaysonConfig = this.app.config.jayson
    console.log('jaysonConfig', jaysonConfig);
    this.client = jayson.client.http({
      port: jaysonConfig.port,
      host: jaysonConfig.host
    });
  }
  async updateConfig() {
    const response = await this.client.request('add', [1, 2])
    return response
  }

  async setMJControlType(args) {
    const response = await this.client.request('setMJControlType', args)
    return response
  }
}

module.exports = RPCService;