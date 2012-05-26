var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../api/md5.js');
var sha1 = require('../api/sha1.js');
var u = require('underscore');
var https = require('https');
var redis = require('redis-url').connect(env.redis_url);

function clearCookies(res){

    res.clearCookie('KEEP_LOGGED_USER');
    res.clearCookie('KEEP_LOGGED_ID');

};

function clearSession(req, res){

    //req.session.userId = undefined;
    req.session.destroy();


    clearCookies(res);

};



app.get('/api/token', function(req, res){

    if(req.authorization){
        if(req.authorization.access != undefined){
            console.log("+1");
            req.authorization.access += 1;
        }else{
            console.log("0");
            req.authorization.access = 0;
        }




        res.send(JSON.stringify(req.authorization));


    }else{
        req.generateSession(function(session){

            session.merda = "bosta";

            res.send(JSON.stringify(session.id));
        });
    }





//    common.generateSession({coisa: 'lixo'},function(err,token){
//        //res.send(token);
//
//        common.getSession(token,function(err,value){
//            res.send(value);
//        });
//
//
//    });


});

app.get('/api/salt', function(req, res){

    res.send(env.salt);

});

app.get('/api/nonce', function(req, res){

    //generates a nonce for password cryptography
    //mode details: http://en.wikipedia.org/wiki/Cryptographic_nonce
    req.session.nonce = uuid.uuid(10);
    res.send(req.session.nonce);

});


app.get('/api/user/logout', function(req, res){

    if(req.session.userId){

        models.User.findById(req.session.userId,{}, common.userId('MASTER'), function(err,user){

            //if is a facebook user, clean facebook access token
            if(user.facebook.userID){
                user.facebook.accessToken = undefined;
                user.facebook.expiresIn = undefined;

                user.save(common.userId('MASTER'),function(err){});

            }

            clearSession(req,res);

            res.send({});


        });

    }else{
        res.send({code: 105, error: "Not logged"});
    }
});


app.get('/api/user/login', function(req,res){

    //if login request have username and password, tries to login using credentials
    if(req.query.username && req.query.password){
        console.log("TENTOU LOGIN POR CREDENCIAL: (" + req.query.username + ", " +  req.query.password + ")");
        models.User.findOne({username: req.query.username.toLowerCase()},{}, common.userId('MASTER'), function(err,user){

            if(err) console.log(err);

            if(user && req.query.password == md5.hex_md5(user.password + req.session.nonce)){
                req.session.userId = user._id;

                if(req.query.keepLogged){
                    var keepLogged = new models.KeepLogged();

                    keepLogged.usernameHash = md5.hex_md5(env.salt + user.username + env.salt);
                    keepLogged.userId = user._id;


                    keepLogged.save(common.userId('MASTER'),function(err){

                        if(err) console.log(err);

                        //2 weeks = 1209600000 ms
                        res.cookie('KEEP_LOGGED_USER', keepLogged.usernameHash, { maxAge: 1209600000 });
                        res.cookie('KEEP_LOGGED_ID', keepLogged._id.toString(), { maxAge: 1209600000 });

                        res.send(user.secure());

                    });


                }else{
                    clearCookies(res);
                    res.send(user.secure());
                }




            }else{
                clearCookies(res);
                res.send({code: 101, error: "Invalid username or password"});
            }

        });
        //if no credentials were passed in request, tries to login using current session
        // or KEEL_LOGGED_IN cookies
    } else{
        clearSession(req,res);
        res.send({code: 109, error: "Missing Login Credentials"});
    }

});


app.get('/api/user/continue_login', function(req,res){

    if(req.session.userId){
        console.log("TENTOU LOGIN POR SESSAO");
        models.User.findById(req.session.userId,{}, common.userId(req.session.userId), function(err,user){

            if(err){
                console.log(err);
            }

            if(user){
                res.send(user.secure());
            }else{
                res.send({code: 107, error: "User not exists!"});
            }


        });

        //user marked option to
    }else if(req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID){
        console.log("TENTOU LOGIN POR KEEP LOGGED IN");
        models.KeepLogged.findById(req.cookies.KEEP_LOGGED_ID,{},common.userId('MASTER'),function(err,keepLogged){

            if(err) console.log(err);

            if(keepLogged){

                models.User.findById(keepLogged.userId,{}, common.userId('MASTER'), function(err,user){

                    if(err) console.log(err);

                    if(user){
                        req.session.userId = user._id;

                        //2 weeks = 1209600000 ms
                        res.cookie('KEEP_LOGGED_USER', req.cookies.KEEP_LOGGED_USER, { maxAge: 1209600000 });
                        res.cookie('KEEP_LOGGED_ID', req.cookies.KEEP_LOGGED_ID, { maxAge: 1209600000 });

                        res.send(user.secure());
                    }else{
                        clearSession(req,res);
                        res.send({code: 107, error: "User not exists!"});
                    }
                });

            }else{
                clearSession(req,res);
                res.send({code: 106, error: "Session Expired"});

            }


        })

    }else{
        clearSession(req,res);
        res.send({code: 106, error: "Session Expired"});
    }




});


app.post("/api/user/signup", function(req, res){

    if(!req.body.username || !req.body.password || !req.body.email){
        res.send({code: 107, error: "Missing username, email or password"});
    } else{



        var user = new models.User();
        var player = new models.Player();

        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.player = player;
        user.addACL(user._id,true,true);

        player.user = user;
        player.addACL(user._id,true,true);

        //save user
        user.save( common.userId('MASTER'),function(err){

            if(err){
                console.log(err);
                if(err.code == 11000){
                    res.send({code: 103, error: "Username or Email already registered"});
                }else{
                    res.send(err);
                }


            }else{

                //save player
                player.save(common.userId('MASTER'),function(err){

                    if(err){
                        console.log(err);
                        res.send(err);
                    }else{
                        clearCookies(res);

                        req.session.userId = user._id;

                        res.send(user.secure());
                    }

                });

            }

        });

    }
});


app.get("/api/user/login-facebook", function(req, res){

    models.User.findOne({"facebook.userID": req.query.userID},{}, common.userId('MASTER'), function(err,user){
        if(err){
            console.log(err);
            res.send(err);
        }else{
            //found existing user
            if(user){
                //if is startup means that the user is logged in facebook and
                //is registered here as a valid
                if(req.query.startup){
                    //check if the user is authenticated here (didn't made logoff)
                    if(user.facebook.accessToken == req.query.accessToken){
                        req.session.userId = user._id;

                        res.send(user.secure());
                    }else{
                        res.send({code: 109, error: "Facebook Session Expired or User Logged out"});
                    }

                //if the user is authenticated in facebook but logged off
                // he can click on facebook button again and login
                }else{

                    user.facebook.accessToken = req.query.accessToken;
                    user.facebook.expiresIn = req.query.expiresIn;

                    user.save(common.userId('MASTER'),function(){

                        if(err) console.log(err);

                        req.session.userId = user._id;

                        res.send(user.secure());

                    });
                }

            //must create a new user, user signed up via facebook
            //but check if is not startup. If is startup means that the
            //user must first click on facebook button to authenticate
            }else if(!req.query.startup){

                var user = new models.User();
                var player = new models.Player();

                user.facebook = {};

                user.facebook.userID = req.query.userID;
                user.facebook.accessToken = req.query.accessToken;
                user.facebook.expiresIn = req.query.expiresIn;
                user.player = player;
                user.addACL(user._id,true,true);

                player.user = user;
                player.addACL(user._id,true,true);

                user.save( common.userId('MASTER'),function(err){

                    if(err){
                        console.log(err);
                        res.send(err);

                    }else{

                        player.save( common.userId('MASTER'),function(err){

                            if(err){
                                console.log(err);
                                res.send(err.message);
                            }else{

                                req.session.userId = user._id;

                                res.send(user.secure());
                            }

                        });
                    }

                });
                //user is logged in facebook ,don' have account here but is startup
                //so I can' create an account here.
            }else{
                clearSession(req,res);
                res.send({code: 108, error: "Facebook user not authenticated!"});
            }
        }




    });

});


app.delete('/api/user/delete',common.verifyUser, function(req, res){


    models.User.findById(req.session.userId,{},common.userId(req.session.userId),function(err, user){

        if(err) console.log(err);

        //remove from facebook
        if(user.facebook.userID){
            //https://developers.facebook.com/docs/reference/api/user/
            var request = https.request({
                host: 'graph.facebook.com',
                port: 443,
                path: '/' + user.facebook.userID + "/permissions?access_token=" + user.facebook.accessToken,
                method: 'DELETE'
            },function (response) {
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    console.log('REMOVED FROM FACEBOOK: ' + chunk);
                });
            });
            request.end();

        }

        user.remove(function(err){

            if(err) console.log(err);

            clearSession(req,res);

            res.send('true');

        });

    });

});


app.delete('/api/user/reset',common.verifyUser, function(req, res){




    models.User.findById(req.session.userId,{},common.userId(req.session.userId),function(err, user){

        if(err) console.log(err);


        models.Player.findOne({user: req.session.userId},{},common.userId(req.session.userId),function(err, player){

            player.remove(function(err){

                if(err) console.log(err);

                var player = new models.Player();
                player.user = user;
                player.addACL(user._id,true,true);

                user.player = player;

                //save user
                user.save( common.userId('MASTER'),function(err){

                    if(err){
                        console.log(err);
                        if(err.code == 11000){
                            res.send({code: 103, error: "Username or Email already registered"});
                        }else{
                            res.send(err);
                        }


                    }else{

                        //save player
                        player.save(common.userId('MASTER'),function(err){

                            if(err){
                                console.log(err);
                                res.send(err);
                            }else{
                                clearCookies(res);

                                req.session.userId = user._id;

                                res.send(true);
                            }

                        });

                    }

                });

            });
        });







        //player.enemies = [];

        //player.enemies.remove();

//        player.enemies.forEach( function (enemy) {
//            console.log("ENEMY: " + enemy.name);
//            enemy.remove();
//        });

//        var i;
//        for(i = 0; i < player.enemies.length; i++){
//            console.log("ENEMY: " + player.enemies[0].name);
//            player.enemies[0].remove();
//        }

//        u.each(player.enemies, function(enemy){
//            console.log("ENEMY: " + enemy.name);
//            enemy.remove();
//        });


//        player.save(common.userId(req.session.userId),function(err){
//
//            if(err) console.log(err);
//
//            res.send('true');
//
//        });

    });

});