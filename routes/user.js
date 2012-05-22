var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../public/javascripts/vendor/md5.js');
var https = require('https');

function clearCookies(res){

    res.clearCookie('KEEP_LOGGED_USER');
    res.clearCookie('KEEP_LOGGED_ID');

};

function clearSession(req, res){

    req.session.userId = undefined;

    clearCookies(res);

};


app.get('/api/user/logout', function(req, res){

    if(req.session.userId){

        models.User.findById(req.session.userId,{}, common.userId('MASTER'), function(err,user){

            //if is a facebook user, clean facebook access token
            if(user.facebook.userID){
                user.facebook.accessToken = undefined;
                user.facebook.expiresIn = undefined;

                user.save(common.userId('MASTER'),function(err){});

            }

            req.session.userId = undefined;
            res.clearCookie('KEEP_LOGGED_USER');
            res.clearCookie('KEEP_LOGGED_ID');

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

            if(user && req.query.password == md5.hex_md5(user.password + req.session.uuid)){
                req.session.userId = user._id;

                if(req.query.keepLogged){

                    var keepLogged = new models.KeepLogged();

                    keepLogged.usernameHash = md5.hex_md5(env.salt + user.username + env.salt);
                    keepLogged.iserId = user._id;


                    keepLogged.save(common.userId('MASTER'),function(err){

                        if(err) console.log(err);

                        console.log("KEEP_LOGGED");
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
        //session is alive, user just closed the browser or refreshed the page
        if(req.session.userId){
            console.log("TENTOU LOGIN POR SESSAO");
            models.User.findById(req.session.userId,{}, common.userId(req.session.userId), function(err,user){
                res.send(user.secure());
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
    }

});


app.post("/api/user/signup", function(req, res){

    if(!req.body.username || !req.body.password || !req.body.email){
        res.send({code: 107, error: "Missing username, email or password"});
    } else{



        var user = new models.User();

        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.player = player;

        //add ACL to user and player
        user.addACL(user._id,true,true);

        var player = new models.Player();
        player._id = user._id;
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
                        res.send({code: 106, error: "Session Expired"});
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

                user.facebook = {};

                user.facebook.userID = req.query.userID;
                user.facebook.accessToken = req.query.accessToken;
                user.facebook.expiresIn = req.query.expiresIn;
                user.addACL(user._id,true,true);

                var player = new models.Player();
                player._id = user._id;
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


app.delete('/api/user/delete',function(req, res){


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

            req.session.userId = undefined;
            res.clearCookie('KEEP_LOGGED_USER');
            res.clearCookie('KEEP_LOGGED_ID');

            res.send('true');

        });




    });


});