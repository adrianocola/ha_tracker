var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ItemSchema = new Schema({
    itemName: String,
    itemCount: Number
});

var GameSchema = new Schema({
    name: {type: String, index: true , required: true},
    playerRace: {type: String, required: true},
    enemyRace: {type: String, required: true},
    playerItems: [{ type: Schema.ObjectId, ref: 'Item'}],
    enemyItems: [{ type: Schema.ObjectId, ref: 'Item'}]
});

var EnemySchema = new Schema({
    name: {type: String, index: true , required: true},
    games: [GameSchema]
});

var PlayerSchema = new Schema({
    name: {type: String, index: true , required: true},
    enemies: [EnemySchema]
});

exports.Player = mongoose.model('Player', PlayerSchema);
exports.Enemy = mongoose.model('Enemy', EnemySchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.Item = mongoose.model('Item', ItemSchema);

mongoose.connect('mongodb://heroku_app4244150:j0irl4p4sjukp4q8h5928i2nku@ds033047.mongolab.com:33047/heroku_app4244150');
//mongoose.connect('mongodb://localhost/ha_tracker');
