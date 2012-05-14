var app = require('../app.js');
var models = require('../conf/models.js');
env = require('../conf/env.js');
var common = require('./common.js');

app.get('/', function(req, res){

    models.Player.findOne({}, function (err, doc){

        req.session.playerId = undefined;

        if(!doc){
            var player = new models.Player();
            player.username = "Player";

            player.save(function(err){
                res.render('index', { title: "HA Tracker", username: player.username });
            });


        }else{
            res.render('index', { title: "HA Tracker", username: doc.username });
        }


    });
});


app.get('/api/teste', function(req,res){

    models.Player.findOne({email: req.query.email},{}, common.playerId(req.session.playerId), function(err,player){

        if(err){
            console.log(err);

            res.send({});
        }else{
            console.log("player:");
            console.log(player);

            res.send(player.secure());

        }

    });

});

app.get('/api/logout', function(req, res){

    if(req.session){
        req.session.destroy(function(err){
            res.send({});
        });
    }else{
        res.send({code: 105, error: "Not logged"});
    }
});


app.get('/api/login', function(req,res){

    var query = {};

    //if the user is trying to login with e-mail...
    if(req.query.usernameemail.match(/\S+@\S+\.\S+/)){
        query.email = req.query.usernameemail;
    //...or username
    }else{
        query.username = req.query.usernameemail;
    }



    models.Player.findOne(query,{}, common.playerId('MASTER'), function(err,player){

        if(err) console.log(err);

        if(player && req.query.password == player.password){
            req.session.playerId = player._id;

            res.send(player.secure());
        }else{
            res.send({code: 101, error: "Invalid email or password"});
        }

    });


});


app.post("/api/signup", function(req, res){

    var player = new models.Player();
    player.username = req.body.username;
    player.password = req.body.password;
    player.email = req.body.email;


    player.save( common.playerId('MASTER'),function(err){

        if(err){

            console.log(err);
            if(err.code == 11000){
                res.send({code: 103, error: "Username or Email already registered"});
            }else{
                res.send(err);
            }


        }else{
            player.ACL = {};
            player.ACL[player._id] = {read: true, write: true};

            player.save( common.playerId('MASTER'),function(err){

                if(err){
                    console.log(err);
                    res.send(err.message);
                }else{

                    req.session.playerId = player._id;

                    res.send(player.secure());
                }

            });
        }

    });

});



//app.get("/:enemyId/:gameId", function(req, res){
//    models.Player.findOne({}, function (err, doc){
//
//        req.session.playerId = undefined;
//
//        res.render('index', { title: "HA Tracker", username: doc.username });
//    });
//});