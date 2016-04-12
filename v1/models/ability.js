// ability.js defines abilities

var mongoose = require('mongoose');

var AbilitySchema = new mongoose.Schema({
	pid: ObjectId,
	name: String,
	updated_at: { type: Date, default: Date.now },
});

var Ability = mongoose.model('Ability', AbilitySchema);

module.exports = mongoose.model('Ability', AbilitySchema);
