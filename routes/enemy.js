var app = require('../app.js');
var models = require('../conf/models.js');
var u = require('underscore');
var common = require('./common.js');


//app.get('/api/enemies', function(req, res){
//    models.Player.findOne({_id: req.session.playerId},function(err, doc){
//        res.send(doc.enemies);
//    });
//
//});



//app.get('/api/enemies/:id', function(req, res){
//
//    models.Enemy.findOne({_id: req.params.id}, function(err, doc){
//        res.send(doc);
//    });
//
//});

app.post('/api/enemies', common.verifySession(function(req,res){

    models.Player.findById(req.session.playerId, {},common.playerId(req.session.playerId), function(err, doc){

        if(err) console.log(err);

        var enemy = new models.Enemy(req.body);
        //enemy._id = req.body.name;

        doc.enemies.splice(0,0,enemy);

        doc.save(common.playerId(req.session.playerId),function(err){

            if(err) console.log(err);

            res.send(enemy);
        });

    });
}));

app.delete('/api/enemies/:id', common.verifySession(function(req, res){

    models.Player.findById(req.session.playerId,{},common.playerId(req.session.playerId), function(err, player){

        var enemy = player.enemies.id(req.params.id);

        u.each(enemy.games, function(game){

            models.ItemManager.remove({_id: game.playerItems},function(err){ if(err) console.log(err);});

            models.ItemManager.remove({_id: game.enemyItems},function(err){ if(err) console.log(err);});

//            u.each(game.playerItems, function(itemId){
//
//            },this);
//
//            u.each(game.enemyItems, function(itemId){
//
//            },this);
        },this);

        enemy.remove();

        player.save(common.playerId(req.session.playerId),function(err){
            if (!err) res.send("OK");
        });


    });

}));