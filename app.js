var express = require('express')
  , http = require('http')
  , env = require('./conf/env')
  , authorization = require('./routes/authorization')
  , RedisStore = require('connect-redis')(express);

// faz com que o retorno desse arquivo no método require seja a variável app
// isso permitirá outros arquivos manipular app (ex: adicionar rotas)
var app = module.exports = express();
//var app = module.exports = express.createServer();


app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(env.secrets.session));



});

app.configure('development', function(){

    //app.use(express.session({ secret: "very secret name", cookie: { path: '/', httpOnly: true, maxAge: 60000 }}));
    //app.use(express.session({ secret: env.secrets.session, store: new RedisStore(), cookie: { path: '/', httpOnly: true, maxAge: 5000 } }));
    app.use(authorization({store: new RedisStore(), cookie: { maxAge: 5000 }}));

    app.use(app.router);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});


app.configure('production', function(){

    rtg = require("url").parse(env.redis_url);
    redis_url = env.redis_url;
    app.use(express.session({
        secret: env.secrets.session,
        store: new RedisStore({
            port: rtg.port,
            host: rtg.hostname,
            pass: rtg.auth?rtg.auth.split(":")[1]:''
        }),
        cookie: {
            maxAge: 7200000
        }
    }));


    app.use(app.router);
    app.use(express.errorHandler());

});

models = require('./conf/models');

[   'index',
    'user',
    'player',
    'enemy',
    'game',
    'item'
].forEach(function(route) {
    require('./routes/' + route);
});

http.createServer(app).listen(env.port);
//app.listen(env.port);


console.log("Express server listening on port " + env.port);
