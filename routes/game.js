var app = require('../app.js');
var models = require('../conf/models.js');
var consts = require('../conf/consts.js');
var u = require('underscore');
var common = require('./common.js');


app.post('/api/enemies/:enemy/games', common.verifySession(function(req, res){

    models.Player.findById(req.session.playerId,{}, common.playerId(req.session.playerId), function(err, player){

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

                playerItemManager.save();

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

                enemyItemManager.save();

                game.enemyItems = enemyItemManager;

            }
        })


        enemy.games.push(game);

        player.save(common.playerId(req.session.playerId),function(err){
            if (!err) res.send(game);
        });

    });

}));


app.delete('/api/enemies/:enemy/games/:id', common.verifySession(function(req, res){

    models.Player.findById(req.session.playerId,{}, common.playerId(req.session.playerId), function(err, player){

        var game = player.enemies.id(req.params.enemy).games.id(req.params.id);

        u.each(game.playerItems, function(itemId){
            models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
        },this);

        u.each(game.enemyItems, function(itemId){
            models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
        },this);


        game.remove();

        player.save(common.playerId(req.session.playerId), function(err){
            if (!err) res.send("OK");
        });


    });

}));