var app = require('../app.js');
var models = require('../conf/models.js');
env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../public/javascripts/vendor/md5.js');

app.get('/', function(req, res){

    //generates random number to client, for authentication
    req.session.uuid = uuid.uuid(10);
    res.render('index', { title: "HA Tracker", uuid: req.session.uuid });


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
        req.session.playerId = undefined;
        res.send({});
//        req.session.destroy(function(err){
//
//        });
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

        var secure_password = md5.hex_md5(player.password + req.session.uuid);

        if(player && req.query.password == secure_password){
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

    console.log("PASSWORD: " + player.password);

    player.save( common.playerId('MASTER'),function(err){

        if(err){

            console.log(err);
            if(err.code == 11000){
                res.send({code: 103, error: "Username or Email already registered"});
            }else{
                res.send(err);
            }


        }else{

            player.addACL(player._id,true,true);

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