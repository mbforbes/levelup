// entry.js defines a skill's entry for a day

var mongoose = require('mongoose');

var EntrySchema = new mongoose.Schema({
	// Note(mbforbes): pid maybe not needed.
	pid: ObjectId,
	sid: ObjectId,
	// Skills can be put towards different abilities depending on the day.
	// This way, "project" work can go towards either the "music" or "cs"
	// abilities. A limitation of this is that once skill cannot be put towards
	// multiple abilities in the same day.
	aid: ObjectId,
	exp: Number,
	day: Date,
});

var Entry = mongoose.model('Entry', EntrySchema);

module.exports = mongoose.model('Entry', EntrySchema);
