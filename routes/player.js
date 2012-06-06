var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifyAuthorization ,function(req, res, next){

    models.Player.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err, player){

        if(err) console.log(err);

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