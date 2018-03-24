'use strict';
const code={
        FAILED:-1,
        SUCCESS:0
    }

export default {
    code:code,
    success:function(data:any,msg:string = "ok"){
        return  {code:0,msg:msg,data:data};
    },

    err:function(msg:string,code:number = -1){
        return {code:code,msg:msg};
    }

}