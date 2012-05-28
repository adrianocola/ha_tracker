var app = require('../app.js');
var models = require('../conf/models.js');
var u = require('underscore');
var common = require('./common.js');


app.post('/api/enemies', common.verifyAuthorization, function(req,res){

    models.Player.findOne({user: req.authorization.userId}, {},common.userId(req.authorization.userId), function(err, player){



        if(err) console.log(err);

        //first verify if there is an enemy with the same name
        var foundEnemy = u.find(player.enemies, function(enemy){ return enemy.name.toLowerCase() == req.body.name.toLowerCase(); });

        if(foundEnemy){
            res.send({code: 201, error: "Enemy already exists"});
            return;
        }


        //update position of all enemies
        u.each(player.enemies,function(enemy){
            enemy.position+=1;
        });

        var enemy = new models.Enemy(req.body);
        enemy.position = 0;

        player.enemies.push(enemy);

        player.save(common.userId(req.authorization.userId),function(err){

            if(err) console.log(err);

            res.send(enemy);

        });


    });
});


app.put('/api/enemies/:id', common.verifyAuthorization, function(req,res){

    models.Player.findOne({user: req.authorization.userId}, {},common.userId(req.authorization.userId), function(err, player){

        if(err) console.log(err);

        var enemy = player.enemies.id(req.params.id);
        enemy.name = req.body.name;

        player.save(common.userId(req.authorization.userId),function(err){

            if(err) console.log(err);

            res.send(enemy);

        });


    });
});


app.delete('/api/enemies/:id', common.verifyAuthorization, function(req, res){

    models.Player.findOne({user: req.authorization.userId},{},common.userId(req.authorization.userId), function(err, player){

        if(err) console.log(err);

        var enemy = player.enemies.id(req.params.id);

        u.each(enemy.games, function(game){

            models.ItemManager.remove({_id: game.playerItems},function(err){ if(err) console.log(err);});

            models.ItemManager.remove({_id: game.enemyItems},function(err){ if(err) console.log(err);});

        },this);

        enemy.remove();

        //update positions of remaining enemies
        u.each(player.enemies,function(loop_enemy){
            if(loop_enemy.position > enemy.position){
                loop_enemy.position -=1;
            }
        });

        player.save(common.userId(req.authorization.userId),function(err){
            res.send('true');
        });

    });

});