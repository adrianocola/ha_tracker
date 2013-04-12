var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var consts = require('../public/scripts/shared/consts.js');
var u = require('underscore');


app.get('/api/random', function(req, res, next){

    models.User.findById(env.secrets.test_user_id,{},function(err, user){


        models.Player.findById(user.player,{},  function(err, player){

            var random = Math.floor((Math.random()*100)+1);

            if(random<1){

                //update position of all enemies
                u.each(player.enemies,function(enemy){
                    enemy.position+=1;
                });

                var enemy = new models.Enemy({name: "enemy"+ uuid.uuid(10)});
                enemy.position = 0;

                player.enemies.push(enemy);

                player.save(function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    res.send(enemy);

                });

                //create a new game
            }else{
                var enemyIndex = -1;
                if(player.enemies.length == 0){
                    res.send('No enemies yet!');
                    return;
                }else if(player.enemies.length == 1){
                    enemyIndex = 0;
                }else{
                    enemyIndex = Math.floor((Math.random()*1000000)+1)%player.enemies.length;
                }

                var enemy = player.enemies[enemyIndex];

                var game = new models.Game({
                    playerRace: consts.Races[(Math.floor((Math.random()*100)+1)%4)].raceName,
                    enemyRace: consts.Races[(Math.floor((Math.random()*100)+1)%4)].raceName,
                    state: (Math.floor((Math.random()*100)+1)%9)
                });

                //create game notes
                var gameNotes = new models.GameNoteManager();
                gameNotes.addACL(env.secrets.test_user_id,true,true);

                gameNotes.save(function(err){
                    if(err) console.log(err);
                });

                game.gameNotes = gameNotes;

                //create player's items
                u.each(consts.Races,function(race){
                    if(game.playerRace === race.raceName){

                        var playerItemManager = new models.ItemManager();

                        u.each(race.items, function(baseItemId){
                            var baseItem = consts.Items[baseItemId];

                            var item = new models.Item({itemId: baseItemId, itemCount: baseItem.itemCountMax});

                            playerItemManager.items.push(item);

                        },this);

                        playerItemManager.addACL(env.secrets.test_user_id,true,true);

                        playerItemManager.save(function(err){
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

                        enemyItemManager.addACL(env.secrets.test_user_id,true,true);

                        enemyItemManager.save(function(err){
                            if(err) console.log(err);
                        });

                        game.enemyItems = enemyItemManager;

                    }
                })

                enemy.gameCount+=1;

                game.num = enemy.gameCount;

                enemy.games.push(game);


                player.save(function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    res.send(game);

                });

            }
            //creates a new enemy



        });

    });

});


app.get('/api/prepare-random-item2', function(req, res, next){

    models.User.findById(env.secrets.test_user_id,{},function(err, user){


        models.Player.findById(user.player,{},  function(err, player){


            ids = [];

            u.each(player.enemies, function(enemy){
                u.each(enemy.games,function(game){
                    ids.push(game.playerItems);
                    ids.push(game.enemyItems);
                });

            });

            res.send(ids);

        });

    });


});


app.get('/api/random-item2', function(req, res, next){

    var itemIdIndex = Math.floor((Math.random()*1000000)+1)%ids.length;

    var itemId = ids[itemIdIndex];

    models.ItemManager.findById(itemId,{},  function(err, itemManager){

        var itemIndex = Math.floor((Math.random()*1000000)+1)%itemManager.items.length;

        var item = itemManager.items[itemIndex];

        item.itemCount = item.itemCount == 0 ? 1 : 0;

        itemManager.save( function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(item);

        });

    });

});




app.get('/api/random-item', function(req, res, next){

    models.User.findById(env.secrets.test_user_id,{},function(err, user){


        models.Player.findById(user.player,{},  function(err, player){


            var enemyIndex = -1;
            if(player.enemies.length == 0){
                res.send('No enemies yet!');
                return;
            }else if(player.enemies.length == 1){
                enemyIndex = 0;
            }else{
                enemyIndex = Math.floor((Math.random()*1000000)+1)%player.enemies.length;
            }



            var enemy = player.enemies[enemyIndex];

            var gameIndex = -1;
            if(enemy.games.length == 0){
                res.send('No Games yet!');
                return;
            }else if(enemy.games.length == 1){
                gameIndex = 0;
            }else{
                gameIndex = Math.floor((Math.random()*1000000)+1)%enemy.games.length;
            }



            var game = enemy.games[gameIndex];

            var random = Math.floor((Math.random()*100)+1);

            var itemsId = -1;

            if(random<=50){
                itemsId = game.playerItems;
            }else{
                itemsId = game.enemyItems;
            }

            models.ItemManager.findById(itemsId,{},  function(err, itemManager){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                if(!itemManager){
                    next(new app.UnexpectedError("ItemManager is null"));
                    return;
                }

                var itemIndex = Math.floor((Math.random()*1000000)+1)%itemManager.items.length;

                var item = itemManager.items[itemIndex];

                item.itemCount = item.itemCount == 0 ? 1 : 0;

                itemManager.save( function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    res.send(item);

                });

            });





        });

    });

});




app.get('/api/notesCount',function(req, res, next){

    models.GameNoteManager.find({},{},  function(err,noteManagers){

        var qtd = 0;

        u.each(noteManagers,function(noteManager){
            qtd += noteManager.notes.length;
        });

        res.send({count: qtd});


    });


});

