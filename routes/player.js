var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifyAuthorization ,function(req, res){

    models.Player.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err, player){

        if(err) console.log(err);

        res.send(player);


    });
});


app.put('/api/players/:id', common.verifyAuthorization ,function(req, res){

    models.Player.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err, player){

        if(err) console.log(err);

        if(req.body.showOnlyActive!=undefined){
            player.showOnlyActive = req.body.showOnlyActive;
        }

        if(req.body.showState!=undefined){
            player.showState = req.body.showState;
        }


        player.save(common.userId(req.authorization.userId),function(err){

            if(err) console.log(err);

            res.send(true);

        });

    });
});