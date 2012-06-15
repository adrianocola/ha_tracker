var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    u = require('underscore'),
    env = require('./env.js');

var Date_Plugin = function(schema, options){

    //add the field createdAt and updatedAt to the schema
    schema.add({ createdAt: Date, updatedAt: Date });

    // Update the model modification date
    schema.pre('save', function (next, opt, cb) {

        //if is new must only add the cration date
        if(this.isNew){
            this.createdAt = new Date();
        //else change de modification date
        }else{
            this.updatedAt = new Date();
        }

        next();

    })

}


//Mongoose plugin to support ACL object access security
var ACL_Plugin = function(schema, options) {

    //add the field ACL to the schema
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
            next(new Error("{code: 100, error: 'Missing ACL credentials'}"));
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
            next(new Error("{code: 100, error: 'Missing ACL credentials'}"));
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
},{ strict: true });
ItemSchema.plugin(Date_Plugin);

var ItemManagerSchema = new Schema({
    items: [ItemSchema]
},{ strict: true });
ItemManagerSchema.plugin(ACL_Plugin);
ItemManagerSchema.plugin(Date_Plugin);

var GameNoteSchema = new Schema({
    note: String
},{ strict: true });
GameNoteSchema.plugin(Date_Plugin);

var GameNoteManagerSchema = new Schema({
    notes: [GameNoteSchema]
},{ strict: true });
GameNoteManagerSchema.plugin(ACL_Plugin);
GameNoteManagerSchema.plugin(Date_Plugin);

var GameSchema = new Schema({
    num: {type: Number, default: 1},
    playerRace: {type: String, required: true},
    enemyRace: {type: String, required: true},
    playerItems: { type: Schema.ObjectId, ref: 'ItemManager'},
    enemyItems: { type: Schema.ObjectId, ref: 'ItemManager'},
    gameNotes: { type: Schema.ObjectId, ref: 'GameNoteManager'},
    state: {type: Number, default: 0}
},{ strict: true });
GameSchema.plugin(Date_Plugin);

var EnemySchema = new Schema({
    name: {type: String, index: true , required: true},
    gameCount: {type: Number, default: 0},
    position: {type: Number, required: true},
    stats: {
        winsTotal: Number,
        lossesTotal: Number,
        wins: {
            council: {
                concil: Number,
                darkelves: Number,
                dwarves: Number,
                tribe: Number
            }
        }
    },
    games: [GameSchema]
},{ strict: true });
EnemySchema.plugin(Date_Plugin);

var PlayerSchema = new Schema({
    user:{ type: Schema.ObjectId, ref: 'User', required: true, index: {unique: true}},
    showOnlyActive: {type: Boolean, default: 0},
    showState: {type: Boolean, default: 0},
    enemies: [EnemySchema]
},{ strict: true });
PlayerSchema.plugin(ACL_Plugin);
PlayerSchema.plugin(Date_Plugin);

//if asked to remove the player, remove the games
PlayerSchema.pre('remove',function(next){

    var that = this;

    var itemsIdsArray = [];
    var notesIdsArray = [];

    u.each(this.enemies,function(enemy){
        //search for games items and game notes inside of each game
        u.each(enemy.games,function(game){
            itemsIdsArray.push({_id: game.playerItems});
            itemsIdsArray.push({_id: game.enemyItems});

            notesIdsArray.push({_id: game.gameNotes});
        });
    });

    //remove game items
    exports.ItemManager.where().or(itemsIdsArray).remove();

    //delete game notes
    exports.GameNoteManager.where().or(notesIdsArray).remove();

    next();

},{ strict: true });


var UserSchema = new Schema({
    username: {type: String, lowercase: true, index: { unique: true, sparse: true }},
    email: {type: String, lowercase: true, index: { unique: true, sparse: true }},
    password: String,
    reset_password: String,
    last_login: Date,
    creation_date: Date,
    keep_logged: String,
    facebook: {
        userID: {type: String, index: { unique: true, sparse: true }},
        accessToken: String,
        expiresIn: Date
    },
    player:{ type: Schema.ObjectId, ref: 'Player', required: true, index: {unique: true}}
},{ strict: true });
UserSchema.plugin(Date_Plugin);
UserSchema.plugin(ACL_Plugin);
//if removing the user, remove the player
UserSchema.pre('remove',function(next){

    exports.Player.findOne({user: this._id},{},{userId: this._id}, function(err, player){
        player.remove();
    });

    next();

});

/**
 *
 * Removes the passworld field to send to the client
 *
 * @return {Object} same object, but without the password field
 */
UserSchema.methods.secure = function(){

    delete this._doc.password;
    delete this._doc.ACL;
    delete this._doc.reset_password;

    return this;

};

exports.User = mongoose.model('User', UserSchema);
exports.Player = mongoose.model('Player', PlayerSchema);
exports.Enemy = mongoose.model('Enemy', EnemySchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.ItemManager = mongoose.model('ItemManager', ItemManagerSchema);
exports.Item = mongoose.model('Item', ItemSchema);
exports.GameNoteManager = mongoose.model('GameNoteManager', GameNoteManagerSchema);
exports.GameNote = mongoose.model('GameNote', GameNoteSchema);

mongoose.connect(env.mongo_url);

