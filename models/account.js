var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	username: String, 
	password: String,
	first_name: String,
	last_name: String,
	created_on: { type: Date, default: Date.now },
	responses: [Schema.Types.Object],
	discussions: [Schema.Types.Object],
	notifications: [Schema.Types.Object]
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);