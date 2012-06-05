var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var crypto = require('crypto');



exports.title = "authorization";

//redis.on("error", function (err) {
//    console.log("Redis Error " + err);
//});

var Authorization = function Authorization(req, data) {
    Object.defineProperty(this, 'req', { value: req });
    if(req.sessionToken){
        Object.defineProperty(this, 'id', { value: req.sessionToken });
    }
    if ('object' == typeof data){
        if (this && data) {
            for (var key in data) {
                this[key] = data[key];
            }
        }
    }
};

Authorization.prototype.touch = function(){
    return this.resetMaxAge();
};

Authorization.prototype.resetMaxAge = function(){
    this.cookie.maxAge = this.cookie.originalMaxAge;
    return this;
};

Authorization.prototype.save = function(fn){
    this.req.sessionStore.set(this.id, this, fn || function(){});
    return this;
};

Authorization.prototype.reload = function(fn){
    var req = this.req
        , store = this.req.sessionStore;
    store.get(this.id, function(err, sess){
        if (err) return fn(err);
        if (!sess) return fn(new Error('failed to load authorization'));
        store.createSession(req, sess);
        fn();
    });
    return this;
};

Authorization.prototype.destroy = function(fn){
    delete this.req.authorization;
    this.req.sessionStore.destroy(this.id, fn);
    return this;
};

Authorization.prototype.regenerate = function(fn){
    this.req.sessionStore.regenerate(this.req, fn);
    return this;
};


var pause = function(obj){
    var onData
        , onEnd
        , events = [];

    // buffer data
    obj.on('data', onData = function(data, encoding){
        events.push(['data', data, encoding]);
    });

    // buffer end
    obj.on('end', onEnd = function(data, encoding){
        events.push(['end', data, encoding]);
    });

    return {
        end: function(){
            obj.removeListener('data', onData);
            obj.removeListener('end', onEnd);
        },
        resume: function(){
            this.end();
            for (var i = 0, len = events.length; i < len; ++i) {
                obj.emit.apply(obj, events[i]);
            }
        }
    };
};


exports = module.exports = function(options){

    var key = options.key || 'connect.sid';
    var cookie = options.cookie || { path: '/', httpOnly: true, maxAge: 14400000 };

    //require the store
    if(!options || !options.store){
        throw new Error('missing store');
    }



    cookie.originalMaxAge = cookie.maxAge;

    var store = options.store;



    return function authsession(req, res, next) {

        // self-awareness
        if (req.authorization) return next();

        // ensure secret is available or bail
        if (!req.secret) throw new Error('connect.cookieParser("secret") required for security when using sessions');

        // expose store
        req.sessionStore = store;


        // set-cookie
        res.on('header', function(){

            if(!req.authorization) return;

            //always set the cookie, to update the TTL of the cookie
            res.cookie('X-HATracker-Token',req.sessionToken,req.authorization.cookie);

        });



        req.generateAuthorization = function(fn){

            crypto.randomBytes(48, function(ex, buf) {
                req.sessionToken = buf.toString('hex');

                req.authorization = new Authorization(req);
                //req.authorization.cookie = {originalMaxAge: 7200000, maxAge: 7200000};
                req.authorization.cookie = cookie;

                fn(req.authorization);

            });

        };


        // proxy end() to commit the authorization
        var end = res.end;
        res.end = function(data, encoding){
            res.end = end;
            //if there was no authorization, don' save
            if (!req.authorization) return res.end(data, encoding);

            //console.log('saving');
            req.authorization.resetMaxAge();
            req.authorization.save(function(err){
                res.end(data, encoding);
            });
        };

        // get the sessionToken from the header
        req.sessionToken = req.header('X-HATracker-Token');

        if(!req.sessionToken){
            //if not found in the header, thy the cookie
            req.sessionToken = req.cookies['X-HATracker-Token'];
        }

        // check if there is a authorization.
        if (!req.sessionToken) {

            next();

            //if the request is made without the token header don't create the authorization and return
            return;
        }


        var paused = pause(req);
        // get authorization data from storage and generate the authorization object
        store.get(req.sessionToken, function(err, sess){
            // proxy to resume() events
            var _next = next;
            next = function(err){
                _next(err);
                paused.resume();
            }

            // error handling
            if (err) {
                //debug('error');
                console.log('GET SESSION ERROR');
                if ('ENOENT' == err.code) {
                    next();
                } else {
                    next(err);
                }
            // no authorization
            } else if (!sess) {
                //console.log('no authorization found');
                next();
            // populate req.authorization
            } else {
                //console.log('authorization found');

                req.authorization = new Authorization(req,sess);

                //store.createSession(req, sess);
                next();
            }
        });
    };

};