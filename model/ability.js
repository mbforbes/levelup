var async = require('async');
var util = require('./util');
var _ = require('underscore');

// settings
// TODO(mbforbes): Get this from request.
var email = 'm.b.forbes@gmail.com';

// async helper functions

// Creates the ability table if it doesn't exist.
//
// Args:
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

var getAbilitiesForPid = function(client, pid, prevResult, callback) {
	console.log('Getting abilities for pid ' + pid);
	client.query(
		"SELECT * FROM ability WHERE pid=($1);",
		[pid],
		callback
	);
};

var checkAbilityCanBeAdded = function(client, pid, adata, prevResult, callback) {
	// First, ensure the data isn't garbage.
	if (adata.name.length == 0 || adata.short.length == 0) {
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
}

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

var add = function(request, response) {
	// extract data
	adata = {
		name: request.body.name.trim(),
		short: request.body.short.trim()
	};

	// Do the insertion.

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

		// check what we got
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


getAll = function(request, response, done) {
	// make a client
	var client = util.getClient();

	async.waterfall([
		_.partial(maybeMakeAbilityTable, client),
		_.partial(getAbilitiesForPid, client, request.user)
	], function(err, result) {
		// Always release client.
		util.endClient(client);

		// check what we got
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
