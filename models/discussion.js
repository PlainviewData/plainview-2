var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Discussion', new Schema({
	tags: String,
	created_by: String,
	created_on: { type: Date, default: Date.now },
	public: Boolean,
	responses: [Schema.Types.Object],
	citations: [Schema.Types.Object],
	relationships: [Schema.Types.Object],
	participants: [Schema.Types.Object]
}));