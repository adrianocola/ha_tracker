var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');

app.get('/', function(req, res){
    console.log(req.session);
    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.session.userId || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { title: "HA Tracker", salt: env.salt, facebook_app_id: env.facebook_app_id, is_logged: true}});

    }else{
        res.render('index', {data: { title: "HA Tracker", salt: env.salt, facebook_app_id: env.facebook_app_id }});
    }



});

app.get('/enemies/:enemyId/:gameId', function(req, res){

    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.session.userId || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { title: "HA Tracker", salt: env.salt, facebook_app_id: env.facebook_app_id, is_logged: true}});

    }else{
        res.render('index', {data: { title: "HA Tracker", salt: env.salt, facebook_app_id: env.facebook_app_id }});
    }


});