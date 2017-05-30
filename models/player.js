var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var player = new Schema({
    name: {
        first: String,
        last: String
    },
    number: Number,
    pt3: {
        type: Number,
        default: 0
    },
    pt2: {
        type: Number,
        default: 0
    },
    pt1: {
        type: Number,
        default: 0
    },
    _id: Schema.ObjectId,
    username: String
});

mongoose.model('player', player, "player");
