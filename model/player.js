var async = require('async');
var util = require('./util');
var _ = require('underscore');

// settings
// TODO(mbforbes): Get this from request.
// var email = 'm.b.forbes@gmail.com';

// async helper functions

// Creates the player table if it doesn't exist.
//
// Args:
//     callback (f(err,res)): passed to query to call upon completion
var maybeMakePlayerTable = function(client, callback) {
	console.log('Maybe creating player table.');
	client.query("                           \
		CREATE TABLE IF NOT EXISTS player (  \
			email  varchar(255),             \
			id     serial                    \
		);",
		callback
	);
};

// Gets id for player with email.
//
// Args:
//     prevResult (Query): Unused
//     callback (f(err,res)): passed to query to call upon completion
var getPidFromEmail = function(client, email, prevResult, callback) {
	console.log('Getting player id from email: ' + email);
	client.query(
		"SELECT id FROM player WHERE email=($1);",
		[email],
		callback
	);
};

// Adds player if previous query retruned no rows (player doesn't exist).
//
// Args:
//     prevResult (Query): Result of querying whether player exists.
//     callback (f(err,res)): passed to query to call upon completion
var maybeAddPlayer = function(client, email, prevResult, callback) {
	if (prevResult.rows.length > 0) {
		console.log('Player exists; continuing...');
		callback(null);
	} else {
		console.log('Adding player.');
		query = client.query(
			"INSERT INTO player (email) VALUES ($1)",
			[email],
			callback
		);
	}
};

// Queries DB for all players.
//
// Args:
//     prevResult (Query): unused
//     callback (f(err,res)): passed to query to call upon completion
var getAllPlayers = function(client, prevResult, callback) {
	console.log('Getting all players.');
	client.query("SELECT * FROM player", callback);
}

// API methods

var getPid = function(email, done) {
	// make a client
	var client = util.getClient();

	async.waterfall([
		_.partial(maybeMakePlayerTable, client),
		_.partial(getPidFromEmail, client, email),
	], function(err, result) {
		// Always release client.
		util.endClient(client);

		if (err) {
			console.log('Problem:');
			console.log(err);
			done(err, false);
		} else {
			if (result.rows.length == 0) {
				console.log('Player does not exist.');
				done(null, false);
			} else {
				id = result.rows[0].id;
				console.log('Got id: ' + id);
				done(null, id);
			}
		}
	});
};

var getNumPlayers = function(request, response) {
	// make a client
	var client = util.getClient();

	// run queries in order
	async.waterfall([
		// bind client as calling, other results get chained.
		_.partial(maybeMakePlayerTable, client),
		_.partial(getAllPlayers, client)
	], function(err, result) {
		// Always release client.
		util.endClient(client);

		// check what we got
		if (err) {
			console.log('Problem:');
			console.log(err);
			response.send('0');
		} else {
			console.log('Completed.');
			for (var i = 0; i < result.rows.length; i++) {
				console.log(result.rows[i]);
			}
			response.send(result.rows.length.toString());
		}
	});
};

// Define our API.
exports.getNum = getNumPlayers;
exports.getPid = getPid;

