/* Milestone meta-model.
 *
 * Milestone is the meta-class from which implementations can be
 * derived. Current planned milestones are bosses and rewards.
 *
 * This is basically poor-man's code reuse without using a model
 * library.
 */

var async = require('async');
var util = require('./util');
var _ = require('underscore');

// async helper functions

// Creates the milestone table for type if it doesn't exist.
//
// Args:
//     client (from postgresql)
//     type (str): The table type (name): e.g. 'boss' or 'reward'.
//     callback (f(err,res)): passed to query to call upon completion
var maybeMakeMilestoneTable = function(client, type, callback) {
	console.log('Maybe creating ' + type + ' table.');
	client.query("                                \
		CREATE TABLE IF NOT EXISTS " + type + " ( \
			aid    int,                           \
			id     serial,                        \
			lvl    int,                           \
			name   varchar(255),                  \
			desc   varchar(255),                  \
			done   bool                           \
		);",
		callback
	);
};

// Gets the milestones for the provided aid.
//
// Args:
//     client (from postgresql)
//     type (str): The table type (name): e.g. 'boss' or 'reward'.
//     aid (int): unique ability identifier
//     prevResult (object): unused
//     callback (f(err,res)): passed to query to call upon completion
var getMilestonesForAid = function(client, type, aid, prevResult, callback) {
	console.log('Getting ' + type + ' for aid ' + aid);
	client.query(
		"SELECT * FROM " + type + " WHERE aid=($1);",
		[aid],
		callback
	);
};
