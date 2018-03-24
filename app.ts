import * as Keyv from 'keyv'
import { AgentService } from './app/service/agent';
import { AgentMailsService } from './app/service/agentmails';
import { AgentMessagesService } from './app/service/agentMessages';
import { AgentCardsService } from './app/service/agentCards';
import { UtilityService } from './app/service/utility';
import { AgentBanksService } from './app/service/agentBanks';
import { SmsService } from './app/service/sms';
import { PingppService } from './app/service/pingpp';
import { KeenioService } from './app/service/keenio';
// import { OssService } from './app/service/oss';

import * as Joi from 'joi';

module.exports = app => {

  app.beforeStart(async () => {
  });
};

//挂载Service
declare module "egg" {
  interface IService {
    agent: AgentService,
    agentmails: AgentMailsService,
    agentMessages: AgentMessagesService,
    agentCards: AgentCardsService,
    utility: UtilityService,
    agentBanks: AgentBanksService,
    sms: SmsService,
    pingpp: PingppService,
    keenio: KeenioService,
    // oss: OssService
  }

  class Application {
    redis: any
    Joi: Joi
    keyv: Keyv
  }

}