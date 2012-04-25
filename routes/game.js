var app = require('../app.js');
var models = require('../models.js');
var consts = require('../consts.js');
var u = require('underscore');

app.get('/api/enemies/:enemy/games', function(req, res){

    models.Player.findOne({_id: req.session.playerId}, function(err, player){

        var enemy = player.enemies.id(req.params.enemy);

        res.send(enemy.games);

    });

});

app.get('/api/games/:id', function(req, res){

    models.Game.findOne({_id: req.params.id}, function(err, doc){
        res.send(doc);
    });
});

app.post('/api/enemies/:enemy/games', function(req, res){

    models.Player.findOne({_id: req.session.playerId}, function(err, player){

        var enemy = player.enemies.id(req.params.enemy);

        var game = new models.Game(req.body);

        var baseRace = undefined;

        console.log("PLAYER: " + game.playerRace);
        console.log("ENEMY: " + game.enemyRace);

        switch(game.playerRace){
            case "Council": baseRace = consts.Council;
                break;
            case "Dark Elves": baseRace = consts.DarkElves;
                break;
            case "Dwarves": baseRace = consts.Dwarves;
                break;
            case "Tribe": baseRace = consts.Tribe;
                break;
        }

        u.each(baseRace.items, function(baseItem){
            var item = new models.Item({itemName: baseItem.itemName, itemCount: baseItem.itemCountMax});
            game.playerItems.push(item);
            item.save();
        },this);


        switch(game.enemyRace){
            case "Council": baseRace = consts.Council;
                break;
            case "Dark Elves": baseRace = consts.DarkElves;
                break;
            case "Dwarves": baseRace = consts.Dwarves;
                break;
            case "Tribe": baseRace = consts.Tribe;
                break;
        }

        u.each(baseRace.items, function(baseItem){
            var item = new models.Item({itemName: baseItem.itemName, itemCount: baseItem.itemCountMax});
            game.enemyItems.push(item);
            item.save();
        },this);


        enemy.games.splice(0,0,game);

        player.save(function(err){
            console.log(err);
            if (!err) res.send(game);
        });

    });

});

app.delete('/api/enemies/:enemy/games/:id', function(req, res){

    models.Player.findOne({_id: req.session.playerId}, function(err, player){

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