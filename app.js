
if(process.env.NODEFLY_APPLICATION_KEY){
    require('nodefly').profile(
        process.env.NODEFLY_APPLICATION_KEY,
        ['HATracker','Heroku']
    );
}




var express = require('express')
  , http = require('http')
  , env = require('./conf/env')
  , authorization = require('./routes/authorization')
  , RedisStore = require('connect-redis')(express)
  , redis = require('redis-url').connect(env.redis_url);

// faz com que o retorno desse arquivo no método require seja a variável app
// isso permitirá outros arquivos manipular app (ex: adicionar rotas)
var app = module.exports = express();
//var app = module.exports = express.createServer();

//expose redis
app.redis = redis;

app.ExpectedError = function(code, error){
    this.code = code;
    this.error = error;
    Error.call(this, error);
    Error.captureStackTrace(this, arguments.callee);
}

app.ExpectedError.prototype.__proto__ = Error.prototype;

app.UnexpectedError = function(error){
    this.error = error;
    Error.call(this, error);
    Error.captureStackTrace(this, arguments.callee);
}

app.UnexpectedError.prototype.__proto__ = Error.prototype;


var errorsHandler = function(err, req, res, next){
    if (err instanceof app.ExpectedError) {
        console.log("EXPECTED ERROR: " + err.code + " - " + err.error);
        res.json(400,{code: err.code, error: err.error});
    }else if (err instanceof app.UnexpectedError) {
        console.log("UNEXPECTED ERROR: " + err.error);
        console.log(err.stack);
        res.json(500,{code: -1, error: "Unexpected Error: " + err.error});
    } else {
        next(err);
    }
}

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');


    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/public-cached', { maxAge: 2592000000 }));
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(env.secrets.session));



    //formats the json output with 3 spaces of identation
    //app.set('json spaces',3);


});

app.configure('development', function(){

    //app.use(express.session({ secret: "very secret name", cookie: { path: '/', httpOnly: true, maxAge: 60000 }}));
    //app.use(express.session({ secret: env.secrets.session, store: new RedisStore(), cookie: { path: '/', httpOnly: true, maxAge: 300000 } }));
    app.use(authorization({ secret: env.secrets.session, store: new RedisStore(), cookie: { maxAge: 300000 }}));

    app.use(express.logger('dev'));
    app.use(express.favicon('/public/favicon-dev.ico'));
    app.use(app.router);

    app.use(errorsHandler);

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});


app.configure('production', function(){

    rtg = require("url").parse(env.redis_url);
    redis_url = env.redis_url;

//    app.use(express.session({
//        secret: env.secrets.session,
//        store: new RedisStore({
//            port: rtg.port,
//            host: rtg.hostname,
//            pass: rtg.auth?rtg.auth.split(":")[1]:''
//        }),
//        cookie: {
//            maxAge: 7200000
//        }
//    }));



    app.use(authorization({
            secret: env.secrets.session,
            store: new RedisStore({
                port: rtg.port,
                host: rtg.hostname,
                pass: rtg.auth?rtg.auth.split(":")[1]:''
            }),
            cookie: { maxAge: 86400000 }})); // 1 day


    app.use(express.favicon('/public/favicon.ico'));
    app.use(app.router);


    app.use(errorsHandler);

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    //app.use(express.errorHandler());

});


models = require('./conf/models');

[   'index',
    'user',
    'player',
    'enemy',
    'game',
    'item',
    'gamenote',
    'test',
    'analysis'
].forEach(function(route) {
    require('./routes/' + route);
});

http.createServer(app).listen(env.port);
//app.listen(env.port);


console.log("Express server listening on port " + env.port);

