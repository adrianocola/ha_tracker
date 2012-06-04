var app = require('../app.js');
var models = require('../conf/models.js');
var consts = require('../conf/consts.js');
var u = require('underscore');
var common = require('./common.js');


app.get('/api/itemmanager/:id/items', common.verifyAuthorization,function(req, res, next){

    models.ItemManager.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err,itemManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

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




app.put('/api/itemmanager/:manager/items/:id', common.verifyAuthorization, function(req, res, next){

    models.ItemManager.findById(req.params.manager,{}, common.userId(req.authorization.userId), function(err, itemManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        var item = itemManager.items.id(req.params.id);

        item.itemCount = req.body.itemCount;

        itemManager.save(common.userId(req.authorization.userId), function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(item);

            common.statsMix(4322,1,{item: consts.Items[item.itemId].itemName});
        });

    });
});

