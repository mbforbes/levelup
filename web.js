// Module dependencies
var request = require('request');
var express = require("express");
var fs = require("fs");
var merge = require('merge');
var _ = require('underscore');

// settings and stuff
var exp_url = String(fs.readFileSync('exp_url'));
var abilities_url = String(fs.readFileSync('abilities_url'));
var jade_options = {pretty: true};
var pub_dir = __dirname + '/public/';
var data_filename = pub_dir + '/fake_data/' + 'processed.json';

// create and configure app
var app = express();
app.use(express.logger());
app.use(express.static(pub_dir));

// my functions

// smart parse int... if it's just empty, return 0
var stoi_zero = function(str) {
	if (str == '') {
		return 0;
	} else {
		return parseInt(str);
	}
}

// returns {
//   "level": int,
//   "exp": int,
//   "progress": int, // [=====---]
//   "needed": int      // [-----===]
// }
var get_level_data = function(data) {
	// debug
	console.log("Getting level data...");
	console.log(data);

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
		var bosses_todo = get_bosses_todo(ability);
		var lblvl = get_lowest_boss_level(bosses_todo);
		var alvl = 2;
		var exp_needed_prev = 0;
		var exp_leftover = 0;
		var needed = 0;
		while (true) {
			var exp_needed = get_exp_needed_for_alvl(alvl);
			if (exp_needed > exp || alvl == lblvl) {
				alvl -= 1;
				exp_needed_prev = get_exp_needed_for_alvl(alvl);
				exp_leftover = exp - exp_needed_prev;
				// doing some workarounds because boss limiting factor may mean
				// that exp actually above exp_needed
				var diff_to_next = exp_needed - exp;
				needed = diff_to_next > 0 ? diff_to_next : 0;
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

		// also save level back in data for future use
		// NOTE: is this bad design? It's certainly convenient...
		ability.level = alvl;

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

// Returns a list of all bosses that:
//
// TODO: CURSPOT augment boss entries with associated ability
//
// - have not been done yet
// - are within 5 levels of the current ability level
// Assumes that get_ability_data(...) has been called already as this
// augments the data with levels for each ability.
// returns [
//   { level: int, desc: string },
//   { level: int, desc: string },
//   ...
// ]
var get_boss_list = function(data) {
	var boss_list = [];
	for (var i = 0; i < data.abilities.length; i++) {
		var ability = data.abilities[i];
		var bosses_todo = get_bosses_todo(ability);
		for (var j = 0; j < bosses_todo.length; j++) {
			boss = bosses_todo[j];
			if (boss.level <= ability.level + 5) {
				boss_list.push(boss);
			}
		}
	}
	return boss_list;
}

// Takes a list of bosses, returns the lowest level.
// returns int, 9999 if boss_list empty
// TODO replace with _ call
var get_lowest_boss_level = function(boss_list) {
	// TODO figure out what max int is
	var min = 9999
	for (var i = 0; i < boss_list.length; i++) {
		var boss = boss_list[i];
		if (boss.level < min) {
			min = boss.level;
		}
	}
	return min;
}

// Takes the ability and returns bosses - bosses_battled. 
// returns [
//   { level: int, desc: string},
//   { level: int, desc: string},
//   ...
// ]
// TODO: repalce with some _ call
var get_bosses_todo = function(ability) {
	var bosses_todo = [];
	if (ability.bosses == undefined) {
		return bosses_todo;
	}
	for (var i = 0; i < ability.bosses.length; i++) {
		var boss = ability.bosses[i];
		var seen = false;
		for (var j = 0; j < ability.bosses_battled.length; j++) {
			var battled = ability.bosses_battled[j];
			// Assuming that matching level and desc means match...
			if (boss.level == battled.level && boss.desc == battled.desc) {
				seen = true;
				break;
			}
		}
		if (!seen) {
			bosses_todo.push(boss);
		}
	}
	return bosses_todo;
}

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
			break;
		}
	}

	// save / calculate other stats
	ret.goal = skill.daily_goal;
	var remaining = ret.goal - ret.exp_today;
	ret.need_today = remaining > 0 ? remaining : 0;

	// debug
	console.log('\t\t\t- goal (' + ret.goal + '), needed (' + ret.need_today + ')');

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

// parsing exp csv. current format is 
//
// header1
// header2
// header3
// line
// line
// ...
// 
// where header1 is
// 
//     skill name,<display name of skill 1>,<display name of skill 2>,...
//
// and header2 is
//
//     skill short name,<code name of skill 1>,<code name of skill 2>,...
// 
// and header3 is
//
//     ability affiliation,<code name of ability for skil 1>,...
//
// and line is either
//
//     goal,<int minutes goal for skill 1>,<int minutes goal for skill 2>,... 
// 
// or
//
//     <mm/dd/yyyy>,<entry for skill 1>,<entry for skill 2>,...
//
// where <entry for skill x> is either '' (the empty string) or <int minutes>
//
//
// We parse like a state machine by keeping track of the last goal and adding
// experience as earned throughout.
// 
// returns object with the following format:
// 
// todo(max) returned object format
//
var parse_exp_csv = function(csv_txt) {
	var lines = csv_txt.split('\n');
	// we need at least 4 lines for 3 headers and an entry line
	if (lines.legnth < 4) {
		console.log("Error: exp CSV too short to parse. Length: " + lines.length);
		return;
	}

	// extract header info (skill display names, code names, and ability affil)
	var skill_displays = [];
	var skill_shorts = [];	
	var skill_affils = [];
	var header1 = lines[0].split(',');
	var header2 = lines[1].split(',');
	var header3 = lines[2].split(',');
	// skip first piece, as it contains the description
	for (var i = 1; i < header1.length; i++) {
		skill_displays.push(header1[i])
		skill_shorts.push(header2[i])
		skill_affils.push(header3[i])
	}

	// make default goal, past_progress, and today_progress arrays (0s) based on
	// no. skills
	var cur_goal = [];
	var past_progress = [];
	var today_progress = [];
	for (var i = 0; i < skill_displays.length; i++) {
		cur_goal.push(0);
		past_progress.push(0);
		today_progress.push(0);
	}

	// get today
	var d = new Date();
	var today_month = d.getMonth() + 1; // 0-based... wow Javascript
	// note that i'm calling it day, but in javascript getDay() returns the day
	// of the week, whereas getDate() returns the day of the month
	var today_day = d.getDate();
	var today_year = d.getFullYear();

	// extract goals and entry lines
	// skip first three lines; those were the headers
	for (var i = 3; i < lines.length; i++) {
		var line = lines[i].split(',');
		if (line[0] == 'goal') {
			// process as goal line; update cur_goal
			// skip first piece, as it contains 'goal'
			for (var j = 1; j < line.length; j++) {
				cur_goal[j - 1] = stoi_zero(line[j]);
			}
		} else {
			// process as entry line
			// if the date is today's date, we just add entries to
			// today_progress. date is mm/dd/yyyy
			var date = line[0].split('/');
			var cur_month = stoi_zero(date[0]);
			var cur_day = stoi_zero(date[1]);
			var cur_year = stoi_zero(date[2]);
			if (cur_month == today_month && cur_day == today_day && cur_year ==
				today_year) {
				// skip first piece, as it contains today's date
				for (var j = 1; j < line.length; j++) {
					today_progress[j - 1] = stoi_zero(line[j]);
				}
			} else {
				// it's a day in the past; just add it as normal
				// first, check to see if all experience above goal
				var above_goal = true;
				// skip first piece, as it contains the date
				for (var j = 1; j < line.length; j++) {
					if (stoi_zero(line[j]) < cur_goal[j-1]) {
						above_goal = false;
						break;
					}
				}
				// only if we're above the goal do we actually add the exp to the
				// totals
				if (above_goal) {
					// skip first piece, as still contains date
					for (var j = 1; j < line.length; j++) {
						past_progress[j - 1] += stoi_zero(line[j]);
					}
				}
			}
		}
	}
	// combine into return object
	var retobj = {};
	retobj.skills = [];
	retobj.past_progress = [];
	retobj.today_progress = [];
	for (var i = 0; i < cur_goal.length; i++) {
		retobj.skills.push({
			"code_name": skill_shorts[i],
			"display_name": skill_displays[i],
			"ability": skill_affils[i],
			"daily_goal": cur_goal[i]
		});

		retobj.past_progress.push({
			"code_name": skill_shorts[i],
			"minutes": past_progress[i]
		});

		retobj.today_progress.push({
			"code_name": skill_shorts[i],
			"minutes": today_progress[i]
		});
	}

	//console.log('cur goal:      ' + cur_goal);
	//console.log('past progress: ' + past_progress);
	//console.log('today progress:' + today_progress);
	//console.log(retobj);
	return retobj;
};

// parsing abilities csv. current format is 
//
// line1
// line2
// 
// where line1 is
// 
//     display name,<display name of ability 1>,<display name of ability 2>,...
//
// and line2 is
//
//     code name,<code name of ability 1>,<code name of ability 2>,...
// 
// returns object with the following format:
// 
// todo(max) returned object format
var parse_abilities_csv = function(csv_txt) {
	var lines = csv_txt.split('\n');

	// we need exactly 2 lines for the 2 headers
	if (lines.length != 2) {
		console.log("Error: abilities CSV incorrect length. Need 2, length: " +
			lines.length);
		return;
	}

	// extract info (ability display names, code names)
	var retarr = [];
	var display_names = lines[0].split(',');
	var code_names = lines[1].split(',');
	// skip first piece, as it contains the description
	for (var i = 1; i < display_names.length; i++) {
		retarr.push({
			"code_name": code_names[i],
			"display_name": display_names[i]
		});
	}

	//console.log(retarr);
	return retarr;
};

// starts the call chain
var load_data = function(resp) {
	var data = {};
	load_exp(data, resp);
}

// loads exp then calls load_abilities
var load_exp = function(data, resp) {
	request(exp_url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			data = merge(data, parse_exp_csv(body));
			load_abilities(data, resp);
		} else {
			console.log("There was a problem getting the exp data." + 
				" Error: " + error +", response: " + response + ".");
		}
	});
};

// called by load_exp
var load_abilities = function(data, resp) {
	request(abilities_url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			data.abilities = parse_abilities_csv(body);
			process_request(data, resp)
		} else {
			console.log("There was a problem getting the abilities data." + 
				" Error: " + error +", response: " + response + ".");
		}
	});
};

var process_request = function(data, response) {
	var level_data = get_level_data(data);
	var ability_data = get_ability_data(data);
	var boss_list = get_boss_list(data);
	var locals = {
		"level_data": level_data,
		"ability_data": ability_data,
		"boss_list": boss_list
	}
	response.render(pub_dir + 'index.jade', merge(jade_options, locals));
}

// routing
app.get('/', function(request, response) {
	// we load the data per request
	load_data(response);


	//var data = JSON.parse(fs.readFileSync(data_filename));
	// var level_data = get_level_data(data);
	// var ability_data = get_ability_data(data);
	// var boss_list = get_boss_list(data);
	// var locals = {
	// 	"level_data": level_data,
	// 	"ability_data": ability_data,
	// 	"boss_list": boss_list
	// }
	// response.render(pub_dir + 'index.jade', merge(jade_options, locals));
});

// talk to the outside world
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});