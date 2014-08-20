var pg = require('pg');
var http = require('http');
var pgconfig = require('../config/database.js');

// make a client
var client = new pg.Client(pgconfig.url);
client.connect();

// functions
var maybeCreateTable = function(client, email) {
	// create table maybe
	console.log('Maybe creating table.');
	client.query("                       \
	CREATE TABLE IF NOT EXISTS player (  \
		email  varchar(255),             \
		id     serial                    \
	);                                   \
	", function(err, result) {
		if (err) {
			console.error("Couldn't create player table.");
		} else {
			maybeAddUser(client, email);
		}
	});
};

var printUsers = function(client) {
	// get data
	console.log('Getting data.');
	var query = client.query("SELECT * FROM player");

	// report
	query.on('row', function(row) {
		console.log(row);
	});

	// finish
	query.on('end', function() {
		client.end();
	});
};

var maybeAddUser = function(client, email) {
	// get whether user email exists.
	var query = client.query(
		'SELECT * from player WHERE email=$1',
		[email],
		function(err, result) {
			if (err) {
				console.error("Couldn't query player table.");
			} else if (result.rows.length > 0) {
				console.error("User " + email + " already exists.");
				printUsers(client);
			} else {
				addUser(client, email);
			}
		}
	);
};

var addUser = function(client, email) {
	// insert data
	var query = client.query(
		"INSERT INTO player (email) VALUES ($1)",
		[email],
		function (err, result) {
			if (err) {
				console.error("Error adding player to table.");
			}
			printUsers(client);
		}
	);
};

// 'real' code
var email = 'm.b.forbes@gmail.com';
maybeCreateTable(client, email);
