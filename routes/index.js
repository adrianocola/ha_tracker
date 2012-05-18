var app = require('../app.js');
var models = require('../conf/models.js');
env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../public/javascripts/vendor/md5.js');

app.get('/', function(req, res){

    //If the session is active or the player is with KEEP_LOGGED_IN cookies,
    //notify the client that he must try to login without credentials
    if(req.session.playerId || (req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID)){
        res.render('index', {data: { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id, is_logged: true}});

    //if not, generate the rando session number and render the page
    }else{
        //generates random number to client, for authentication
        req.session.uuid = uuid.uuid(10);
        res.render('index', {data: { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id }});
    }



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

        models.Player.findById(req.session.playerId,{}, common.playerId('MASTER'), function(err,player){

            if(player.facebook){
                player.facebook.accessToken = undefined;
                player.facebook.expiresIn = undefined;

                player.save(common.playerId('MASTER'),function(err){});

            }

            req.session.playerId = undefined;
            res.clearCookie('KEEP_LOGGED_USER');
            res.clearCookie('KEEP_LOGGED_ID');

            res.send({});


        });


//        req.session.destroy(function(err){
//
//        });
    }else{
        res.send({code: 105, error: "Not logged"});
    }
});


app.get('/api/login', function(req,res){

    //if login request have username and password, tries to login using credentials
    if(req.query.username && req.query.password){
        console.log("TENTOU LOGIN POR CREDENCIAL: (" + req.query.username + ", " +  req.query.password + ")");
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

                        console.log("KEEP_LOGGED");
                        res.cookie('KEEP_LOGGED_USER', keepLogged.usernameHash, { maxAge: 1209600000 });
                        res.cookie('KEEP_LOGGED_ID', keepLogged._id.toString(), { maxAge: 1209600000 });

                        res.send(player.secure());

                    });


                }else{
                    res.clearCookie('KEEP_LOGGED_USER');
                    res.clearCookie('KEEP_LOGGED_ID');
                    res.send(player.secure());
                }




            }else{
                res.clearCookie('KEEP_LOGGED_USER');
                res.clearCookie('KEEP_LOGGED_ID');
                res.send({code: 101, error: "Invalid email or password"});
            }

        });
    //if no credentials were passed in request, tries to login using current session
    // or KEEL_LOGGED_IN cookies
    } else{
        //session is alive, player just closed the browser or refreshed the page
        if(req.session.playerId){
            console.log("TENTOU LOGIN POR SESSAO");
            models.Player.findById(req.session.playerId,{}, common.playerId(req.session.playerId), function(err,player){
                res.send(player.secure());
            });

            //player marked option to
        }else if(req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID){
            console.log("TENTOU LOGIN POR KEEP LOGGED IN");
            models.KeepLogged.findById(req.cookies.KEEP_LOGGED_ID,{},common.playerId('MASTER'),function(err,keepLogged){

                if(err) console.log(err);

                if(keepLogged){

                    models.Player.findById(keepLogged.playerId,{}, common.playerId('MASTER'), function(err,player){

                        if(err) console.log(err);

                        if(player){
                            req.session.playerId = player._id;

                            res.cookie('KEEP_LOGGED_USER', req.cookies.KEEP_LOGGED_USER, { maxAge: 1209600000 });
                            res.cookie('KEEP_LOGGED_ID', req.cookies.KEEP_LOGGED_ID, { maxAge: 1209600000 });

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
            res.clearCookie('KEEP_LOGGED_USER');
            res.clearCookie('KEEP_LOGGED_ID');
            res.send({code: 106, error: "Session Expired"});
        }
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
                //if is startup means that the user is logged in facebook and
                //is registered here as a valid
                if(req.query.startup){
                    //check if the user is authenticated here (didn't made logoff)
                    if(player.facebook.accessToken == req.query.accessToken){
                        req.session.playerId = player._id;

                        res.send(player.secure());
                    }else{
                        res.send({code: 106, error: "Session Expired"});
                    }

                //if the player is authenticated in facebook but logged off
                // he can click on facebook button again and login
                }else{

                    player.facebook.accessToken = req.query.accessToken;
                    player.facebook.expiresIn = req.query.expiresIn;

                    player.save(common.playerId('MASTER'),function(){

                        if(err) console.log(err);

                        req.session.playerId = player._id;

                        res.send(player.secure());

                    });
                }

            //must create a new player, user signed up via facebook
            //but check if is not startup. If is startup means that the
            //user must first click on facebook button to authenticate
            }else if(!req.query.startup){
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
            //user is logged in facebook ,don' have account here but is startup
            //so I can' create an account here.
            }else{
                res.send({code: 108, error: "Facebook user not authenticated!"});
            }
        }




    });

});


app.delete('delete',function(){

    //https://developers.facebook.com/docs/reference/api/user/

//    Delete
//
//    You can de-authorize an application or revoke a specific extended permissions on behalf of a user by issuing an HTTP DELETE request to PROFILE_ID/permissions with a user access_token for that app.
//
//        Parameter	 Description	 Type	 Required
//    permission	 The permission you wish to revoke. If you don't specify a permission then this will de-authorize the application completely.	string	 no
//    You get the following result.
//
//        Description	 Type
//    True if the delete succeeded and error otherwise.	boolean


});



//app.get("/:enemyId/:gameId", function(req, res){
//    models.Player.findOne({}, function (err, doc){
//
//        req.session.playerId = undefined;
//
//        res.render('index', { title: "HA Tracker", username: doc.username });
//    });
//});

app.get('/:enemyId/:gameId', function(req, res){

    //generates random number to client, for authentication
    req.session.uuid = uuid.uuid(10);
    res.render('index', { title: "HA Tracker", uuid: req.session.uuid, salt: env.salt, facebook_app_id: env.facebook_app_id });



});