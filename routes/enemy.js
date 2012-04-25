var app = require('../app.js');
var models = require('../models.js');
var u = require('underscore');


app.get('/api/enemies', function(req, res){
    models.Player.findOne({_id: req.session.playerId},function(err, doc){
        res.send(doc.enemies);
    });

});



app.get('/api/enemies/:id', function(req, res){

    models.Enemy.findOne({_id: req.params.id}, function(err, doc){
        res.send(doc);
    });
});

app.post('/api/enemies', function(req, res){

    models.Player.findOne({_id: req.session.playerId}, function(err, doc){

        var enemy = new models.Enemy(req.body);

        doc.enemies.splice(0,0,enemy);

        doc.save(function(err){
            if (!err) res.send(enemy);
        });

    });
});

app.delete('/api/enemies/:id', function(req, res){

    models.Player.findOne({_id: req.session.playerId}, function(err, player){

        var enemy = player.enemies.id(req.params.id);

        u.each(enemy.games, function(game){
            u.each(game.playerItems, function(itemId){
                models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
            },this);

            u.each(game.enemyItems, function(itemId){
                models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
            },this);
        },this);

        enemy.remove();

        player.save(function(err){
            if (!err) res.send("OK");
        });


    });

});