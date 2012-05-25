var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var crypto = require('crypto');
var redis = require('redis-url').connect(env.redis_url);


exports.userId = function(id){
    return {userId: id};
};

exports.verifyUser = function(req, res, next){

    //if have session, player is authenticated
    if(req.session.userId){
        next();
    }else{
        res.json(401,{code: 100, error: 'Not authorized'});
        console.log({code: 100, error: 'Not authorized'});
    }

};


exports.verifySession = function(req, res, next){

    //if have session, player is authenticated
    if(req.session){
        next();
    }else{
        res.json(401,{code: 100, error: 'Not authorized'});
        console.log({code: 100, error: 'Not authorized'});
    }

};









