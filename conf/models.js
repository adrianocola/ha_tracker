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

        if(typeof opt == "object" && opt.userId){

            //if is the master user or the object doesn't have ACL
            if(opt.userId == 'MASTER' || !this.ACL){
                next(cb);
            }else if((this.ACL['*'] && this.ACL['*'].write) || (this.ACL[opt.userId] && this.ACL[opt.userId].write)){
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

        if(opt.options.userId){

            //if is the master user or the object doesn't have ACL
            if(opt.options.userId == 'MASTER' || !obj.ACL){
                next();
            }else if((obj.ACL['*'] && obj.ACL['*'].read) || (obj.ACL[opt.options.userId] && obj.ACL[opt.options.userId].read)){
                next();
            }else{
                next(new Error("{code: 102, error: 'Access not granted'}"));
            }

        }else{
            next(new Error("{code: 100, error: 'Missing credentials'}"));
        }

    });

    /**
     * Add values to the ACL security
     *
     * @param model the model that will receive the ACL
     * @param playerId id of the user with access to this object. Use '*' to grant to all
     * @param read have read access
     * @param write have write access
     */
    schema.methods.addACL = function(playerId, read, write){

        this.ACL = this.ACL || {};

        this.ACL[playerId] = {};

        if(read){
            this.ACL[playerId].read = true;
        }else{
            delete this.ACL[playerId].read;
        }

        if(write){
            this.ACL[playerId].write = true;
        }else{
            delete this.ACL[playerId].write;
        }

    };

    /**
     *
     * @param playerId id of the user that access to this object will be removed
     */
    schema.methods.removeACL = function(playerId){

        this.ACL = this.ACL || {};

        if(this.ACL[playerId]){
            delete this.ACL[playerId];
        }

    };

};

var ItemSchema = new Schema({
    itemId: Number,
    itemCount: Number
});

var ItemManagerSchema = new Schema({
    items: [ItemSchema]
});
ItemManagerSchema.plugin(ACL_Plugin);

var GameSchema = new Schema({
    num: Number,
    playerRace: {type: String, required: true},
    enemyRace: {type: String, required: true},
    playerItems: { type: Schema.ObjectId, ref: 'ItemManager'},
    enemyItems: { type: Schema.ObjectId, ref: 'ItemManager'},
    status: Number
});

var EnemySchema = new Schema({
    name: {type: String, index: true , required: true},
    gameCount: {type: Number, default: 0},
    position: {type: Number, required: true},
    games: [GameSchema]
});

var PlayerSchema = new Schema({
    user:{ type: Schema.ObjectId, ref: 'User', required: true, index: {unique: true}},
    enemies: [EnemySchema]
});
PlayerSchema.plugin(ACL_Plugin);
//if removing the player, remove the games
PlayerSchema.pre('remove',function(next){

    var that = this;

    var itemsIdsArray = [];

    u.each(this.enemies,function(enemy){
        u.each(enemy.games,function(game){
            itemsIdsArray.push({_id: game.playerItems});
            itemsIdsArray.push({_id: game.enemyItems});
        });
    });

    console.log(itemsIdsArray);

    exports.ItemManager.find().or(itemsIdsArray).remove();

    next();

});


var UserSchema = new Schema({
    username: {type: String, lowercase: true, index: { unique: true, sparse: true }},
    email: {type: String, lowercase: true, index: { unique: true, sparse: true }},
    password: {type: String},
    facebook: {
        userID: {type: String, index: { unique: true, sparse: true }},
        accessToken: String,
        expiresIn: Date
    }
});
UserSchema.plugin(ACL_Plugin);
//if removing the user, remove the player
UserSchema.pre('remove',function(next){

    console.log("REMOVE USER");

    //exports.Player.findById(this._id).remove();

    exports.Player.findById(this._id,{},{userId: 'MASTER'}, function(err, player){
        player.remove();
    });

    next();

});



var KeepLoggedSchema = new Schema({
    usernameHash: {type: String, index: true , required: true},
    userId: {type: String, index: true , required: true}
});
KeepLoggedSchema.plugin(ACL_Plugin);



/**
 *
 * Removes the passworld field to send to the client
 *
 * @return {Object} same object, but without the password field
 */
UserSchema.methods.secure = function(){

    delete this._doc.password;

    return this;

};

exports.KeepLogged = mongoose.model('KeepLogged', KeepLoggedSchema);
exports.User = mongoose.model('User', UserSchema);
exports.Player = mongoose.model('Player', PlayerSchema);
exports.Enemy = mongoose.model('Enemy', EnemySchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.ItemManager = mongoose.model('ItemManager', ItemManagerSchema);
exports.Item = mongoose.model('Item', ItemSchema);

mongoose.connect(env.mongo_url);

