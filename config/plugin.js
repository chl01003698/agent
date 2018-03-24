'use strict';
// had enabled by egg
exports.static = true;
//  exports.onerror = {
//   enable: true,
//   package: 'egg-onerror'
// }
exports.cors = {
    enable: true,
    package: 'egg-cors',
};
exports.mongoose = {
    enable: true,
    package: 'egg-mongoose',
};
exports.mongooseLogger = {
    enable: true,
    package: 'egg-mongoose-logger',
};
exports.sessionRedis = {
    enable: true,
    package: 'egg-session-redis',
};
exports.redis = {
    enable: true,
    package: 'egg-redis',
};
exports.keyv = {
    enable: true,
    package: 'egg-keyv'
};
exports.joi = {
    enable: true,
    package: 'egg-joi',
};
exports.instrument = {
    enable: true,
    package: 'egg-instrument',
};
exports.email = {
    enable: true,
    package: 'egg-mail',
};
// exports.logrotator = {
//   enable: true,
//   package: 'egg-logrotator',
// };
exports.passport = {
    enable: true,
    package: 'egg-passport',
};
// exports.passportLocal = {
//   enable: true,
//   package: 'egg-passport-local',
// };
exports.userrole = {
    enable: true,
    package: 'egg-userrole',
};
exports.userservice = {
    enable: true,
    package: 'egg-userservice',
};
exports.oss = {
    enable: true,
    package: 'egg-oss',
};
