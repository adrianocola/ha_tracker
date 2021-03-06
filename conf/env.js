var env = module.exports = {
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5001,
    mongo_url: process.env.MONGOLAB_URI || 'mongodb://localhost/ha_tracker',
    redis_url: process.env.REDISTOGO_URL || 'redis://localhost:6379/',
    nodetime_key: process.env.NODETIME_ACCOUNT_KEY
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
        session: process.env.EXPRESS_SESSION_KEY,
        mail_username: process.env.MAIL_USERNAME,
        mail_password: process.env.MAIL_PASSWORD,
        statsmix_key: process.env.STATSMIX_KEY,
        test_user_id: process.env.TEST_USER_ID,
        test_player_id: process.env.TEST_PLAYER_ID


    };

    env.salt = 'I8~*8Ri:D69U/2etE5C';
    env.facebook_app_id = '349808971750591';


}
