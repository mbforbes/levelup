// app / router
var express = require('express'),
	router = express.Router(),
	util = require('./util');

// model
var mongoose = require('mongoose'),
	player = require('../models/player.js');

// helper function (middleware?) to ensure a user is logged in
var is_logged_in = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

// GET /player
router.get('/', is_logged_in, function(req, res) {
	console.log("route: player root");
	// We load the data per request, and send response after it's done.
	res.render("Hello from players");
});

module.exports = router;
