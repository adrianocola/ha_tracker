var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifyAuthorization ,function(req, res, next){

    models.Player.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!player){
            next(new app.UnexpectedError("Player is null"));
            return;
        }

        u.each(player.enemies,function(enemy){
            u.each(enemy.games,function(game){
                //create game notes

                if(!game.gameNotes){
                    var gameNotes = new models.GameNoteManager();
                    gameNotes.addACL(user._id,true,true);

                    gameNotes.save(common.userId(user._id),function(err){
                        if(err) console.log(err);
                    });

                    game.gameNotes = gameNotes;

                }

            });
        });

        player.save(common.userId(user._id),function(err){
            if(err) console.log(err);

            cont++;

            if(cont >= users.length){
                res.send('true');
            }

        });


        res.send(player);


    });
});


app.put('/api/players/:id', common.verifyAuthorization ,function(req, res, next){

    if(req.body.showState==undefined && req.body.showOnlyActive==undefined){
        next(new app.ExpectedError(210,"Missing showState or showOnlyActive values"));
        return;
    }


    models.Player.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!player){
            next(new app.UnexpectedError("Player is null"));
            return;
        }

        if(req.body.showOnlyActive!=undefined){
            player.showOnlyActive = req.body.showOnlyActive;
        }

        if(req.body.showState!=undefined){
            player.showState = req.body.showState;
        }


        player.save(common.userId(req.authorization.userId),function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(true);

        });

    });
});