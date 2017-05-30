var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schedule = new Schema({
  date: String,
  location: String,
  AwayTeam: String,
  team_id : String
});

mongoose.model('schedule', schedule, "schedule");
