var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');

app.get('/', function(req, res){

    var isMobile = req.headers['user-agent'].indexOf("Mobile") > -1;

    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.cookies['X-HATracker-Token'] || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: isMobile ,is_logged: true}});

    }else{
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: isMobile }});
    }
});

app.get('/enemies/:enemyId/:gameId', function(req, res){

    var isMobile = req.headers['user-agent'].indexOf("Mobile") > -1;

    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.cookies['X-HATracker-Token'] || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: isMobile, is_logged: true}});

    }else{
        res.render('index', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: isMobile }});
    }


});


app.get('/terms_privacy', function(req, res){

    var isMobile = req.headers['user-agent'].indexOf("Mobile") > -1;

    res.render('terms_privacy', {data: { salt: env.salt, facebook_app_id: env.facebook_app_id, mobile: isMobile }});

});
