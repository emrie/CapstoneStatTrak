var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var account = new Schema({
  email:  String,
  password: String,

  name:{
    first: String,
    last: String,
  },

  username: String,
  school_code: String,
  type : {type: String, default: 'p'}
});

mongoose.model('account', account, "account");
