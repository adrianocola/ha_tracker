var app = require('../app.js');
var models = require('../conf/models.js');
var u = require('underscore');
var env = require('../conf/env.js');
var common = require('./common.js');


function performAnalysis(req, res, next){

    models.Player.find({},{}, common.userId('MASTER'), function(err, players){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!players){
            next(new app.UnexpectedError("Players is null"));
            return;
        }

        var stats = {
            date: new Date(),
            players: 0,
            enemies: 0,
            enemies_per_player: 0,
            games: 0,
            games_per_enemy: 0,
            ratio: 0,
            inProgress: 0,
            wins:{
                total: 0,
                crystal: 0,
                heroes: 0,
                surrender: 0,
                timeout: 0
            },
            losses:{
                total: 0,
                crystal: 0,
                heroes: 0,
                surrender: 0,
                timeout: 0
            },
            council:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0,
                tf2_wins: 0,
                tf2_losses: 0,
                tf2_ratio: 0
            },
            darkelves:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0,
                tf2_wins: 0,
                tf2_losses: 0,
                tf2_ratio: 0
            },
            dwarves:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0,
                tf2_wins: 0,
                tf2_losses: 0,
                tf2_ratio: 0
            },
            tribe:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0,
                tf2_wins: 0,
                tf2_losses: 0,
                tf2_ratio: 0
            },
            tf2:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0,
                tf2_wins: 0,
                tf2_losses: 0,
                tf2_ratio: 0
            }


        };


        u.each(players, function(player){
            if(player._id == env.secrets.test_player_id){
                return;
            }
            stats.players++;

            u.each(player.enemies, function(enemy){
                stats.enemies++;

                u.each(enemy.games, function(game){
                    stats.games++;

                    var gameState = game.state;


                    if(gameState==0){
                        stats.inProgress = stats.inProgress + 1;
                        return;
                    }

                    switch(gameState){
                        case 1: stats.wins.crystal = stats.wins.crystal + 1;
                            break;
                        case 2: stats.wins.heroes = stats.wins.heroes + 1;
                            break;
                        case 3: stats.wins.surrender = stats.wins.surrender + 1;
                            break;
                        case 4: stats.wins.timeout = stats.wins.timeout + 1;
                            break;
                        case 5: stats.losses.crystal = stats.losses.crystal + 1;
                            break;
                        case 6: stats.losses.heroes = stats.losses.heroes + 1;
                            break;
                        case 7: stats.losses.surrender = stats.losses.surrender + 1;
                            break;
                        case 8: stats.losses.timeout = stats.losses.timeout + 1;
                            break;
                    }

                    var playerRace = "";
                    var enemyRace = "";

                    switch(game.playerRace){
                        case 'Council': playerRace = "council";
                            break;
                        case 'Dark Elves': playerRace = "darkelves";
                            break;
                        case 'Dwarves': playerRace = "dwarves";
                            break;
                        case 'Tribe': playerRace = "tribe";
                            break;
                        case 'TF2': playerRace = "tf2";
                            break;
                    }


                    switch(game.enemyRace){
                        case 'Council': enemyRace = "council";
                            break;
                        case 'Dark Elves': enemyRace = "darkelves";
                            break;
                        case 'Dwarves': enemyRace = "dwarves";
                            break;
                        case 'Tribe': enemyRace = "tribe";
                            break;
                        case 'TF2': enemyRace = "tf2";
                            break;
                    }


                    var win_or_lost = "";

                    if(gameState==1 || gameState==2 || gameState==3 || gameState==4){
                        stats.wins.total = stats.wins.total + 1;
                        stats[playerRace].wins += 1;

                        win_or_lost = "_wins";

                    }else if(gameState==5 || gameState==6 || gameState==7 || gameState==8){
                        stats.losses.total = stats.losses.total + 1;
                        stats[playerRace].losses += 1;

                        win_or_lost = "_losses";
                    }

                    stats[playerRace][enemyRace + win_or_lost] += 1;


                });
            });
        });


        stats.enemies_per_player = ( stats.players / stats.enemies )  || 0;
        stats.games_per_enemy = ( stats.enemies / stats.games )  || 0;


        stats.ratio = stats.wins.total / (stats.wins.total + stats.losses.total) * 100 || 0;

        stats.council.ratio = stats.council.wins / (stats.council.wins + stats.council.losses) * 100 || 0;
        stats.council.council_ratio = stats.council.council_wins / (stats.council.council_wins + stats.council.council_losses) * 100 || 0;
        stats.council.darkelves_ratio = stats.council.darkelves_wins / (stats.council.darkelves_wins + stats.council.darkelves_losses) * 100 || 0;
        stats.council.dwarves_ratio = stats.council.dwarves_wins / (stats.council.dwarves_wins + stats.council.dwarves_losses) * 100 || 0;
        stats.council.tribe_ratio = stats.council.tribe_wins / (stats.council.tribe_wins + stats.council.tribe_losses) * 100 || 0;
        stats.council.tf2_ratio = stats.council.tf2_wins / (stats.council.tf2_wins + stats.council.tf2_losses) * 100 || 0;

        stats.darkelves.ratio = stats.darkelves.wins / (stats.darkelves.wins + stats.darkelves.losses) * 100 || 0;
        stats.darkelves.council_ratio = stats.darkelves.council_wins / (stats.darkelves.council_wins + stats.darkelves.council_losses) * 100 || 0;
        stats.darkelves.darkelves_ratio = stats.darkelves.darkelves_wins / (stats.darkelves.darkelves_wins + stats.darkelves.darkelves_losses) * 100 || 0;
        stats.darkelves.dwarves_ratio = stats.darkelves.dwarves_wins / (stats.darkelves.dwarves_wins + stats.darkelves.dwarves_losses) * 100 || 0;
        stats.darkelves.tribe_ratio = stats.darkelves.tribe_wins / (stats.darkelves.tribe_wins + stats.darkelves.tribe_losses) * 100 || 0;
        stats.darkelves.tf2_ratio = stats.darkelves.tf2_wins / (stats.darkelves.tf2_wins + stats.darkelves.tf2_losses) * 100 || 0;

        stats.dwarves.ratio = stats.dwarves.wins / (stats.dwarves.wins + stats.dwarves.losses) * 100 || 0;
        stats.dwarves.council_ratio = stats.dwarves.council_wins / (stats.dwarves.council_wins + stats.dwarves.council_losses) * 100 || 0;
        stats.dwarves.darkelves_ratio = stats.dwarves.darkelves_wins / (stats.dwarves.darkelves_wins + stats.dwarves.darkelves_losses) * 100 || 0;
        stats.dwarves.dwarves_ratio = stats.dwarves.dwarves_wins / (stats.dwarves.dwarves_wins + stats.dwarves.dwarves_losses) * 100 || 0;
        stats.dwarves.tribe_ratio = stats.dwarves.tribe_wins / (stats.dwarves.tribe_wins + stats.dwarves.tribe_losses) * 100 || 0;
        stats.dwarves.tf2_ratio = stats.dwarves.tf2_wins / (stats.dwarves.tf2_wins + stats.dwarves.tf2_losses) * 100 || 0;

        stats.tribe.ratio = stats.tribe.wins / (stats.tribe.wins + stats.tribe.losses) * 100 || 0;
        stats.tribe.council_ratio = stats.tribe.council_wins / (stats.tribe.council_wins + stats.tribe.council_losses) * 100 || 0;
        stats.tribe.darkelves_ratio = stats.tribe.darkelves_wins / (stats.tribe.darkelves_wins + stats.tribe.darkelves_losses) * 100 || 0;
        stats.tribe.dwarves_ratio = stats.tribe.dwarves_wins / (stats.tribe.dwarves_wins + stats.tribe.dwarves_losses) * 100 || 0;
        stats.tribe.tribe_ratio = stats.tribe.tribe_wins / (stats.tribe.tribe_wins + stats.tribe.tribe_losses) * 100 || 0;
        stats.tribe.tf2_ratio = stats.tribe.tf2_wins / (stats.tribe.tf2_wins + stats.tribe.tf2_losses) * 100 || 0;

        stats.tf2.ratio = stats.tf2.wins / (stats.tf2.wins + stats.tf2.losses) * 100 || 0;
        stats.tf2.council_ratio = stats.tf2.council_wins / (stats.tf2.council_wins + stats.tf2.council_losses) * 100 || 0;
        stats.tf2.darkelves_ratio = stats.tf2.darkelves_wins / (stats.tf2.darkelves_wins + stats.tf2.darkelves_losses) * 100 || 0;
        stats.tf2.dwarves_ratio = stats.tf2.dwarves_wins / (stats.tf2.dwarves_wins + stats.tf2.dwarves_losses) * 100 || 0;
        stats.tf2.tribe_ratio = stats.tf2.tribe_wins / (stats.tf2.tribe_wins + stats.tf2.tribe_losses) * 100 || 0;
        stats.tf2.tf2_ratio = stats.tf2.tf2_wins / (stats.tf2.tf2_wins + stats.tf2.tf2_losses) * 100 || 0;

        var multi = app.redis.multi();

        multi.set('analysis', JSON.stringify(stats));
        multi.expire('analysis', 600);

        multi.exec(function(err,value){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(stats);

        });




    });

}

app.get('/api/analysis',function(req, res, next){

    //check if there is an analysis in the last 1hour
    app.redis.get('analysis', function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(value!=null){
            //return to the the client the current analysis
            res.send(JSON.parse(value));
        }else{
            //must perform new analysis
            performAnalysis(req,res,next);
        }

    });

});