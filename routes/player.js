var app = require('../app.js');
var models = require('../conf/models.js');


app.get('/api/players/:name', function(req, res){



    models.Player.findOne({name: req.params.name}, function(err, doc){

        req.session.playerId = doc._id;

        res.send(doc);


    });
});

