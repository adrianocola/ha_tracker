var app = require('../app.js');
var models = require('../conf/models.js');
var u = require('underscore');
var common = require('./common.js');


app.post('/api/enemies', common.verifyAuthorization, function(req,res, next){

    if(!req.body.name){
        next(new app.ExpectedError(202,"Must provide enemy name for enemy creation"));
        return;
    }

    if(req.body.name.length > 20){
        next(new app.ExpectedError(203,"Enemy name with more than 20 characters"));
        return;
    }


    models.Player.findOne({user: req.authorization.userId}, {}, function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!player){
            next(new app.UnexpectedError("Player is null"));
            return;
        }

        //first verify if there is an enemy with the same name
        var foundEnemy = u.find(player.enemies, function(enemy){ return enemy.name.toLowerCase() == req.body.name.toLowerCase(); });


        if(foundEnemy){
            next(new app.ExpectedError(201,"Enemy already exists"));
            return;
        }


        //update position of all enemies
        u.each(player.enemies,function(enemy){
            enemy.position+=1;
        });

        var enemy = new models.Enemy(req.body);
        enemy.position = 0;

        player.enemies.push(enemy);

        player.save(function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(player.enemies.id(enemy._id));

        });


    });
});


app.put('/api/enemies/:id', common.verifyAuthorization, function(req,res, next){

    if(!req.body.name){
        next(new app.ExpectedError(204,"Must provide enemy name for enemy update"));
        return;
    }


    if(req.body.name.length > 20){
        next(new app.ExpectedError(203,"Enemy name with more than 20 characters"));
        return;
    }

    models.Player.findOne({user: req.authorization.userId}, {}, function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!player){
            next(new app.UnexpectedError("Player is null"));
            return;
        }

        //first verify if there is an enemy with the same name
        var foundEnemy = u.find(player.enemies, function(enemy){ return enemy.name.toLowerCase() == req.body.name.toLowerCase(); });

        if(foundEnemy){
            next(new app.ExpectedError(201,"Enemy already exists"));
            return;
        }

        var enemy = player.enemies.id(req.params.id);
        enemy.name = req.body.name;

        player.save(function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(enemy);

        });


    });
});


app.delete('/api/enemies/:id', common.verifyAuthorization, function(req, res, next){

    models.Player.findOne({user: req.authorization.userId},{}, function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!player){
            next(new app.UnexpectedError("Player is null"));
            return;
        }

        var enemy = player.enemies.id(req.params.id);

        if(!enemy){
            next(new app.UnexpectedError("Enemy is null"));
            return;
        }

        var itemsIdsArray = [];
        var notesIdsArray = [];

        //search for games items and game notes inside of each game
        u.each(enemy.games,function(game){
            itemsIdsArray.push({_id: game.playerItems});
            itemsIdsArray.push({_id: game.enemyItems});

            notesIdsArray.push({_id: game.gameNotes});
        });

        //remove game items
        models.ItemManager.where().or(itemsIdsArray).remove();

        //delete game notes
        models.GameNoteManager.where().or(notesIdsArray).remove();

        enemy.remove();

        //update positions of remaining enemies
        u.each(player.enemies,function(loop_enemy){
            if(loop_enemy.position > enemy.position){
                loop_enemy.position -=1;
            }
        });

        player.save(function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send('true');
        });

    });

});