var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifyAuthorization ,function(req, res, next){

    models.Player.findById(req.params.id,{},  function(err, player){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!player){
            next(new app.UnexpectedError("Player is null"));
            return;
        }

        res.send(player);


    });
});


app.put('/api/players/:id', common.verifyAuthorization ,function(req, res, next){

    if(req.body.showState==undefined && req.body.showOnlyActive==undefined
        && req.body.showItemsAsList==undefined && req.body.percentageType==undefined){
        next(new app.ExpectedError(210,"Missing showState, showOnlyActive, showItemsAsList or percentageType values"));
        return;
    }


    models.Player.findById(req.params.id,{},  function(err, player){

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

        if(req.body.showItemsAsList!=undefined){
            player.showItemsAsList = req.body.showItemsAsList;
        }

        if(req.body.percentageType!=undefined){
            player.percentageType = req.body.percentageType;
        }


        player.save(function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(true);

        });

    });
});