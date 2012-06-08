var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var crypto = require('crypto');
var http = require('http');
var redis = require('redis-url').connect(env.redis_url);


function miniStackTrace(){

    var stackLines = new Error().stack.split(/\r\n|\r|\n/);

    var miniStackTrace = "";
    var i;

    for(i = 5; i > 2; i--){
        var pathSplit = stackLines[i].replace(')','').split('/');

        if(miniStackTrace == ""){
            miniStackTrace += pathSplit[pathSplit.length-1];
        }else{
            miniStackTrace += " - " + pathSplit[pathSplit.length-1];
        }

    }

    return miniStackTrace;

}

exports.userId = function(id){
    return {userId: id};
};

exports.verifyAuthorization = function(req, res, next){
    //if have authorization, player is authenticated
    if(!req.authorization){
        res.json(401,{code: 100, error: 'Not authorized or Session Expired'});
        console.log("AUTH ERROR: " + 100 + " - Not authorized or Session Expired");
        return;
    }

    next();

};

exports.isMobile = function(req){

    return req.headers['user-agent'].indexOf("Mobile") > -1;
};



exports.statsMix = function(user_id, metric_id, value, meta){

    if(env.development){
        return;
    }

    //ignore test user so it not report to statsMix
    if(user_id == env.secrets.test_user_id){
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
        headers: {'X-StatsMix-Token': env.secrets.statsmix_key , 'Content-Length': data.length}
    };

    var request = http.request(options);

    request.on('error', function(e) {
        console.log('Statsmix error: ' + e.message);
    });

    request.write(data);


    request.end();

};









