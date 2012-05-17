var app = require('../app.js');
var models = require('../conf/models.js');
var u = require('underscore');
var common = require('./common.js');


app.post('/api/enemies', common.verifySession(function(req,res){

    models.Player.findById(req.session.playerId, {},common.playerId(req.session.playerId), function(err, player){

        if(err) console.log(err);

        //update position of all enemies
        u.each(player.enemies,function(enemy){
            enemy.position+=1;
            console.log("POSITION: " + enemy.position);
        });


        player.save(common.playerId(req.session.playerId),function(err){

            if(err) console.log(err);

            var enemy = new models.Enemy(req.body);
            enemy.position = 0;

            player.enemies.push(enemy);

            player.save(common.playerId(req.session.playerId),function(err){

                if(err) console.log(err);

                res.send(enemy);

            });

        });





    });
}));

app.delete('/api/enemies/:id', common.verifySession(function(req, res){

    models.Player.findById(req.session.playerId,{},common.playerId(req.session.playerId), function(err, player){

        var enemy = player.enemies.id(req.params.id);

        u.each(enemy.games, function(game){

            models.ItemManager.remove({_id: game.playerItems},function(err){ if(err) console.log(err);});

            models.ItemManager.remove({_id: game.enemyItems},function(err){ if(err) console.log(err);});

        },this);

        enemy.remove();

        player.save(common.playerId(req.session.playerId),function(err){
            if (!err) res.send("OK");

            //update positions of remaining enemies
            u.each(player.enemies,function(loop_enemy){
                if(loop_enemy.position > enemy.position){
                    loop_enemy.position -=1;
                }
            });

            player.save(common.playerId(req.session.playerId),function(err){});

        });








    });

}));