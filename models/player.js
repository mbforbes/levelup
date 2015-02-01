var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
	email: String,
	name: String,
	updated_at: { type: Date, default: Date.now }
});

var Player = mongoose.model('Player', PlayerSchema);

module.exports = mongoose.model('Player', PlayerSchema);
