var app = require('../app.js');
var models = require('../conf/models.js');
var consts = require('../public/scripts/shared/consts.js');
var u = require('underscore');
var common = require('./common.js');
var env = require('../conf/env.js');


app.get('/api/gamenotemanager/:id/notes', common.verifyAuthorization,function(req, res, next){

    models.GameNoteManager.findById(req.params.id,{},  function(err,gameNoteManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!gameNoteManager){
            next(new app.UnexpectedError("GameNoteManager is null"));
            return;
        }

        res.send({data: gameNoteManager.notes});


    });


});


app.post('/api/gamenotemanager/:manager/notes', common.verifyAuthorization, function(req, res, next){

    if(req.body.note==undefined){
        next(new app.ExpectedError(213,"Missing note to create a GameNote"));
        return;
    }

    models.GameNoteManager.findById(req.params.manager,{},  function(err, gameNoteManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!gameNoteManager){
            next(new app.UnexpectedError("GameNoteManager is null"));
            return;
        }

        var note = new models.GameNote({note: req.body.note});
        note.createdAt = new Date();

        gameNoteManager.notes.push(note);

        gameNoteManager.save( function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }
            res.send(gameNoteManager.notes.id(note._id));

        });

    });
});


//app.put('/api/gamenotemanager/:manager/notes/:id', common.verifyAuthorization, function(req, res, next){
//
//    if(req.body.note==undefined){
//        next(new app.ExpectedError(214,"Missing note to update the GameNote"));
//        return;
//    }
//
//    models.GameNoteManager.findById(req.params.manager,{},  function(err, gameNoteManager){
//
//        if(err){
//            next(new app.UnexpectedError(err));
//            return;
//        }
//
//        if(!gameNoteManager){
//            next(new app.UnexpectedError("GameNoteManager is null"));
//            return;
//        }
//
//        var note = gameNoteManager.notes.id(req.params.id);
//
//        note.note = req.body.note;
//
//        gameNoteManager.save( function(err){
//
//            if(err){
//                next(new app.UnexpectedError(err));
//                return;
//            }
//
//            res.send(note);
//
//        });
//
//    });
//});

app.delete('/api/gamenotemanager/:manager/notes/:id', common.verifyAuthorization, function(req, res, next){


    models.GameNoteManager.findById(req.params.manager,{},  function(err, gameNoteManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!gameNoteManager){
            next(new app.UnexpectedError("GameNoteManager is null"));
            return;
        }

        var note = gameNoteManager.notes.id(req.params.id);

        note.remove();

        gameNoteManager.save( function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send('true');

        });

    });



});

