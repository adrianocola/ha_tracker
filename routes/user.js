var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../public/scripts/shared/md5.js');
var sha1 = require('../public/scripts/shared/sha1.js');
var u = require('underscore');
var https = require('https');
var http = require('http');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var consts = require('../public/scripts/shared/consts.js');


var ids = undefined;



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

    res.clearCookie('KEEP_LOGGED_HASH');
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
function validateNonce(nonce, next, fn){

    app.redis.get('nonce:' + nonce, function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(value!=null){
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
app.get('/api/nonce', function(req, res, next){

    var nonce = uuid.uuid(10);

    var multi = app.redis.multi();

    multi.set('nonce:' + nonce, '');
    multi.expire('nonce:' + nonce, 60);

    multi.exec(function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        res.send(nonce);

    });

});


app.get('/api/user/logout', common.verifyAuthorization, function(req, res, next){


    if(!req.authorization){
        next(new app.ExpectedError(105, "Not logged"));
        return;
    }


    models.User.findById(req.authorization.userId,{}, common.userId('MASTER'), function(err,user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.UnexpectedError("User is null"));
            return;
        }

        //if is a facebook user, clean facebook access token
        if(user.facebook.userID){

            user.facebook.accessToken = undefined;
            user.facebook.expiresIn = undefined;

            user.save(common.userId('MASTER'),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                if(err) next(new app.UnexpectedError(err));

            });

        }

        if(req.cookies.KEEP_LOGGED_HASH){
            app.redis.del("keeplogged:" + req.cookies.KEEP_LOGGED_HASH);
        }



        clearAuthorization(req,res);

        res.send({});



    });

});


app.get('/api/user/login', function(req,res,next){

    console.log(req.headers['user-agent']);


    //validate nonce
    validateNonce(req.query.nonce, next, function(valid){

        if(!valid){
            clearAuthorization(req,res);
            next(new app.ExpectedError(110,"Invalid Nonce"));
            return;
        }

        //if login request have username and password, tries to login using credentials
        if(!req.query.username || !req.query.password){
            clearAuthorization(req,res);
            next(new app.ExpectedError(109,"Missing Login Credentials"));
            return;
        }

        models.User.findOne({username: req.query.username.toLowerCase()},{}, common.userId('MASTER'), function(err,user){


            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user || req.query.password != md5.hex_md5(user.password + req.query.nonce)){

                clearCookies(res);
                next(new app.ExpectedError(101,"Invalid username or password"));

                return;

            }

            req.generateAuthorization(function(authorization){

                req.authorization.userId = user._id;

                if(req.query.keepLogged){

                    var keep_logged_hash = uuid.uuid(48);

                    var multi = app.redis.multi();

                    multi.set('keeplogged:' + keep_logged_hash, user._id);
                    multi.expire('keeplogged:' + keep_logged_hash, 1209600); //2 weeks = 1209600 s

                    multi.exec(function(err,value){

                        if(err){
                            next(new app.UnexpectedError(err));
                            return;
                        }

                        //2 weeks = 1209600000 ms
                        res.cookie('KEEP_LOGGED_HASH', keep_logged_hash, { maxAge: 1209600000 });


                        var secureUser = user.secure();
                        secureUser._doc.token = req.sessionToken;

                        res.json(secureUser);

                        common.statsMix(req.authorization.userId, 4321,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});

                    });

                }else{
                    clearCookies(res);

                    var secureUser = user.secure();
                    secureUser._doc.token = req.sessionToken;

                    res.json(secureUser);

                    common.statsMix(req.authorization.userId, 4321,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});
                }


            });


        });

    });




});


app.get('/api/user/continue_login', function(req,res,next){

    if(req.authorization){
        models.User.findById(req.authorization.userId,{}, common.userId(req.authorization.userId), function(err,user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user){
                next(new app.ExpectedError(107,"User not exists!"));
                return;
            }

            req.authorization.userId = user._id;

            var secureUser = user.secure();
            secureUser._doc.token = req.sessionToken;

            res.json(secureUser);

            common.statsMix(req.authorization.userId, 4321,1,{type: 'relogin', platform: common.isMobile(req)?"mobile":"web"});

        });

    //user marked option "Keep logged in"
    }else if(req.cookies.KEEP_LOGGED_HASH){

        app.redis.get('keeplogged:' + req.cookies.KEEP_LOGGED_HASH,function(err,value){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(value==null){
                clearAuthorization(req,res);
                next(new app.ExpectedError(106,"Session Expired"));
                return;
            }

            models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                if(!user){
                    clearAuthorization(req,res);
                    next(new app.ExpectedError(107,"User not exists!"));
                    return;
                }


                req.generateAuthorization(function(authorization){

                    req.authorization.userId = user._id;

                    var secureUser = user.secure();
                    secureUser._doc.token = req.sessionToken;

                    res.json(secureUser);

                    common.statsMix(req.authorization.userId, 4321,1,{type: 'relogin', platform: common.isMobile(req)?"mobile":"web"});

                });

            });

        });


    }else{
        clearAuthorization(req,res);
        next(new app.ExpectedError(106,"Session Expired"));
    }

});


app.post("/api/user/signup", function(req, res, next){

    var reqsError = "";

    if(req.body.username == undefined || req.body.username == "") reqsError += "Username is Required. ";
    else if(req.body.username.length < 3) reqsError += "Username must have at least 3 characters. ";
    else if(req.body.username.length > 20) reqsError += "Username cannot have more than 20 characters. ";
    else if(req.body.username.match(/[\<\>!@#\$%^&\*, ]+/i)) reqsError += "Username cannot have white spaces or < > ! @ # $ % ^ & *. ";

    if(req.body.email == undefined || req.body.email == "") reqsError += "E-mail is Required. ";
    else if(!req.body.email.match(/\S+@\S+\.\S+/)) reqsError += "Not a valid e-mail address. ";

    if(req.body.password == undefined || req.body.password == "") reqsError += "Password is Required. ";
    else if(req.body.password.length < 4) reqsError += "Password must have at least 4 characters. ";


    if(reqsError.length > 0){
        next(new app.ExpectedError(107,reqsError));
        return;
    }



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
                next(new app.ExpectedError(103,"Username or Email already registered"));
            }else{
                next(new app.UnexpectedError(err));
            }

            return;

        }

        //save player
        player.save(common.userId('MASTER'),function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            clearCookies(res);

            req.generateAuthorization(function(authorization){

                req.authorization.userId = user._id;

                var secureUser = user.secure();
                secureUser._doc.token = req.sessionToken;

                res.json(secureUser);


                common.statsMix(req.authorization.userId, 4320,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});

            });


        });


    });


});

app.put("/api/user/change_password",common.verifyAuthorization, function(req, res, next){

    validateNonce(req.body.nonce, next, function(valid){

        if(!valid){
            next(new app.ExpectedError(110,"Invalid Nonce"));
            return;
        }

        models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user || req.body.old_password != md5.hex_md5(user.password + req.body.nonce)){
                next(new app.ExpectedError(114,"Wrong current password"));
                return;
            }

            user.password = req.body.new_password;

            user.save(common.userId(req.authorization.userId),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                res.send(true);

            });

        });

    });




});


app.post("/api/user/forgot_password", function(req, res, next){



    models.User.findOne({"email": req.body.email},{}, common.userId('MASTER'), function(err,user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.ExpectedError(111,"Email not registered!"));
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
            multi.expire("resetpw:" + confirmation, 86400); //1 day

            multi.exec(function(err,value){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                //set the user with the confirmation number
                user.reset_password = confirmation;

                user.save(common.userId(user._id),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }


                    //setup e-mail data with unicode symbols
                    var mailOptions = {
                        generateTextFromHTML: true,
                        from: env.secrets.mail_username,
                        to: user.email,
                        subject: "HATracker - Recover Password",
                        //text: "Click the following link to reset your password: http://" + req.headers.host + "/reset_password?confirmation=" + confirmation
                        html: "Hey <b>" + user.username + "</b>," +
                            "<br><br> Forgot your password? Click the link below to reset your password: " +
                            "<br><br> http://" + req.headers.host + "/reset_password?confirmation=" + confirmation +
                            "<br><br><br><br> Please, don't reply to this address. If you have any questions send an e-mail to contat@hatracker.com" +
                            "<br><br> www.hatracker.com"
                    };

                    // send mail with defined transport object
                    smtpTransport.sendMail(mailOptions, function(err, response){

                        if(err){
                            next(new app.UnexpectedError(err));
                            return;
                        }

                        res.send('true');

                    });

                });

            });

        });

    });



});

app.get("/api/user/reset_password_username", function(req, res, next){

    //get user
    app.redis.get("resetpw:" + req.query.confirmation, function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!value){
            next(new app.ExpectedError(112, 'Expired password reset confirmation'));
            return;
        }


        models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user){
                next(new app.UnexpectedError("User is null"));
                return;
            }

            if(!value){
                next(new app.ExpectedError(113, 'Invalid user for password reset'));
                return;
            }

            res.json({username: user.username});

        });

    });

});


app.put("/api/user/reset_password", function(req, res, next){

    if(!req.body.password){
        next(new app.ExpectedError(114, 'Must provide password for password reset'));
        return;
    }

    //get user
    app.redis.get("resetpw:" + req.body.confirmation, function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!value){
            next(new app.ExpectedError(112, 'Expired password reset confirmation'));
            return;
        }

        models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user){
                next(new app.UnexpectedError("User is null"));
                return;
            }

            if(!value){
                next(new app.ExpectedError(413,'Invalid user for password reset'));
                return;
            }

            user.password = req.body.password;
            delete user.reset_password;

            user.save(common.userId(user._id),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                res.send('true');

                //invalidate current change password token
                app.redis.del("resetpw:" + req.body.confirmation);

            });

        });

    });

});


app.get("/api/user/login-facebook", function(req, res, next){

    models.User.findOne({"facebook.userID": req.query.userID},{}, common.userId('MASTER'), function(err,user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        //found existing user
        if(user){
            //if is startup means that the user is logged in facebook and
            //is registered here as a valid
            if(req.query.startup){
                //check if the user is authenticated here (didn't made logoff)
                if(user.facebook.accessToken != req.query.accessToken){
                    next(new app.ExpectedError(109,"Facebook Session Expired or User Logged out from Facebook"));
                    return;
                }

                req.generateAuthorization(function(){

                    req.authorization.userId = user._id;

                    var secureUser = user.secure();
                    secureUser._doc.token = req.sessionToken;

                    res.send(secureUser);

                    common.statsMix(req.authorization.userId, 4321,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});

                });

            //if the user is authenticated in facebook but logged off
            // he can click on facebook button again and login
            }else{

                user.facebook.accessToken = req.query.accessToken;
                user.facebook.expiresIn = req.query.expiresIn;

                user.save(common.userId('MASTER'),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    req.generateAuthorization(function(){

                        req.authorization.userId = user._id;

                        var secureUser = user.secure();
                        secureUser._doc.token = req.sessionToken;

                        res.send(secureUser);

                        common.statsMix(req.authorization.userId, 4321,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});


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
                    next(new app.UnexpectedError(err));
                    return;
                }

                player.save( common.userId('MASTER'),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    req.generateAuthorization(function(){

                        req.authorization.userId = user._id;

                        var secureUser = user.secure();
                        secureUser._doc.token = req.sessionToken;

                        res.send(secureUser);

                        common.statsMix(req.authorization.userId, 4320,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});


                    });

                });


            });
            //user is logged in facebook ,don' have account here but is startup
            //so I can' create an account here.
        }else{
            clearAuthorization(req,res);
            next(new app.ExpectedError(108, "Facebook user not authenticated!"));
        }


    });

});


app.delete('/api/user/delete',common.verifyAuthorization, function(req, res, next){


    models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.UnexpectedError("User is null"));
            return;
        }

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
                    console.log('Removed from Facebook: ' + chunk);
                });
            });
            request.end();

        }

        user.remove(function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            clearAuthorization(req,res);

            res.send('true');

        });

    });

});


app.delete('/api/user/reset',common.verifyAuthorization, function(req, res, next){

    models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.UnexpectedError("User is null"));
            return;
        }


        models.Player.findOne({user: req.authorization.userId},{},common.userId(req.authorization.userId),function(err, player){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!player){
                next(new app.UnexpectedError("Player is null"));
                return;
            }


            player.remove(function(err){

                var player = new models.Player();
                player.user = user;
                player.addACL(user._id,true,true);

                user.player = player;

                //save user
                user.save( common.userId('MASTER'),function(err){

                    if(err){

                        if(err.code == 11000){
                            next(new app.ExpectedError(103,"Username or Email already registered") );
                        }else{
                            next(new app.UnexpectedError(err));
                        }

                        return;

                    }

                    //save player
                    player.save(common.userId('MASTER'),function(err){

                        if(err){
                            next(new app.UnexpectedError(err));
                            return;
                        }

                        clearCookies(res);

                        req.authorization.userId = user._id;

                        res.send(true);


                    });



                });

            });
        });



    });

});



