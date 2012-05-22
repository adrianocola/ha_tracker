var env = module.exports = {
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    mongo_url: process.env.MONGOLAB_URI || 'mongodb://localhost/ha_tracker',
    redis_url: process.env.REDISTOGO_URL || 'redis://localhost:6379/'
};

env.development = env.node_env === 'development';
env.production = !env.development;

if (env.development) {

    env.salt = 'SYr=*E!{tPb3aRXk#}[';
    env.facebook_app_id = '103668843104996';
    try {
        env.secrets = require('./secrets');
    }
    catch(e) { throw "secret keys file is missing. see ./secrets.js.sample."; }

} else {
    env.secrets = {
        session: process.env.EXPRESS_SESSION_KEY
    };

    env.salt = 'I8~*8Ri:D69U/2etE5C';
    env.facebook_app_id = '349808971750591';

}
