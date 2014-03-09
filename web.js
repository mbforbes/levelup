// Module dependencies
var express = require("express");
var fs = require("fs");
var merge = require('merge');
var _ = require('underscore');

// settings and stuff
var jade_options = {pretty: true};
var pub_dir = __dirname + '/public/';
var data_filename = pub_dir + '/fake_data/' + 'processed.json';

// create and configure app
var app = express();
app.use(express.logger());
app.use(express.static(pub_dir));

// my functions

// returns {
//   "level": int,
//   "exp": int,
//   "progress": int, // [=====---]
//   "needed": int      // [-----===]
// }
var get_level_data = function(data) {
	// debug
	console.log("Getting level data...");

	// calculate total exp
	var exp = 0;
	for (var i = 0; i < data.past_progress.length; i++) {
		exp += data.past_progress[i].minutes;
	}
	for (var i = 0; i < data.today_progress.length; i++) {
		exp += data.today_progress[i].minutes;
	}

	// debug
	console.log('\t- got total exp (' + exp + ')');

	// given our exp rules are:
	// - baseline: 180 exp needed every level
	// - modifier: 60i exp needed to go from lvl i to i + 1
	// here's the equation for:
	// - y: player level
	// - x: exp needed to reach that level
	// - y = (30x + 180)(x - 1)
	// given a quadratic equation and y, how do you solve for x?
	// I don't know, so I'm going to brute force it
	var lvl = 2 // we start at lvl 1 with exp 0, so check 2 first
	var exp_needed_prev = 0	
	var exp_leftover = 0
	var needed = 0;
	while (true) {
		var exp_needed = get_exp_needed_for_plvl(lvl)
		if (exp < exp_needed) {
			lvl -= 1;
			exp_needed_prev = get_exp_needed_for_plvl(lvl);
			exp_leftover = exp - exp_needed_prev;
			needed = exp_needed - exp;
			break;
		} else {
			lvl++;
		}
	}

	// debug
	console.log('\t- got player level (' + lvl + ')');

	return {
		"level": lvl,
		"exp": exp,
		"progress": exp_leftover,
		"needed": needed
	}
};


// returns [
//  {
//    "code_name": string,
//    "display_name", string,
//    "level": int,
//    "exp": int,
//    "progress": int, // [=====---]
//    "needed": int      // [-----===]
//    "skills_today": [
//      {
//	      "code_name": string,
//        "display_name": string,
//        "exp_today": int,
//        "goal": int
//        "need_today": int // goal - exp_today or 0
//      },
//      ... (for each skill)
//    ]
//  },
//  ... (for each ability)
// ]
var get_ability_data = function(data) {
	// debug
	console.log("Getting ability data...");

	var ret = [];

	// loop through all abilities
	for (var i = 0; i < data.abilities.length; i++) {
		var ability = data.abilities[i];
		var info = {};

		// debug
		console.log('\t- processing ability ' + ability.display_name);

		// extract basic info
		info.code_name = ability.code_name;
		info.display_name = ability.display_name;

		// get all matching skills
		var skills = get_skills_for_ability(data, ability.code_name);

		// sum the exp from all matching skills
		var exp = get_total_exp_for_skills(data, skills);

		// debug
		console.log('\t\t- got total ability exp (' + exp + ')');

		// do the dumb for loop to solve the quadratic for y val
		// a.k.a. caclulate ability level, progress, remaining
		var alvl = 2;
		var exp_needed_prev = 0;
		var exp_leftover = 0;
		var needed = 0;
		while (true) {
			var exp_needed = get_exp_needed_for_alvl(alvl);
			if (exp_needed > exp) {
				alvl -= 1;
				exp_needed_prev = get_exp_needed_for_alvl(alvl);
				exp_leftover = exp - exp_needed_prev;
				needed = exp_needed - exp;
				break;
			} else {
				alvl++;
			}
		}
		info.level = alvl;
		info.exp = exp;
		info.progress = exp_leftover;
		info.needed = needed;
		info.skills_today = [];

		// debug
		console.log('\t\t- got ability level (' + alvl + ')');

		// get "today" progress for all skills
		for (var j = 0; j < skills.length; j++) {
			// debug
			console.log('\t\t- getting data for skill ' + skills[j].display_name);

			// get skill data for today
			info.skills_today.push(get_skill_today_data(data, skills[j]));
		}		

		ret.push(info);
	}
	return ret;
};

// Gets the data for a skill for display in "today" HUD.
//
// returns {
//   "code_name": string,
//   "display_name": string,
//   "exp_today": int,
//   "goal": int
//   "need_today": int // goal - exp_today or 0
// }
var get_skill_today_data = function(data, skill) {
	var ret = {};
	ret.code_name = skill.code_name;
	ret.display_name = skill.display_name;	

	// get skill minutes today
	// note: really need to use _ here...
	for (var i = 0; i < data.today_progress.length; i++) {
		if (data.today_progress[i].code_name == skill.code_name) {
			ret.exp_today = data.today_progress[i].minutes;
		}
	}

	// save / calculate other stats
	ret.goal = skill.goal;
	var remaining = skill.goal - ret.exp_today;
	ret.need_today = remaining > 0 ? remaining : 0;
	return ret;
};

// Given a list of skill code names (skills), sums all past and today
// exp for all provided skills, and returns that number.
// 
// returns int
var get_total_exp_for_skills = function(data, skills) {
	var total = 0;
	for (var i = 0; i < skills.length; i++) {
		var skill_code_name = skills[i].code_name;
		total += get_skill_minutes(skill_code_name, data.past_progress);
		total += get_skill_minutes(skill_code_name, data.today_progress);
	}
	return total;
};

// Given a skill and an array that contains progress (either 
// data.past_progress or data.today_progress), returns the skill's
// minutes in that array.
//
// returns int
var get_skill_minutes = function(skill_code_name, progress_arr) {
	// TODO: replace this whole function with some _ call.
	for (var i = 0; i < progress_arr.length; i++) {
		p = progress_arr[i];
		if (p.code_name == skill_code_name) {
			return p.minutes;
		}
	}
	// TODO: some kind of app error / warn here
	return 0;
};

// gets the skills associated with a particularity ability
// returns [
//   {...}, // associated skill 1
//   {...}, // associated skill 2
//   ...
// ]
var get_skills_for_ability = function(data, a_code_name) {
	var assoc_skills = [];
	for (var i = 0; i < data.skills.length; i++) {
		if (data.skills[i].ability == a_code_name) {
			assoc_skills.push(data.skills[i]);
		}
	}
	return assoc_skills;
};

// Gets total exp needed to get to plvl
// 180(y-1) + 60(y-1)(y)/2 = (30y + 180)(y-1)
var get_exp_needed_for_plvl = function(plvl) {
	return (30 * plvl + 180) * (plvl - 1);
};

// Gets total exp needed to get to alvl
// 30(y-1)(y)/2 = 15(y-1)(y)
var get_exp_needed_for_alvl = function(alvl) {
	return 15 * alvl * (alvl - 1);
};

// routing
app.get('/', function(request, response) {
	var data = JSON.parse(fs.readFileSync(data_filename));
	var level_data = get_level_data(data);
	var ability_data = get_ability_data(data);
	var locals = {
		"level_data": level_data,
		"ability_data": ability_data
	}
	response.render(pub_dir + 'index.jade', merge(jade_options, locals));
});

// talk to the outside world
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});