var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var crypto = require('crypto');
var redis = require('redis-url').connect(env.redis_url);


exports.title = "mysession";

redis.on("error", function (err) {
    console.log("Redis Error " + err);
});

var Session = function Session(req, data) {
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

Session.prototype.generate = function(fn){
    var that = this;

    crypto.randomBytes(48, function(ex, buf) {
        that.req.sessionToken = buf.toString('hex');

        Object.defineProperty(that, 'id', { value: that.req.sessionToken });

        that.cookie = {originalMaxAge: 7200000, maxAge: 7200000};

        that.save(fn);

    });

};

Session.prototype.touch = function(){
    return this.resetMaxAge();
};

Session.prototype.resetMaxAge = function(){
    this.cookie.maxAge = this.cookie.originalMaxAge;
    return this;
};

Session.prototype.save = function(fn){
    this.req.sessionStore.set(this.id, this, fn || function(){});
    return this;
};

Session.prototype.reload = function(fn){
    var req = this.req
        , store = this.req.sessionStore;
    store.get(this.id, function(err, sess){
        if (err) return fn(err);
        if (!sess) return fn(new Error('failed to load session'));
        store.createSession(req, sess);
        fn();
    });
    return this;
};

Session.prototype.destroy = function(fn){
    delete this.req.session;
    this.req.sessionStore.destroy(this.id, fn);
    return this;
};

Session.prototype.regenerate = function(fn){
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

    //require the store
    if(!options || !options.store){
        throw new Error('missing store');
    }

    var store = options.store;


    return function authsession(req, res, next) {
        // self-awareness
        if (req.session) return next();

        // expose store
        req.sessionStore = store;

        req.generateSession = function(fn){

            crypto.randomBytes(48, function(ex, buf) {
                req.sessionToken = buf.toString('hex');

                req.session = new Session(req);
                req.session.cookie = {originalMaxAge: 7200000, maxAge: 7200000};

                fn(req.session);

            });

        };

        // proxy end() to commit the session
        var end = res.end;
        res.end = function(data, encoding){
            res.end = end;
            //if there was no session, don' save
            if (!req.session) return res.end(data, encoding);

            console.log('saving');
            req.session.resetMaxAge();
            req.session.save(function(err){
                console.log('saved: ' + err);

                res.end(data, encoding);
            });
        };

        // get the sessionToken from the cookie
        req.sessionToken = req.header('ha-tracker-token');

        // check if there is a session.
        if (!req.sessionToken) {

            next();

            //if the request is made without the token header don't create the session and return
            return;
        }


        var paused = pause(req);
        // get session data from storage and generate the session object
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
            // no session
            } else if (!sess) {
                console.log('no session found');
                next();
            // populate req.session
            } else {
                console.log('session found');
                console.log(sess)

                req.session = new Session(req,sess);

                //store.createSession(req, sess);
                next();
            }
        });
    };

};