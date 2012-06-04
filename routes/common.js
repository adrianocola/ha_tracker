var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var crypto = require('crypto');
var http = require('http');
var redis = require('redis-url').connect(env.redis_url);


exports.userId = function(id){
    return {userId: id};
};

exports.verifyAuthorization = function(req, res, next){
    //if have authorization, player is authenticated
    if(!req.authorization){
        res.json(401,{code: 100, error: 'Not authorized or Session Expired'});
        console.log({code: 100, error: 'Not authorized or Session Expired'});
        return;
    }

    next();

};

exports.isMobile = function(req){

    return req.headers['user-agent'].indexOf("Mobile") > -1;
};



exports.statsMix = function(metric_id, value, meta){

    if(env.development){
        return;
    }


    var date = new Date();

    var dateStr = date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + " " + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();

    var data = "value=" + value + "&profile_id=4066&metric_id=" + metric_id + "&generated_at=" + dateStr + (meta? "&meta=" + JSON.stringify(meta) :"");

    var options = {
        host: 'api.statsmix.com',
        port: 80,
        path: '/api/v2/stats',
        method: 'POST',
        headers: {'X-StatsMix-Token': env.statsmix_key , 'Content-Length': data.length}
    };

    var request = http.request(options);

    request.on('error', function(e) {
        console.log('Statsmix error: ' + e.message);
    });

    request.write(data);


    request.end();

};









