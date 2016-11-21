var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Group', new Schema({
	tags: String,
	created_by: String,
	created_on: { type: Date, default: Date.now },
	name: String,
	admins: [Schema.Types.Object],
	members: [Schema.Types.Object],
	discussions: [Schema.Types.Object],
	participants: [Schema.Types.Object]
}));