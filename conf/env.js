var env = module.exports = {
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    mongo_url: process.env.MONGOLAB_URI || 'mongodb://localhost/ha_tracker'
};

env.development = env.node_env === 'development';
env.production = !env.development;

if (env.development) {

    env.salt = 'SYr=*E!{tPb3aRXk#}[';

    try {
        env.secrets = require('./secrets');
    }
    catch(e) { throw "secret keys file is missing. see ./secrets.js.sample."; }

} else {

    env.salt = 'I8~*8Ri:D69U/2etE5C';

}
