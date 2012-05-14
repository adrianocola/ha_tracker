var app = require('../app.js');
var models = require('../conf/models.js');
var consts = require('../conf/consts.js');
var u = require('underscore');
var common = require('./common.js');


app.get('/api/itemmanager/:id/items', common.verifySession(function(req, res){

    models.ItemManager.findById(req.params.id,{}, common.playerId(req.session.playerId), function(err,itemManager){

        var items = [];

        u.each(itemManager.items,function(item){

            var returnItem = u.clone(consts.Items[item.itemId]);
            returnItem.itemCount = item.itemCount;
            returnItem._id = item._id;

            items.push(returnItem);

        });

        res.send(items);


    });


}));




app.put('/api/itemmanager/:manager/items/:id', common.verifySession(function(req, res){

    models.ItemManager.findById(req.params.manager,{}, common.playerId(req.session.playerId), function(err, itemManager){

        var item = itemManager.items.id(req.params.id);

        item.itemCount = req.body.itemCount;

        itemManager.save(common.playerId(req.session.playerId), function(err){
            res.send(item);
        });

    });
}));

