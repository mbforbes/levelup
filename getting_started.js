
// open
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

// get connection
var db = mongoose.connection;

// handle errors
db.on('error', console.error.bind(console, 'connection error:'));

// we can actually do stuff once it's open
db.once('open', function (callback) {

	// define our kitten schema
	var kittySchema = mongoose.Schema({
		name: String
	});

	// methods must be added to the schema before compiling it with
	// mongoose.model
	kittySchema.methods.speak = function () {
		var greeting = this.name ?
			"Meow name is " + this.name :
			"I don't have a name";
		console.log(greeting);
	};

	// compile the schema into a model
	var Kitten = mongoose.model('Kitten', kittySchema);

	// create a new kitten named 'Silence' and log its name
	var silence = new Kitten({ name: 'Silence' });
	console.log(silence.name);
	silence.save();

	// create a new kitten named 'fluffy' and call its speak() method
	var fluffy = new Kitten({ name: 'fluffy' });
	fluffy.speak();

	// call the builtin save method on the fluffy document. We can (optionally)
	// provide a callback function, which we do, which is passed an error if one
	// happens as well as the saved document.
	fluffy.save(function (err, fluffy) {
		// log to console if there was a problem
		if (err) {
			return console.error(err);
		}

		// otherwise, fluffy speaks after it was saved
		console.log('Saving:');
		fluffy.speak();
	});

	// use the Kitten model to find all of the kitten documents
	Kitten.find(function (err, kittens) {
		// obligatory error checking
		if (err) {
			return console.error(err);
		}

		// here are all the kittens
		console.log('All kittens:');
		console.log(kittens);
	});

	// Use mongodb'MongoDB's querying syntax to filter kittens by name (again
	// querying the model).
	Kitten.find({ name: /^fluff/ }, function(err, kittens) {
		// obligatory error checking.... is there any way to just, I don't know
		// have a default way of doing this so I don't have to repeat this
		// everywhere?
		if (err) {
			return console.error(err);
		}

		console.log("Kittens named 'fluff':");
		console.log(kittens);
	});
});
