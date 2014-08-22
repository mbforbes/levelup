// css3 pie code -------------------------------------------------------
// $(function() {
// 	// create fns
// 	window.randomize = function() {
// 		$('.radial-progress').attr('data-progress', Math.floor(Math.random() * 100));
// 	};
// 	window.startgrow = function() {
// 		var els = $('.radial-progress');
// 		for (var i = 0; i < els.length; i++) {
// 			// make some random value for now
// 			var fill = i * 15 + 50;
// 			if (i % 2 === 0) {
// 				fill = 100;
// 			}

// 			// and fill it
// 			els[i].setAttribute('data-progress', els[i].getAttribute('data-progress'));
// 		}
// 		// $('.radial-progress').forEach(logger);
// 	};

// 	// setTimeout(x,y): wait for y ms and then call function x
// 	// setTimeout(window.startgrow, 100);

// 	// allow clicking
// 	// $('.radial-progress').click(window.randomize);
// });

// handle submit of dailies
var enterDailies = function() {
	var circleDivs = $(".circleDiv"); // the whole column
	var radials = $(".radial-progress"); // the CSS3 circles
	var dailies = $(".percentage");  // the input boxes

	circleDivs.each(function(i) {
		// extract the right elements
		var circleDiv = $(this);
		var daily = dailies[i];
		var radial = radials[i];

		// extract the attributes we care about from the input div
		var num = daily.valueAsNumber;
		var name = daily.name;
		var prev = daily.placeholder;
		var goal = parseInt(daily.getAttribute('goal'));

		// always unfocus
		daily.blur();

		// make sure both are valid
		if (typeof num === "number" && num >= 0 && name) {
			// replace placeholder with val better styling
			daily.value = "";
			daily.placeholder = num;

			// if it's actually changed, we submit & redraw
			if (prev != num) {
				// redraw
				var percentage = getpercentage(num, goal);

				console.log(name + ": " + num + ", goal: " + goal + ", (" + percentage + "%)");
				radial.setAttribute('data-progress', percentage);

				// change colors. we want it to tun green only after
				// it's fully transitioned, but we want it to turn
				// orange immediately if the value is shrunk.
				setTimeout(checkgreen, 1000); // timeout should match CSS
				if (num < goal) {
					circleDiv.removeClass("complete").addClass("uncomplete");
				}
			}
		} else if (typeof num === "number" && num < 0) {
			// for negative inputs, just replace with old val
			daily.value = "";
			daily.placeholder = prev;
		}
	});
};

var getpercentage = function(num, goal) {
	var percentage = 0;
	if (num >= goal) {
		// handles > 100% drawing with ease
		percentage = 100;
	} else {
		// ceil handles giant decimal things that screw up
		// the CSS
		percentage = Math.ceil((num / goal) * 100);
	}
	return percentage;
};

// TODO: refactor some of the above into this
var startgrow = function() {
	console.log("In startgrow");
	var circleDivs = $(".circleDiv"); // the whole column
	var radials = $(".radial-progress"); // the CSS3 circles
	var dailies = $(".percentage");  // the input boxes

	circleDivs.each(function(i) {
		// extract the right elements
		var circleDiv = $(this);
		var daily = dailies[i];
		var radial = radials[i];

		// extract the attributes we care about from the input div
		var name = daily.name;
		var num = daily.placeholder;
		var goal = parseInt(daily.getAttribute('goal'));

		var percentage = getpercentage(num, goal);
		radial.setAttribute('data-progress', percentage);
		setTimeout(checkgreen, 1000); // timeout should match CSS
	});
};

var checkgreen = function() {
	var circleDivs = $(".circleDiv"); // the whole column
	var dailies = $(".percentage");  // the input boxes

	circleDivs.each(function(i) {
		var circleDiv = $(this);
		var daily = dailies[i];
		var goal = parseInt(daily.getAttribute('goal'));

		var val = daily.getAttribute('placeholder'); // current val always stored as placeholder
		if (val >= goal) {
			circleDiv.removeClass("uncomplete").addClass("complete");
		} else {
			circleDiv.removeClass("complete").addClass("uncomplete");
		}
	});
};

// goog pie code -------------------------------------------------------

// load google libraries (hopefulyl async...)
google.load("visualization", "1", {packages:["corechart"]});

function drawChart() {
	var data = google.visualization.arrayToDataTable([
	  ['Skill', 'Minutes done'],
	  ['Projects', 40],
	  ['CS Reading', 30],
	  ['Remaining',  7]
	]);

	var options = {
		backgroundColor: 'transparent',
		pieSliceBorderColor: 'transparent',
		pieHole: 0.4,
		pieSliceText: 'none',
		legend: 'none',
		slices: {
			0: { color: '#d6dadc' },
			1: { color: '#888' },
			2: { color: '#3f3f3f' }
		},
		chartArea: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			width: '100%',
			height: 70
		},

		tooltip: {text: 'value'}
	};

	var charts = document.getElementsByClassName('donutchart');
	for (var i = 0; i < charts.length; i++) {
		var chartDiv = charts[i];
		var chart = new google.visualization.PieChart(chartDiv);
		chart.draw(data, options);
	}
}


// "global" code -------------------------------------------------------
// replaces google.setOnLoadCallback(drawChart);
// $(document).ready(function() {
// 	// check for greenness of css3 daily circles
// 	setTimeout(startgrow, 0);

// 	// set resize callbacks
// 	// create trigger to resizeEnd event
// 	$(window).resize(function() {
// 	    if (this.resizeTO) {
// 	    	clearTimeout(this.resizeTO);
// 	    }
// 	    this.resizeTO = setTimeout(function() {
// 	        $(this).trigger('resizeEnd');
// 	    }, 200);
// 	});

// 	// redraw graph when window resize is completed
// 	$(window).on('resizeEnd', function() {
// 	    drawChart();
// 	});

// 	// draw initial google charts
// 	drawChart();

// 	// attach ajax handlers
// 	initAjx();
// });
