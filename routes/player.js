var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifySession(function(req, res){

    models.Player.findById(req.params.id,{}, common.userId(req.session.userId), function(err, player){

        if(err) console.log(err);

        res.send(player);


    });
}));