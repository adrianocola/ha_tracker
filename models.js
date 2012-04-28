var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    env = require('./env');

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
    name: {type: String, index: true , required: true},
    enemies: [EnemySchema]
});

exports.Player = mongoose.model('Player', PlayerSchema);
exports.Enemy = mongoose.model('Enemy', EnemySchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.ItemManager = mongoose.model('ItemManager', ItemManagerSchema);
exports.Item = mongoose.model('Item', ItemSchema);

mongoose.connect(env.mongo_url);

