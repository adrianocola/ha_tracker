var app = require('../app.js');
var models = require('../conf/models.js');

app.get('/', function(req, res){
    models.Player.findOne({}, function (err, doc){

        req.session.playerId = undefined;

        if(!doc){
            var player = new models.Player();
            player.name = "Player";

            player.save(function(err){
                res.render('index', { title: "HA Tracker", username: player.name });
            });


        }else{
            res.render('index', { title: "HA Tracker", username: doc.name });
        }


    });
});



app.get('/api/login',function(req,res){

    console.log(new Date().getTime());

    app.parse.login(req.query.username,req.query.password, function(err, user){

        req.session.token = user.sessionToken;
        req.session.userId = user.objectId;

        res.send(user);
    });

});

app.get('/api/signup',function(req,res){

    app.parse.createUser(req.query.username, req.query.password, req.query.email, {}, function(err, user){

        res.send(user);

        var ACL = {};
        ACL[user.objectId] = {
            read: true,
            write: true
        }

        req.session.token = user.sessionToken;
        req.session.userId = user.objectId;

        app.parse.updateUser(user.objectId, {ACL:ACL, enemies: []}, user.sessionToken);


//        app.parse.insertObject('Player', {ACL: ACL} , user.sessionToken ,function(err,player){
//
//            console.log("CREATED PLAYER: " + JSON.stringify(player));
//
//            user.player = {"__type":"Pointer","className":"Player","objectId":player.objectId};
//
//            app.parse.updateUser(user.objectId, {player:user.player}, user.sessionToken, function(err,msg){
//
//                console.log("UPDATE USER: " + JSON.stringify(msg));
//
//                res.send(user);
//
//            });
//
//
//
//        });

    })



});

app.get('/teste',function(req,res){

//    app.parse.findObject('Player','ufjv3eXT4c', '4po8we335b31b2ruvp09cpvpy' ,function(err,player){
//        if(err) console.log("ERR: " + err);
//        console.log("PLAYER: " + JSON.stringify(player));
//
//        res.send(player);
//    });

        app.parse.findObject('_User','EXiVSdqhL1', 'q6b4y3dndmeicioxbs6salmu3' ,function(err,player){
        if(err) console.log("ERR: " + err);
        console.log("PLAYER: " + JSON.stringify(player));

        res.send(player);
    });




});