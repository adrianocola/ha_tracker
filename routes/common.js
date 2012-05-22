var app = require('../app.js');
var models = require('../conf/models.js');


exports.userId = function(id){
    return {userId: id};
}


exports.verifySession = function(cb){

    return function(req, res){

        //if have session, player is authenticated
        if(req.session.userId){
            cb(req,res);
        }else{
            res.send({code: 100, error: 'Not authorized'});
            console.log({code: 100, error: 'Not authorized'});
        }

    }



};


