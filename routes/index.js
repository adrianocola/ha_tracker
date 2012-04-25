var app = require('../app.js');
var models = require('../models.js');

app.get('/', function(req, res){
    models.Player.findOne({}, function (err, doc){

        req.session.playerId = undefined;

        if(!doc){
            var player = new models.Player();
            player.name = "Player";

            player.save(function(err){
                res.render('index', { title: "HA Tracker", username: player.name });
            });


        }else{
            res.render('index', { title: "HA Tracker", username: doc.name });
        }


    });
});

app.get('/add/:name',function(req, res){

    var player = new models.Player();
    player.name = req.params.name;

    player.save(function(err){
        res.send(player);
    });

});

app.get('/get/:id',function(req, res){

    models.Player.findById(req.params.id, function (err, doc){

        res.send(doc);
    });

});


app.get("/enemies/:enemyId/games/:gameId", function(req, res){
    models.Player.findOne({}, function (err, doc){

        req.session.playerId = undefined;

        res.render('index', { title: "HA Tracker", username: doc.name });
    });
});