var app = require('../app.js');
var models = require('../models.js');
var consts = require('../consts.js');
var u = require('underscore');


app.get('/api/itemmanager/:id/items', function(req, res){

    models.ItemManager.findById(req.params.id,function(err,itemManager){

        var items = [];

        u.each(itemManager.items,function(item){

            var returnItem = u.clone(consts.Items[item.itemId]);
            returnItem.itemCount = item.itemCount;
            returnItem._id = item._id;

            items.push(returnItem);

        });

        res.send(items);


    });


});




app.put('/api/itemmanager/:manager/items/:id', function(req, res){

    models.ItemManager.findById(req.params.manager, function(err, itemManager){

        var item = itemManager.items.id(req.params.id);

        item.itemCount = req.body.itemCount;

        itemManager.save(function(err){
            res.send(item);
        });

    });
});

