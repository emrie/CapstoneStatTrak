var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var game = new Schema({
  homeTeamName : String,
  awayTeamName : String,
  homeTeamCode: String,
  homeScore: Number,
  homeTeam : [ {name : {first : String, last : String}, number : Number, pt1 : Number, pt2 : Number, pt3 : Number} ],
  awayTeam : [ {name : {first : String, last : String}, number : Number, pt1 : Number, pt2 : Number, pt3 : Number} ],
  awayTeamCode: String,
  awayScore: Number,
  date: { type: Date, default: Date.now },
  _id: Schema.ObjectId
});

mongoose.model('game', game, "game");
