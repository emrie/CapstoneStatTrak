var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var team = new Schema({
    team: String,
    teamCode: String,
    players : [
      Schema.Types.ObjectId
    ]
});

mongoose.model('team', team, "team");
