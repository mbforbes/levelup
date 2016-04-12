/* Ability model.
 *
 */

var async = require('async');
var util = require('./util');
var _ = require('underscore');

// async helper functions

// Creates the ability table if it doesn't exist.
//
// Args:
//     client (from postgresql)
//     callback (f(err,res)): passed to query to call upon completion
var maybeMakeAbilityTable = function(client, callback) {
	console.log('Maybe creating ability table.');
	client.query("                           \
		CREATE TABLE IF NOT EXISTS ability ( \
			pid    int,                      \
			id     serial,                   \
			name   varchar(255),             \
			short  varchar(255)              \
		);",
		callback
	);
};

// Gets the abilities for the provided pid.
//
// Args:
//     client (from postgresql)
//     pid (int): unique user identifier
//     prevResult (object): unused
//     callback (f(err,res)): passed to query to call upon completion
var getAbilitiesForPid = function(client, pid, prevResult, callback) {
	console.log('Getting abilities for pid ' + pid);
	client.query(
		"SELECT * FROM ability WHERE pid=($1);",
		[pid],
		callback
	);
};

// Checks whether ability specified by adata can be added for player
// represented by pid.
//
// Calls callback either with an error or a length > 0 result if the
// ability cannot be added. Else, it can be added.
//
// Args:
//     client (from postgresql)
//     pid (int): unique user identifier
//     adata ({name: str, short: str})
//     prevResult (object): unused
//     callback (f(err,res)): passed to query to call upon completion
var checkAbilityCanBeAdded = function(client, pid, adata, prevResult, callback) {
	// First, ensure the data isn't garbage.
	if (adata.name.length === 0 || adata.short.length === 0) {
		callback('Neither field can be empty.', null);
	} else {
		// Next, ensure it doesn't already exist.
		console.log('Checking whether pid ' + pid + ' has ability:');
		console.log(adata);
		client.query(
			"SELECT * FROM ability WHERE pid=($1) AND (name=($2) or short=($3));",
			[pid, adata.name, adata.short],
			callback
		);
	}
};

// Adds the ability specified by adata for player with the provided pid.
//
// Args:
//     client (from postgresql)
//     pid (int): unique user identifier
//     adata ({name: str, short: str})
//     prevResult (object): unused
//     callback (f(err,res)): passed to query to call upon completion
var addAbility = function(client, pid, adata, prevResult, callback) {
	if (prevResult.rows.length > 0) {
		callback('Ability (' + adata.name + ', ' + adata.short +
			') name or short already exists.', null);
	} else {
		console.log('Adding ability for pid ' + pid + ':');
		console.log(adata);
		client.query(
			"INSERT INTO ability (pid, name, short) VALUES ($1, $2, $3);",
			[pid, adata.name, adata.short],
			callback
		);
	}
};

// API

// Maybe adds the ability specified in the request body; responds
// appropriately (we hope).
//
// Args:
//     request (from express)
//     response (from express)
var add = function(request, response) {
	// extract data
	adata = {
		name: request.body.name.trim(),
		short: request.body.short.trim()
	};

	// make a client
	var client = util.getClient();

	// Do the calls.
	async.waterfall([
		_.partial(maybeMakeAbilityTable, client),
		_.partial(checkAbilityCanBeAdded, client, request.user, adata),
		_.partial(addAbility, client, request.user, adata)
	], function(err, result) {
		// Always release client.
		util.endClient(client);

		// Check what we got.
		if (err) {
			console.log(err);
			response.status(500).send(err);
		} else {
			// Just let client know we did it correctly.
			console.log('Successfully added ability.');
			response.status(200).send('OK');
		}
	});
};

// Gets all all of the user's abilities; passes along by calling done
// when finished.
//
// Args:
//     request (from express)
//     response (from express)
//     done (fn(request, response, {abilities: rows}))
getAll = function(request, response, done) {
	// Make a client.
	var client = util.getClient();

	async.waterfall([
		_.partial(maybeMakeAbilityTable, client),
		_.partial(getAbilitiesForPid, client, request.user)
	], function(err, result) {
		// Always release client.
		util.endClient(client);

		// Check what we got.
		if (err) {
			console.log('Problem getting all abilities:');
			console.log(err);
			done(request, response, {});
		} else {
			var abilities = result.rows || [];
			console.log('Got ' + abilities.length + ' abilities.');
			done(request, response, {'abilities': abilities});
		}
	});
};

// Export API
exports.getAll = getAll;
exports.add = add;
