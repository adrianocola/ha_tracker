var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    u = require('underscore'),
    env = require('./env.js');

//Mongoose plugin to support ACL object access security
var ACL_Plugin = function(schema, options) {

    //add the field ACL to all schemas
    schema.add({ ACL: {} });

    //ACL save middleware, executed when a model saves. Checks if the current
    //request can save the current object
    schema.pre('save', function (next, opt, cb) {

        if(typeof opt == "object" && opt.playerId){

            //if is the master user or the object doesn't have ACL
            if(opt.playerId == 'MASTER' || !this.ACL){
                next(cb);
            }else if((this.ACL['*'] && this.ACL['*'].write) || (this.ACL[opt.playerId] && this.ACL[opt.playerId].write)){
                next(cb);
            }else{
                next(new Error("{code: 102, error: 'Access not granted'}"));
            }

        }else{
            next(new Error("{code: 100, error: 'Missing credentials'}"));
        }


    })

    //ACL init middleware, executed when a model is loaded form the DB. Checks
    // if the current requet can access the object
    schema.pre('init', function(next, obj, opt){

        if(opt.options.playerId){

            //if is the master user or the object doesn't have ACL
            if(opt.options.playerId == 'MASTER' || !obj.ACL){
                next();
            }else if((obj.ACL['*'] && obj.ACL['*'].read) || (obj.ACL[opt.options.playerId] && obj.ACL[opt.options.playerId].read)){
                next();
            }else{
                next(new Error("{code: 102, error: 'Access not granted'}"));
            }

        }else{
            next(new Error("{code: 100, error: 'Missing credentials'}"));
        }

    });

};

var ItemSchema = new Schema({
    itemId: Number,
    itemCount: Number
});

var ItemManagerSchema = new Schema({
    items: [ItemSchema]
});

var GameSchema = new Schema({
    num: Number,
    playerRace: {type: String, required: true},
    enemyRace: {type: String, required: true},
    playerItems: { type: Schema.ObjectId, ref: 'ItemManager'},
    enemyItems: { type: Schema.ObjectId, ref: 'ItemManager'}
});

var EnemySchema = new Schema({
    name: {type: String, index: true , required: true},
    gameCount: {type: Number, default: 0},
    games: [GameSchema]
});

var PlayerSchema = new Schema({
    username: {type: String, index: { unique: true } , required: true},
    email: {type: String, index: { unique: true } , required: true},
    password: {type: String, required: true},
    enemies: [EnemySchema]
});
PlayerSchema.plugin(ACL_Plugin);

/**
 *
 * Removes the passworld field to send to the client
 *
 * @return {Object} same object, but without the password field
 */
PlayerSchema.methods.secure = function(){

    delete this._doc.password;

    return this;

};

exports.Player = mongoose.model('Player', PlayerSchema);
exports.Enemy = mongoose.model('Enemy', EnemySchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.ItemManager = mongoose.model('ItemManager', ItemManagerSchema);
exports.Item = mongoose.model('Item', ItemSchema);

mongoose.connect(env.mongo_url);

