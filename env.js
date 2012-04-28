var env = module.exports = {
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    mongo_url: process.env.MONGOLAB_URI || 'mongodb://localhost/ha_tracker'
};

env.development = env.node_env === 'development';
env.production = !env.development;

if (env.development) {

} else {

}
