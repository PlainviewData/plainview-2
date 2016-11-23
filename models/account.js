var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var URLSlugs = require('mongoose-url-slugs');

var Account = new Schema({
	username: String, 
	password: String,
	created_on: { type: Date, default: Date.now },
	responses: [Schema.Types.Object],
	discussions: [Schema.Types.Object],
	notifications: [Schema.Types.Object],
	permissions: [],
	api_key: String,
	last_post: Number
});

// Account.pre("save",function(next) {
// 	if (this.permissions.length == 0)
// 		this.permissions.push("create_groups");
// 	next();
// });

Account.plugin(URLSlugs('username'));
Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);