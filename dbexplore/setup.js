var pg = require('pg');
var http = require('http');
var pgconfig = require('../config/database.js');
var async = require('async');

// make a client
var client = new pg.Client(pgconfig.url);
client.connect();

// settings
var email = 'm.b.forbes@gmail.com';

// run queries in order
async.waterfall([

	// create table maybe
	function(callback) {
		console.log('Maybe creating table.');
		client.query("                           \
			CREATE TABLE IF NOT EXISTS player (  \
				email  varchar(255),             \
				id     serial                    \
			);",
			callback
		);
	},

	// check whether user exists
	function(prevResult, callback) {
		console.log('Getting user existence.');
		client.query(
			'SELECT * from player WHERE email=$1',
			[email],
			callback
		);
	},

	// add user maybe
	function(prevResult, callback) {
		if (prevResult.rows.length > 0) {
			console.log('User exists; continuing...');
			callback(null);
		} else {
			console.log('Adding user.');
			query = client.query(
				"INSERT INTO player (email) VALUES ($1)",
				[email],
				callback
			);
		}
	},

	// print results
	function(callback) {
		console.log('Getting all users.');
		var query = client.query("SELECT * FROM player", callback);
	}
], function(err, result) {
	// shut down client not matter what
	client.end();

	// check what we got
	if (err) {
		console.log('Problem:');
		console.log(err);
	} else {
		console.log('Completed.');
		for (var i = 0; i < result.rows.length; i++) {
			console.log(result.rows[i]);
		}
	}
});



