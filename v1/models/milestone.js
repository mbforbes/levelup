// milestone.js defines bosses or rewards

var mongoose = require('mongoose');

var MilestoneSchema = new mongoose.Schema({
	// Note(mbforbes): pid maybe not needed.
	pid: ObjectId,
	aid: ObjectId,
	lvl: Number,
	name: String,
	desc: String,
	// type: can be 'boss' or 'reward'
	type: String,
	done: Boolean,
	date_done: { type: Date },
	updated_at: { type: Date, default: Date.now },
});

var Milestone = mongoose.model('Milestone', MilestoneSchema);

module.exports = mongoose.model('Milestone', MilestoneSchema);
