
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');
  //, RedisStore = require('connect-redis')(express);

// faz com que o retorno desse arquivo no método require seja a variável app
// isso permitirá outros arquivos manipular app (ex: adicionar rotas)
var app = module.exports = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser("nome muito secreto da sessão"));
  //app.use(express.session({ secret: "nome muito secreto da sessão", store: new RedisStore }));
  app.use(express.session({ secret: "nome muito secreto da sessão"}));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

models = require('./models');

[   'index',
    'player',
    'enemy',
    'game',
    'item'
].forEach(function(route) {
    require('./routes/' + route);
});

//mongoose.connect('mongodb://heroku_app3124648:2bi7klje534eo9uimtf1k44mai@ds031407.mongolab.com:31407/heroku_app3124648');

http.createServer(app).listen(3000);

console.log("Express server listening on port 3000");
