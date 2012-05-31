var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../api/md5.js');
var sha1 = require('../api/sha1.js');
var u = require('underscore');
var https = require('https');
var http = require('http');
var nodemailer = require('nodemailer');
var crypto = require('crypto');


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    host : "smtp.gmail.com",
    port : "465",
    secureConnection: true,
    auth: {
        user: env.secrets.mail_username,
        pass: env.secrets.mail_password
    }
});


function clearCookies(res){

    res.clearCookie('KEEP_LOGGED_USER');
    res.clearCookie('KEEP_LOGGED_ID');
    res.clearCookie('X-HATracker-Token');

};

function clearAuthorization(req, res){

    if(req.authorization){
        req.authorization.destroy();
    }

    clearCookies(res);

};

/**
 * Validate the generated nonce, to make sure the nonce the client
 * passes to the server was the one created on the server
 * @param nonce nonce to validate
 * @param fn return true or false in callback
 */
function validateNonce(nonce, fn){

    app.redis.get('nonce:' + nonce, function(err,value){
        if(!err && value!=null){
            //if the nonce is valid remove it from the valid nonces list, so it
            //cannot be used again to try to relogin
            app.redis.del('nonce:' + nonce,function(){
                fn(true);
            });
        }else{
            fn(false);
        }

    });

}

/**
 * generates a nonce for password cryptography
 * more details: http://en.wikipedia.org/wiki/Cryptographic_nonce
 */
app.get('/api/nonce', function(req, res){

    var nonce = uuid.uuid(10);

    var multi = app.redis.multi();

    multi.set('nonce:' + nonce, '');
    multi.expire('nonce:' + nonce, 60);

    multi.exec(function(err,value){

        if(err) console.log(err);

        res.send(nonce);

    });

    //req.authorization.nonce = uuid.uuid(10);
    //res.send(req.authorization.nonce);

});


app.get('/api/user/logout', common.verifyAuthorization, function(req, res){

    if(req.authorization){

        models.User.findById(req.authorization.userId,{}, common.userId('MASTER'), function(err,user){

            //if is a facebook user, clean facebook access token
            if(user.facebook.userID){
                user.facebook.accessToken = undefined;
                user.facebook.expiresIn = undefined;

                user.save(common.userId('MASTER'),function(err){});

            }

            clearAuthorization(req,res);

            res.send({});



        });

    }else{
        res.json(401, {code: 105, error: "Not logged"});
    }
});

app.get('/api/user/test/:name', function(req,res){

    models.User.findOne({username: req.params.name.toLowerCase()},{}, common.userId('MASTER'), function(err,user){

        if(user){
            res.json(user._doc);
            //res.send(user);
        }else{
            res.json({});
        }

    });

});



app.get('/api/user/login', function(req,res){

    //validate nonce
    validateNonce(req.query.nonce, function(valid){

        if(valid){
            //if login request have username and password, tries to login using credentials
            if(req.query.username && req.query.password){
                console.log("TENTOU LOGIN POR CREDENCIAL: (" + req.query.username + ", " +  req.query.password + ")");
                models.User.findOne({username: req.query.username.toLowerCase()},{}, common.userId('MASTER'), function(err,user){

                    if(err) console.log(err);

                    if(user && req.query.password == md5.hex_md5(user.password + req.query.nonce)){

                        req.generateAuthorization(function(authorization){

                            req.authorization.userId = user._id;

                            if(req.query.keepLogged){
                                var keepLogged = new models.KeepLogged();

                                keepLogged.usernameHash = md5.hex_md5(env.salt + user.username + env.salt);
                                keepLogged.userId = user._id;


                                keepLogged.save(common.userId('MASTER'),function(err){

                                    if(err) console.log(err);

                                    //2 weeks = 1209600000 ms
                                    res.cookie('KEEP_LOGGED_USER', keepLogged.usernameHash, { maxAge: 1209600000 });
                                    res.cookie('KEEP_LOGGED_ID', keepLogged._id.toString(), { maxAge: 1209600000 });

                                    var secureUser = user.secure();
                                    secureUser._doc.token = req.sessionToken;

                                    res.json(secureUser);

                                    common.statsMix(4321,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});

                                });


                            }else{
                                clearCookies(res);

                                var secureUser = user.secure();
                                secureUser._doc.token = req.sessionToken;

                                res.json(secureUser);

                                common.statsMix(4321,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});
                            }


                        });

                    }else{
                        clearCookies(res);
                        res.json(403, {code: 101, error: "Invalid username or password"});
                    }

                });
                //if no credentials were passed in request, tries to login using current authorization
                // or KEEL_LOGGED_IN cookies
            } else{
                clearAuthorization(req,res);
                res.json(400, {code: 109, error: "Missing Login Credentials"});
            }

        }else{
            clearAuthorization(req,res);
            res.json(400, {code: 110, error: "Invalid Nonce"});
        }
    });




});


app.get('/api/user/continue_login', function(req,res){
    console.log(req.cookies);
    if(req.authorization){
        console.log("TENTOU LOGIN POR SESSAO");
        models.User.findById(req.authorization.userId,{}, common.userId(req.authorization.userId), function(err,user){

            if(err){
                console.log(err);
            }

            if(user){

                req.authorization.userId = user._id;

                var secureUser = user.secure();
                secureUser._doc.token = req.sessionToken;

                res.json(secureUser);

                common.statsMix(4321,1,{type: 'relogin', platform: common.isMobile(req)?"mobile":"web"});

            }else{
                res.json(400, {code: 107, error: "User not exists!"});
            }


        });

    //user marked option "Keep logged in"
    }else if(req.cookies.KEEP_LOGGED_USER && req.cookies.KEEP_LOGGED_ID){
        console.log("TENTOU LOGIN POR KEEP LOGGED IN");
        models.KeepLogged.findById(req.cookies.KEEP_LOGGED_ID,{},common.userId('MASTER'),function(err,keepLogged){

            if(err) console.log(err);

            if(keepLogged){

                models.User.findById(keepLogged.userId,{}, common.userId('MASTER'), function(err,user){

                    if(err) console.log(err);

                    if(user){

                        //2 weeks = 1209600000 ms
                        res.cookie('KEEP_LOGGED_USER', req.cookies.KEEP_LOGGED_USER, { maxAge: 1209600000 });
                        res.cookie('KEEP_LOGGED_ID', req.cookies.KEEP_LOGGED_ID, { maxAge: 1209600000 });


                        req.generateAuthorization(function(authorization){

                            req.authorization.userId = user._id;

                            var secureUser = user.secure();
                            secureUser._doc.token = req.sessionToken;

                            res.json(secureUser);

                            common.statsMix(4321,1,{type: 'relogin', platform: common.isMobile(req)?"mobile":"web"});


                        });


                    }else{
                        clearAuthorization(req,res);
                        res.json(400, {code: 107, error: "User not exists!"});
                    }
                });

            }else{
                clearAuthorization(req,res);
                res.json(401, {code: 106, error: "Session Expired"});

            }


        })

    }else{
        clearAuthorization(req,res);
        res.json(401, {code: 106, error: "Session Expired"});
    }




});


app.post("/api/user/signup", function(req, res){


    if(!req.body.username || !req.body.password || !req.body.email){
        res.json(400, {code: 107, error: "Missing username, email or password"});
    } else{



        var user = new models.User();
        var player = new models.Player();

        user.username = req.body.username.toLowerCase();
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
                    res.json(409, {code: 103, error: "Username or Email already registered"});
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

                        req.generateAuthorization(function(authorization){

                            req.authorization.userId = user._id;

                            var secureUser = user.secure();
                            secureUser._doc.token = req.sessionToken;

                            res.json(secureUser);


                            common.statsMix(4320,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});

                        });

                    }

                });

            }

        });

    }
});

app.get("/api/user/confirm", function(req, res){

//    criar algum token pra confirmar o e-mail
//    manter nas setting um botão pra resend do email de confirmação.
//    ou não implementar isso e que se dane o usuário!
});

app.post("/api/user/forgot_password", function(req, res){

    models.User.findOne({"email": req.body.email},{}, common.userId('MASTER'), function(err,user){

        if(err) console.log(err);

        if(!user){
            res.json(401, {code: 111, error: "Email not registered!"});

            return;
        }

        crypto.randomBytes(24, function(ex, buf) {
            var confirmation = buf.toString('hex');

            var multi = app.redis.multi();

            //if any previous reset password request has made first invalidate it
            if(user.reset_password){
                multi.del("resetpw:" + user.reset_password);
            }

            multi.set("resetpw:" + confirmation, user._id);
            multi.expire("resetpw:" + confirmation, 86400);

            multi.exec(function(err,value){

                if(err) console.log(err);

                //set the user with the confirmation number
                user.reset_password = confirmation;

                user.save(common.userId(user._id),function(err){

                    //setup e-mail data with unicode symbols
                    var mailOptions = {
                        from: env.secrets.mail_username,
                        to: user.email,
                        subject: "HATracker - Recover Password",
                        text: "Link: http://" + req.headers.host + "/reset_password?confirmation=" + confirmation
                        //html: "<b>Hello world</b>"
                    };

                    // send mail with defined transport object
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                        }else{
                            console.log("Message sent: " + response.message);
                        }

                    });


                    res.send('true');


                });





            });



        });




    });



});

app.get("/api/user/reset_password_username", function(req, res){

    //get user
    app.redis.get("resetpw:" + req.query.confirmation, function(err,value){

        if(err) console.log(err);

        if(!value){
            res.json(401,{code: 412, error: 'Expired password reset confirmation'});
            return;
        }


        models.User.findById(value,{}, common.userId('MASTER'), function(err,user){



            if(err) console.log(err);

            if(!value){
                res.json(401,{code: 413, error: 'Invalid user for password reset'});
                return;
            }

            res.json({username: user.username});

        });



    });



});


app.put("/api/user/reset_password", function(req, res){

    if(!req.body.password){
        res.json(401,{code: 414, error: 'Must provide password for password reset'});
        return;
    }


    //get user
    app.redis.get("resetpw:" + req.body.confirmation, function(err,value){

        if(err) console.log(err);

        if(!value){
            res.json(401,{code: 412, error: 'Expired password reset confirmation'});
            return;
        }


        models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

            if(err) console.log(err);

            if(!value){
                res.json(401,{code: 413, error: 'Invalid user for password reset'});
                return;
            }

            user.password = req.body.password;
            delete user.reset_password;



            user.save(common.userId(user._id),function(err){

                if(err) console.log(err);

                res.send('true');

                //invalidate current change password token
                app.redis.del("resetpw:" + req.body.confirmation);

            });



        });



    });


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

                        req.generateAuthorization(function(){

                            req.authorization.userId = user._id;

                            var secureUser = user.secure();
                            secureUser._doc.token = req.sessionToken;

                            res.send(secureUser);

                            common.statsMix(4321,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});

                        });

                    }else{
                        res.json(401, {code: 109, error: "Facebook Session Expired or User Logged out"});
                    }

                //if the user is authenticated in facebook but logged off
                // he can click on facebook button again and login
                }else{

                    user.facebook.accessToken = req.query.accessToken;
                    user.facebook.expiresIn = req.query.expiresIn;

                    user.save(common.userId('MASTER'),function(){

                        if(err) console.log(err);

                        req.generateAuthorization(function(){

                            req.authorization.userId = user._id;

                            var secureUser = user.secure();
                            secureUser._doc.token = req.sessionToken;

                            res.send(secureUser);

                            common.statsMix(4321,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});


                        });

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

                                req.generateAuthorization(function(){

                                    req.authorization.userId = user._id;

                                    var secureUser = user.secure();
                                    secureUser._doc.token = req.sessionToken;

                                    res.send(secureUser);

                                    common.statsMix(4320,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});


                                });

                            }

                        });
                    }

                });
                //user is logged in facebook ,don' have account here but is startup
                //so I can' create an account here.
            }else{
                clearAuthorization(req,res);
                res.json(401, {code: 108, error: "Facebook user not authenticated!"});
            }
        }




    });

});


app.delete('/api/user/delete',common.verifyAuthorization, function(req, res){


    models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

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

            clearAuthorization(req,res);

            res.send('true');

        });

    });

});


app.delete('/api/user/reset',common.verifyAuthorization, function(req, res){




    models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

        if(err) console.log(err);


        models.Player.findOne({user: req.authorization.userId},{},common.userId(req.authorization.userId),function(err, player){

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
                            res.json(400,{code: 103, error: "Username or Email already registered"});
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

                                req.authorization.userId = user._id;

                                res.send(true);
                            }

                        });

                    }

                });

            });
        });



    });

});