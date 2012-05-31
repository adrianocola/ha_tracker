var app = require('../app.js');
var models = require('../conf/models.js');
var common = require('./common.js');


app.get('/api/players/:id', common.verifyAuthorization ,function(req, res){

    console.log(req.params.id);

    models.Player.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err, player){

        if(err) console.log(err);

        res.send(player);


    });
});