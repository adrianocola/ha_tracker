var app = require('../app.js');
var models = require('../models.js');

app.get('/', function(req, res){
    models.Player.findOne({}, function (err, doc){

        req.session.playerId = undefined;

        res.render('index', { title: "HA Tracker", username: doc.name });
    });
});


app.get("/enemies/:enemyId/games/:gameId", function(req, res){
    models.Player.findOne({}, function (err, doc){

        req.session.playerId = undefined;

        res.render('index', { title: "HA Tracker", username: doc.name });
    });
});