// skill.js defines skills

var mongoose = require('mongoose');

var SkillSchema = new mongoose.Schema({
	pid: ObjectId,
	name: String,
	abbr: String,
	default_ability: ObjectId,
	updated_at: { type: Date, default: Date.now },
});

var Skill = mongoose.model('Skill', SkillSchema);

module.exports = mongoose.model('Skill', SkillSchema);
