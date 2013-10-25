$(document).ready(function() {

// Section tabs
$((document.location.hash != '') ? '#adminTabs a[href="' + document.location.hash + '"]' : '#adminTabs a:first').tab('show');
$('#adminTabs a').click(function (e) {
	$(this).tab('show').blur();

	if (history.pushState) { 
		history.pushState({}, '', $(this).attr('href'));
		// provide a fallback
	} else { 
		scrollV = document.body.scrollTop;
		scrollH = document.body.scrollLeft;
		location.hash = href;
		document.body.scrollTop = scrollV;
		document.body.scrollLeft = scrollH;
	}
});

// Dropdown embed code textareas that stay open
$('.btn-embed-code').click(function() {
	var menu = $(this).next('.embed-code.dropdown-menu');

	menu.toggle();
	$('form .btn-embed-code').tooltip('hide');
});

$('form .btn-embed-code').tooltip({
	placement: 'bottom',
	container: 'body'
});

$('form input').on('change keyup', function() {
	$(this).parent().toggleClass('has-error', $(this).is(':invalid'));
	var form = $(this).parents('form'),
	    formInvalid = form.is(':invalid'),
	    submitBtn = form.find('button[type="submit"]');

	if (formInvalid) {
		submitBtn.attr('disabled', 'disabled');
	} else {
		submitBtn.removeAttr('disabled');
	}
});

// Date range dropdown
$('.campaign-length').daterangepicker({
	/*ranges: {
		'Today': [moment(), moment()],
		'Until Tomorrow': [moment(), moment().add('days', 1)],
		'This Week': [moment(), moment().add('days', 6)],
		'This Month': [moment().startOf('month'), moment().endOf('month')],
		'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
	},*/
	startDate: moment(),
	endDate: moment().add('month', 1),
	showDropdowns: true,
	timePicker: true,
	timePickerIncrement: 30,
	timePicker12Hour: true
},
function(start, end) {
	var type = $(this.element).attr('id').replace(/-length/, '');
	$('#' + type + '_start_date').val(start.format('YYYY-MM-DD HH:mm:ss'));
	$('#' + type + '_end_date').val(end.format('YYYY-MM-DD HH:mm:ss'));
});

// Set start/end dates to default dates
$('#video_start_date').val(moment().startOf('hour').format('YYYY-MM-DD HH:mm:ss'));
$('#video_end_date').val(moment().startOf('hour').add('month', 1).format('YYYY-MM-DD HH:mm:ss'));


// Bootstrap style file inputs
$('input[type=file]').bootstrapFileInput();

// Bootstrap style select inputs
$('.selectpicker').selectpicker();

// Change Status color on dropdown click
$(document).on('click', '.bootstrap-select .dropdown-menu li a', function() {
	var btn = $(this).parents('.bootstrap-select').find('button.btn:first');
	btn.removeClass()
		.addClass('btn dropdown-toggle btn-' + $(this).attr('class'));
});

// Status colors for non-forms
var statusColors = {
	'draft' : 'primary',
	'ready' : 'success',
	'active' : 'success',
};
$('div.status-btn').each(function() {
	var statusColor = statusColors[$(this).data('status')];
	if (!statusColor) statusColor = 'default';

	$(this).addClass('btn-' + statusColor);
});



// Image upload local thumbnails
$.each([ 'video', 'skin', 'channel' ], function( index, value ) {
	$('#' + value + '-thumbnail-input').localResize({
		dropTarget   : $('#' + value + '-thumbnail'),
		loadCallback : function(src) {
			this.dropTarget
				.removeClass('error')
				.addClass('prepped')
				.css({
					'background-image' : 'url(' + src + ')'
				});
		},
		errorCallback : function() {
			this.dropTarget
				.removeClass('prepped')
				.addClass('error')
				.css({
					'background-image': ''
				})
				.find('.text')
					.text('Not an image!');

			this.input.replaceWith($(this).val('').clone(true));
		}
	});
});

//end document.ready
});


// LocalResize plugin for image uploads, hand made <3
(function($){
	var LocalResize = function(element, options) {
		var elem = $(element),
		    obj  = this;

		// Merge options with defaults
		var settings = $.extend({
			maxWidth     : 0,
			maxHeight    : 0,
			input        : elem,
			dropTarget  : false,
			errorCallback : false,
			loadCallback : function() {}
		}, options || {});

		// Public method
		var loadImg = function(src) {
			var reader;

			if (!src.type.match(/image.*/)) {
				if ($.isFunction(settings.errorCallback)) {
					settings.errorCallback()
				} else {
					console.log("The dropped file is not an image: ", src.type);
				}
				return;
			}

			//	Create our FileReader and run the results through the render function.
			reader = new FileReader();
			reader.onload = function(e){
				settings.dropTarget.find('input[type="hidden"]').val(e.target.result);

				renderImg(e.target.result);
			};
			reader.readAsDataURL(src);
		};

		var renderImg = function(src) {
			if (settings.maxWidth === 0 && settings.maxHeight === 0) {
				settings.loadCallback(src);
				return;
			}

			var image = new Image();
			image.onload = function() {
				var canvas = document.getElementById('myCanvas'),
				    ctx    = canvas.getContext('2d');

				if (settings.maxWidth > 0 && image.width > settings.maxWidth) {
					image.width = settings.maxWidth;
					image.height *= settings.maxWidth / image.width;
				} else if (settings.maxHeight > 0 && image.height > settings.maxHeight) {
					image.width *= settings.maxHeight / image.height;
					image.height = settings.maxHeight;
				}

				ctx.clearRect(0, 0, canvas.width, canvas.height);
				canvas.width = image.width;
				canvas.height = image.height;
				ctx.drawImage(image, 0, 0, image.width, image.height);
			};
		}

		// Init
		if (!elem.is('input[type=file]'))
			return elem;

		elem.on('change', function() {
			loadImg(this.files[0]);
		});

		if (settings.dropTarget.jquery) {
			settings.dropTarget.on('dragenter dragover drop dragleave', function(e) {
				e.stopPropagation();
				e.preventDefault();

				if (e.type != 'drop') {
					settings.dropTarget.toggleClass('drop', (e.type == 'dragover' || e.type == 'dragenter'));
					return;
				}

				settings.dropTarget.removeClass('drop');

 				settings.input
					.replaceWith(settings.input.val('').clone(true));

				var file = e.originalEvent.dataTransfer.files[0],
				    name = settings.dropTarget.find('.file-input-name');

				if (!name.length) name = $('<span class="file-input-name" />').appendTo(settings.dropTarget);
				name.text(file.name)
					.attr('title', file.name);

				loadImg(file);
			});
		}

		// Return element for chaining
		return element;
	};

	$.fn.localResize = function(options) {
		return this.each(function() {
			var element = $(this);

			// Return early if this element already has a plugin instance
			if (element.data('localResize')) return;

			// pass options to plugin constructor
			var localResize = new LocalResize(this, options);

			// Store plugin object in this element's data
			element.data('localResize', localResize);
		});
	};
})(jQuery);