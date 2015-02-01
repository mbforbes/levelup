// module dependencies
// -----------------------------------------------------------------------------

// 3rd party
var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
	_ = require('underscore');

// routes
var auth = require('./routes/auth');
var player = require('./routes/player');

// config
var configDB = require('./config/database.js');

// vars
// -----------------------------------------------------------------------------
var pub_dir = __dirname + '/public/';
var views_dir = __dirname + '/views/';

// setup
// -----------------------------------------------------------------------------
var app = express();

// TODO(mbforbes): Is this all needed / should it be done here?
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(pub_dir));
app.use(session({secret: 'shoud this be more secret?'}));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', auth);
app.use('/player', player);

// views
app.set('views', views_dir);

// swerve
app.listen(8000);
