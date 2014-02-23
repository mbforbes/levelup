// Module dependencies
var express = require("express");
var fs = require("fs");
var merge = require('merge');
var _ = require('underscore');

// settings and stuff
var jade_options = {pretty: true};
var pub_dir = __dirname + '/public/';

// create and configure app
var app = express();
app.use(express.logger());
app.use(express.static(pub_dir));

// routing
app.get('/', function(request, response) {
	locals = {}
	response.render(pub_dir + 'index.jade', merge(jade_options, locals));
});

// talk to the outside world
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});