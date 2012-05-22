var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');

app.get('/', function(req, res){

    console.log("userId: " + req.session.userId);

    //If the session is active or the user is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.session.userId || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id, is_logged: true}});

    //if not, generate the rando session number and render the page
    }else{
        //generates random number to client, for authentication
        req.session.uuid = uuid.uuid(10);
        res.render('index', {data: { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id }});
    }



});

app.get('/enemies/:enemyId/:gameId', function(req, res){

    //generates random number to client, for authentication
    req.session.uuid = uuid.uuid(10);
    res.render('index', { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id });



});