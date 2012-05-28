var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var crypto = require('crypto');
var redis = require('redis-url').connect(env.redis_url);


exports.userId = function(id){
    return {userId: id};
};

exports.verifyAuthorization = function(req, res, next){
    //if have authorization, player is authenticated
    if(req.authorization){
        next();
    }else{
        res.json(401,{code: 100, error: 'Not authorized or Session Expired'});
        console.log({code: 100, error: 'Not authorized or Session Expired'});
    }

};









