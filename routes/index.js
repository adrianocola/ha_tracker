var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');

app.get('/teste', function(req, res){

    res.render('teste');
});

app.get('/', function(req, res){


    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.cookies['X-HATracker-Token'] || req.cookies.KEEP_LOGGED_HASH){
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) ,is_logged: true}});

    }else{
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});
    }
});

app.get('/enemies/:enemyId/:gameId', function(req, res){


    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.cookies['X-HATracker-Token'] || req.cookies.KEEP_LOGGED_HASH){
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req), is_logged: true}});

    }else{
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});
    }


});

app.get('/reset_password', function(req, res){

    //get user
    app.redis.get("resetpw:" + req.query.confirmation, function(err,value){

        if(err) console.log(err);

        console.log(value);
        if(!value){

            res.render('reset_password_expired', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});

            return;
        }

        res.render('reset_password', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});

    });



});


app.get('/terms_privacy', function(req, res){

    res.render('terms_privacy', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});

});

app.get('/analysis', function(req, res){

    res.render('analysis', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});

});




//blitz.io verification
app.get('/mu-ebf93d2c-933d9476-93c43788-d7bb532c', function(req,res){
    res.send(200,'42');
});
