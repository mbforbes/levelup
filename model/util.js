var pg = require('pg');
var pgconfig = require('../config/database.js');

var getClient = function() {
	var client = new pg.Client(pgconfig.url);
	client.connect();
	return client;
};

var endClient = function(client) {
	client.end()
};

// Define API.
module.exports.getClient = getClient;
module.exports.endClient = endClient;
