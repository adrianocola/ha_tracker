var app = require('../app.js');
var models = require('../conf/models.js');
var consts = require('../public/scripts/shared/consts.js');
var u = require('underscore');
var common = require('./common.js');


app.post('/api/enemies/:enemy/games', common.verifyAuthorization, function(req, res, next){

    if(!req.body.playerRace || !req.body.enemyRace){
        next(new app.ExpectedError(206,"Missing player race or enemy race to create a new game"));
        return;
    }

    var raceNames = u.pluck(consts.Races,'raceName');

    if(!u.include(raceNames,req.body.playerRace) || !u.include(raceNames,req.body.enemyRace)){
        next(new app.ExpectedError(209,"Invalid player race or enemy race. Valid values are: " + raceNames));
        return;
    }


    models.Player.findOne({user: req.authorization.userId},{}, common.userId(req.authorization.userId), function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        var enemy = player.enemies.id(req.params.enemy);
        enemy.gameCount+=1;

        var game = new models.Game(req.body);
        game.num = enemy.gameCount;

        //create player's items
        u.each(consts.Races,function(race){
            if(game.playerRace === race.raceName){

                var playerItemManager = new models.ItemManager();

                u.each(race.items, function(baseItemId){
                    var baseItem = consts.Items[baseItemId];

                    var item = new models.Item({itemId: baseItemId, itemCount: baseItem.itemCountMax});

                    playerItemManager.items.push(item);

                },this);

                playerItemManager.addACL(req.authorization.userId,true,true);

                playerItemManager.save(common.userId(req.authorization.userId),function(err){
                    if(err) console.log(err);
                });

                game.playerItems = playerItemManager;
            }
        })

        //create enemy's items
        u.each(consts.Races,function(race){
            if(game.enemyRace === race.raceName){

                var enemyItemManager = new models.ItemManager();

                u.each(race.items, function(baseItemId){
                    var baseItem = consts.Items[baseItemId];

                    var item = new models.Item({itemId: baseItemId, itemCount: baseItem.itemCountMax});

                    enemyItemManager.items.push(item);

                },this);

                enemyItemManager.addACL(req.authorization.userId,true,true);

                enemyItemManager.save(common.userId(req.authorization.userId),function(err){
                    if(err) console.log(err);
                });

                game.enemyItems = enemyItemManager;

            }
        })

        enemy.games.push(game);

        player.save(common.userId(req.authorization.userId),function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(game);
        });

    });

});

app.put('/api/enemies/:enemy/games/:id', common.verifyAuthorization, function(req, res, next){

    if(req.body.state==undefined){
        next(new app.ExpectedError(207,"Missing state to update the game"));
        return;
    }

    if(!consts.States[req.body.state]){
        next(new app.ExpectedError(208,"Invalid game state. Valid values are: " + JSON.stringify(u.keys(consts.States))));
        return;
    }

    models.Player.findOne({user: req.authorization.userId},{}, common.userId(req.authorization.userId), function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        var game = player.enemies.id(req.params.enemy).games.id(req.params.id);

        game.state = req.body.state;

        player.save(common.userId(req.authorization.userId), function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send("true");
        });


    });


});


app.delete('/api/enemies/:enemy/games/:id', common.verifyAuthorization, function(req, res, next){

    models.Player.findOne({user: req.authorization.userId},{}, common.userId(req.authorization.userId), function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        var game = player.enemies.id(req.params.enemy).games.id(req.params.id);

        u.each(game.playerItems, function(itemId){
            models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
        },this);

        u.each(game.enemyItems, function(itemId){
            models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
        },this);


        game.remove();

        player.save(common.userId(req.authorization.userId), function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send("true");
        });


    });

});

