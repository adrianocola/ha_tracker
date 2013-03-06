var app = require('../app.js');
var models = require('../conf/models.js');
var consts = require('../public/scripts/shared/consts.js');
var u = require('underscore');
var common = require('./common.js');


app.get('/api/itemmanager/:id/items', common.verifyAuthorization,function(req, res, next){

    models.ItemManager.findById(req.params.id,{}, common.userId(req.authorization.userId), function(err,itemManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!itemManager){
            next(new app.UnexpectedError("ItemManager is null"));
            return;
        }

        res.send({data: itemManager.items});


    });


});


app.put('/api/itemmanager/:manager/items/:id', common.verifyAuthorization, function(req, res, next){

    if(req.body.itemCount==undefined){
        next(new app.ExpectedError(212,"Missing itemCount to update the item"));
        return;
    }

    models.ItemManager.findById(req.params.manager,{}, common.userId(req.authorization.userId), function(err, itemManager){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!itemManager){
            next(new app.UnexpectedError("ItemManager is null"));
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

            //common.statsMix(req.authorization.userId, 4322,1,{item: consts.Items[item.itemId].itemName});
        });

    });
});

