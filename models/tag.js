var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Tag', new Schema({
	label: String,
	discussions_using: Number
}));