// Called when the document is ready (by jQuery's func).
$(document).ready(function() {
	// check for greenness of css3 daily circles
	setTimeout(startgrow, 0);

	// attach ajax handlers
	initAjax();
});


var initAjax = function() {
	// Setup ajax, general.
	$.ajaxSetup({
		xhrFields: {
			// Holy crap this is amazing. I'm so glad I don't have to do
			// anything more than this. Authentication now 'just works' for
			// ajax.
			withCredentials: true
		}
	});

	// Maybe signal Ajax to grab abilities for editing.
	if ($('div.editabilities').length > 0) {
		getAbilitiesEdit();
	}
};

// Players ajax.
var updatePlayersRequest = function() {
	$.ajax('/ajax/player/getNum', {
		success: updatePlayersSuccess,
	});
};

var updatePlayersSuccess = function(data, status, jqxhr) {
	$('p.players').text(data);
};

// Abilities ajax

var addAbility = function() {
	$.ajax('/ajax/ability/add', {
		type: 'POST',
		data: $('#abilityAdd').serialize(),
		success: refreshAbilitiesEdit
	});
}

// helper
var refreshAbilitiesEdit = function() {
	// clear
	// $('div.editabilities').html('');
	// fetch
	getAbilitiesEdit();
};

var getAbilitiesEdit = function() {
	console.log('Getting abilities for editing.');
	$.ajax('/ajax/ability/edit', {
		success: getAbilitiesEditSuccess,
	});
};

var getAbilitiesEditSuccess = function(data, status, jqxhr) {
	$('div.editabilities').html(data);
};
