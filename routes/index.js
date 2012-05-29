var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');

app.get('/', function(req, res){


    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.cookies['X-HATracker-Token'] || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) ,is_logged: true}});

    }else{
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});
    }
});

app.get('/enemies/:enemyId/:gameId', function(req, res){


    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.cookies['X-HATracker-Token'] || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req), is_logged: true}});

    }else{
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});
    }


});


app.get('/terms_privacy', function(req, res){

    res.render('terms_privacy', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: common.isMobile(req) }});

});

//blitz.io verification
app.get('/mu-ebf93d2c-933d9476-93c43788-d7bb532c', function(req,res){
    res.send(200,'42');
});
