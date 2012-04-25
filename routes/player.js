var app = require('../app.js');
var models = require('../models.js');


app.get('/api/players/:id', function(req, res){

    models.Player.findOne({_id: req.params.id}, function(err, doc){

        req.session.playerId = doc._id;

        res.send(doc);


    });
});

app.put('/api/players/:id',function(req, res){
    models.Player.findOne({_id: req.params.id}, function(err, doc){


        doc.name = req.body.name;

        doc.save();

        res.send('OK');
    });
});
