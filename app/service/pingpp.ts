import { Service, Context } from 'egg'
import raven from 'raven'
import reply from '../const/reply';
import config from 'eslint-config-egg';
import * as ulid from 'ulid';
import * as mongoose from 'mongoose';

export class PingppService extends Service{


    async create(feild : any){
        const model = this.ctx.model;
        return new Promise((resolve, reject) => {
            const config:any = this.app.config;
            const pingpp = require('pingpp')(config.pingxx.apiKey);
            pingpp.setPrivateKeyPath(__dirname + "/apiclient_key.pem");
            pingpp.charges.create(feild, function(err, charge) {
                if (err != null) {
                    console.log('pingpp.charges.create failed: ', err);
                    reject(err);
                  } else {
                    resolve(charge)
                  }
            });
        }).then((charge)=>{
            return charge;
        }).catch((err)=>{
            return err;
        });
    }

}

module.exports = PingppService;