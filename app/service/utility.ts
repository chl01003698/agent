
import { Service, Context } from 'egg'

export class UtilityService extends Service {

    getCheckLogin(){
        let result : boolean = false;
            if(this.ctx.session.userId != null){
                result = true;
            }
            return result;
    }
}

module.exports = UtilityService;