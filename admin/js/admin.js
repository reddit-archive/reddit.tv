$(document).ready(function() {

$((document.location.hash != '') ? '#adminTabs a[href="' + document.location.hash + '"]' : '#adminTabs a:first').tab('show');

$('#adminTabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show').blur();
  document.location.hash = $(this).attr('href');
});

$('#embed-code-button').click(function() {
	var menu = $('.embed-code.dropdown-menu');

	menu.toggle();
});

	// $('#reservationtime').daterangepicker({ timePicker: true, timePickerIncrement: 30, format: 'MM/DD/YYYY h:mm A' });
$('#campaign-length').daterangepicker({
	ranges: {
		'Today': [moment(), moment()],
		'Until Tomorrow': [moment(), moment().add('days', 1)],
		'This Week': [moment(), moment().add('days', 6)],
		'This Month': [moment().startOf('month'), moment().endOf('month')],
		'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
	},
	startDate: moment(),
	endDate: moment().add('days', 7),
	showDropdowns: true
},
function(start, end) {
	// $('#campaign-length').val(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
});

//end document.ready
});