var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifySession(function(req, res){

    models.Player.findById(req.params.id,{}, common.userId(req.session.userId), function(err, player){

        if(err) console.log(err);

        res.send(player);


    });
}));


app.put('/api/players/:id', common.verifySession(function(req, res){

    models.Player.findById(req.params.id,{}, common.userId(req.session.userId), function(err, player){

        if(err) console.log(err);

        if(req.body.reset){
            player.enemies = [];

            player.save(common.userId(req.session.userId),function(err){

                if(err) console.log(err);

                res.send(player);

            });


        }else{
            res.send(player);
        }


    });
}));