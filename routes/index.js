var app = require('../app.js');
var models = require('../conf/models.js');
env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../public/javascripts/vendor/md5.js');

app.get('/', function(req, res){

    //generates random number to client, for authentication
    req.session.uuid = uuid.uuid(10);
    res.render('index', { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id });



});


app.get('/api/teste', function(req,res){

    console.log("TESTE");

//    models.Player.findOne({email: req.query.email},{}, common.playerId(req.session.playerId), function(err,player){
//
//        if(err){
//            console.log(err);
//
//            res.send({});
//        }else{
//            console.log("player:");
//            console.log(player);
//
//            res.send(player.secure());
//
//        }
//
//    });

});

app.get('/api/logout', function(req, res){

    if(req.session){
        req.session.playerId = undefined;
        res.clearCookie('KEEP_LOGGED_USER');
        res.clearCookie('KEEP_LOGGED_ID');
        res.send({});
//        req.session.destroy(function(err){
//
//        });
    }else{
        res.send({code: 105, error: "Not logged"});
    }
});


app.get('/api/login', function(req,res){

    if(req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID){

        models.KeepLogged.findById(req.cookies.KEEP_LOGGED_ID,{},common.playerId('MASTER'),function(err,keepLogged){

            if(err) console.log(err);

            if(keepLogged){

                models.Player.findById(keepLogged.playerId,{}, common.playerId('MASTER'), function(err,player){

                    if(err) console.log(err);

                    if(player){
                        req.session.playerId = player._id;

                        res.send(player.secure());
                    }else{
                        res.clearCookie('KEEP_LOGGED_USER');
                        res.clearCookie('KEEP_LOGGED_ID');
                        res.send({code: 107, error: "User not exists!"});
                    }
                });

            }else{

                res.clearCookie('KEEP_LOGGED_USER');
                res.clearCookie('KEEP_LOGGED_ID');
                res.send({code: 106, error: "Session Expired"});

            }


        })

    }else{


        models.Player.findOne({username: req.query.username},{}, common.playerId('MASTER'), function(err,player){

            if(err) console.log(err);

            if(player && req.query.password == md5.hex_md5(player.password + req.session.uuid)){
                req.session.playerId = player._id;

                if(req.query.keepLogged){

                    var keepLogged = new models.KeepLogged();

                    keepLogged.usernameHash = md5.hex_md5(env.salt + player.username + env.salt);
                    keepLogged.playerId = player._id;


                    keepLogged.save(common.playerId('MASTER'),function(err){

                        if(err) console.log(err);

                        res.cookie('KEEP_LOGGED_USER', keepLogged.username, { maxAge: 1209600000 });
                        res.cookie('KEEP_LOGGED_ID', keepLogged._id.toString(), { maxAge: 1209600000 });

                        res.send(player.secure());

                    });


                }else{
                    res.send(player.secure());
                }




            }else{
                res.send({code: 101, error: "Invalid email or password"});
            }

        });


    }





});


app.post("/api/signup", function(req, res){

    if(!req.body.username || !req.body.password || !req.body.email){
        res.send({code: 107, error: "Missing username, email or password"});
    } else{

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

    }





});


app.get("/api/login-facebook", function(req, res){

    models.Player.findOne({"facebook.userID": req.query.userID},{}, common.playerId('MASTER'), function(err,player){

        if(err){
            console.log(err);
            res.send(err);
        }else{
            //found existing player
            if(player){
                console.log("LOGIN - FACE");

                req.session.playerId = player._id;

                res.send(player.secure());
            //must create a new player, user ins signup with facebook
            }else{
                console.log("SIGNUP - FACE");
                var player = new models.Player();

                player.facebook = {};

                player.facebook.userID = req.query.userID;
                player.facebook.accessToken = req.query.accessToken;
                player.facebook.expiresIn = req.query.expiresIn;

                player.save( common.playerId('MASTER'),function(err){

                    if(err){
                        console.log(err);
                        res.send(err);

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
            }
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