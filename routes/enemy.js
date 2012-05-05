var app = require('../app.js');
var models = require('../conf/models.js');
var u = require('underscore');
var generator = require('../api/uuid.js');


app.post('/api/enemies', function(req, res){


    app.parse.findUser(req.session.userId,req.session.token,function(err,user){

        req.body.objectId = generator.uuid(10);


        user.enemies = user.enemies || [];

        user.enemies.splice(0,0,req.body)

        app.parse.updateUser(req.session.userId,{enemies: user.enemies},req.session.token,function(err,user){

            res.send(req.body);

        });



    });


});

app.delete('/api/enemies/:id', function(req, res){

    app.parse.findUser(req.session.userId,req.session.token,function(err,user){

        var enemy = u.find(user.enemies,function(enemy){return enemy.objectId == req.params.id});

        user.enemies = user.enemies || [];

        user.enemies.splice(0,0,req.body)

        app.parse.updateUser(req.session.userId,{enemies: user.enemies},req.session.token,function(err,user){

            res.send(req.body);

        });



    });



//    models.Player.findOne({_id: req.session.playerId}, function(err, player){
//
//        var enemy = player.enemies.id(req.params.id);
//
//        u.each(enemy.games, function(game){
//
//            models.ItemManager.remove({_id: game.playerItems},function(err){ if(err) console.log(err);});
//
//            models.ItemManager.remove({_id: game.enemyItems},function(err){ if(err) console.log(err);});
//
//        },this);
//
//        enemy.remove();
//
//        player.save(function(err){
//            if (!err) res.send("OK");
//        });
//
//
//    });

});