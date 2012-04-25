var app = require('../app.js');
var models = require('../models.js');
var consts = require('../consts.js');
var u = require('underscore');

app.get('/api/items/:id', function(req, res){

    models.Item.findOne({_id: req.params.id}, function(err, item){

        var itemFound = undefined;

        if(!itemFound){
            u.each(consts.Council.items,function(baseItem){
                item.itemName == baseItem.itemName ? itemFound = baseItem : "";
            });
        }
        if(!itemFound){
            u.each(consts.DarkElves.items,function(baseItem){
                item.itemName == baseItem.itemName ? itemFound = baseItem : "";
            });
        }
        if(!itemFound){
            u.each(consts.Dwarves.items,function(baseItem){
                item.itemName == baseItem.itemName ? itemFound = baseItem : "";
            });
        }
        if(!itemFound){
            u.each(consts.Tribe.items,function(baseItem){
                item.itemName == baseItem.itemName ? itemFound = baseItem : "";
            });
        }

        //console.log("item: " + item);
        //console.log("itemFound: " + itemFound);

        var returnItem = {};
        returnItem.itemImg = itemFound.itemImg;
        returnItem.itemName = itemFound.itemName;
        returnItem.itemCountMax = itemFound.itemCountMax;
        returnItem.itemCount = item.itemCount;


        res.send(returnItem);

    });

});

app.put('/api/items/:id', function(req, res){

    models.Item.findOne({_id: req.params.id}, function(err, item){

        item.itemCount = req.body.itemCount;

        item.save(function(err){
            res.send(item);
        });

    });
});
