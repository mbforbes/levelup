// module dependencies
// ----------------------------------------------------------------------------
// app / route
var express = require('express'),
	router = express.Router(),
    passport = require('passport'),
	GoogleStrategy = require('passport-google').Strategy;

// vars
// ----------------------------------------------------------------------------
// TODO(mbforbes): Find a way to factor this out.
var jade_options = {pretty: true};

// passport config
// ----------------------------------------------------------------------------
passport.use(new GoogleStrategy({
	returnURL: 'http://localhost:5000/auth/google/return',
	realm: 'http://localhost:5000'
	},
	function(identifier, profile, done) {
		email = profile.emails[0].value;
		player.getPid(email, done);
	}
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// routes
// ----------------------------------------------------------------------------
router.get('/login', function(req, res) {
	console.log("route: login");
	// TODO(mbforbes): Maybe also redirect here to main page if person
	// actually is logged in and tries to go to this URL.

	// We load the data per request, and send response after it's done.
	res.render('login.jade', jade_options);
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// Here's how we login.
router.get('/auth/google', passport.authenticate('google'));

// Google redirects here after authenticaion. We must finish the process
// by "verifying the assertion" (which assertion?). Anyway, we just
// conditionally redirect.
router.get('/auth/google/return', passport.authenticate('google', {
	successRedirect: '/',
	failureRedirect: '/failure'
}));

// Failures go here. Very cry. Much unfortunate.
router.get('/failure', function(req, res) {
	console.log("route: failure");
	// We load the data per req, and send response after it's done.
	res.render('failure.jade', jade_options);
});

// export
// ----------------------------------------------------------------------------
module.exports = router;
