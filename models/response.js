var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Block', new Schema({
	title: String,
	text: String,
	created_by: String,
	signature: String,
	created_on: { type: Date, default: Date.now },
	original_discussion: Schema.Types.ObjectId
}));