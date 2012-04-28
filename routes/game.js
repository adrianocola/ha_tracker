var app = require('../app.js');
var models = require('../models.js');
var consts = require('../consts.js');
var u = require('underscore');

app.get('/api/enemies/:enemy/games', function(req, res){

    models.Player.findById(req.session.playerId, function(err, player){

        var enemy = player.enemies.id(req.params.enemy);

        res.send(enemy.games);

    });

});


app.post('/api/enemies/:enemy/games', function(req, res){

    models.Player.findById(req.session.playerId, function(err, player){

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

        player.save(function(err){
            if (!err) res.send(game);
        });

    });

});


app.delete('/api/enemies/:enemy/games/:id', function(req, res){

    models.Player.findById(req.session.playerId, function(err, player){

        var game = player.enemies.id(req.params.enemy).games.id(req.params.id);

        u.each(game.playerItems, function(itemId){
            models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
        },this);

        u.each(game.enemyItems, function(itemId){
            models.Item.remove({_id: itemId},function(err){ if(err) console.log(err);});
        },this);


        game.remove();

        player.save(function(err){
            if (!err) res.send("OK");
        });


    });

});