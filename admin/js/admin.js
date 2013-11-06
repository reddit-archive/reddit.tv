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
dateRangeCallback);

// Set start/end dates to default dates
$('input[id$="_start_date"]').val(moment().startOf('hour').format('YYYY-MM-DD HH:mm:ss'));
$('input[id$="_end_date"]').val(moment().startOf('hour').add('month', 1).format('YYYY-MM-DD HH:mm:ss'));


// Bootstrap style file inputs
$('input[type=file]').bootstrapFileInput();

// Bootstrap style select inputs
$('.selectpicker').selectpicker();

// Change Status color on dropdown click
$('.selectpicker').on('change', function() {
	var btn      = $(this).siblings('.bootstrap-select').find('button.btn:first'),
	    btnClass = $(this).find('option[value="' + $(this).val() + '"]').attr('class') || 'default';

	btn.removeClass()
		.addClass('btn dropdown-toggle btn-' + btnClass);
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

// Youtube embed code generation
$('input[name="db_video_url"]').on('keyup change', function() {
	var url = $(this).val(),
	    ta  = $(this).parent().find('.embed-code textarea'),
	    youtube;

	youtube = url.match(/^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/i);
	if (!youtube) return;

	youtubeThumb(youtube[1], $(this).parents('form').find('.thumbnail'));

	if (ta.val() != '') return;
	ta.val(generateEmbed(youtube[1]));
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

// Edit buttons
$('.btn-edit').on('click', function() {
	var pane = $(this).parents('.tab-pane'),
	    form = pane.find('form'),
	    item = $(this).parents('.item'),
	    id   = item.data('id'),
	    type = pane.attr('id');

	if (!id) return;

	$.ajax({
		data : {
			'ajax'   : 1,
			'action' : 'get',
			'type'   : type,
			'id'     : id
		},
		url: window.location.href.replace(/#.*$/, ''),
		dataType: "json",
		success: function(data) {
			$('<input />')
				.attr({
					type  : 'hidden',
					name  : 'edit',
					value : data.id
				})
				.appendTo(form);

			$.each(data, function( index, value ) {
				// console.log(index, value);
				var input = form.find('*[name="db_' + index + '"]');

				if (input.hasClass('skip')) return;
				if (input.is(':checkbox')) {
					input.prop('checked', (parseInt(value) == 1));
					return;
				}

				input.val(value);
				if (input.hasClass('selectpicker')) input.selectpicker('val', value);
			});

			if (data.image_url != '') {
				form.find('.upload.thumbnail')
					.removeClass('error')
					.addClass('prepped')
					.css('background-image', 'url(../' + data.image_url + ')');
			}

			if (data.video_list) {
				var video_list = JSON.parse(data.video_list);
				if ( $.isArray(video_list) ) {
					var dupe = $('#channel-vidlist li.video-input:first').clone(true);
					$('#channel-vidlist li.video-input').remove();

					$.each(video_list, function(i, value){
						var clone = dupe.clone(true);
						
						clone.find('input').val(value);
						clone.appendTo('#channel-vidlist ul');
					});
				}
			}

			$('.item').removeClass('edit');
			item.addClass('edit');
			form.addClass('edit')
			var submitBtn = form.find('button[type="submit"]'),
			    select    = form.find('.selectpicker');
			
			submitBtn.text(submitBtn.text().replace(/Add/i, 'Edit'));

			dateRangeCallback(
				moment($('#' + type + '_start_date').val()),
				moment($('#' + type + '_end_date').val()),
				form.find('.campaign-length')
			);
		},
		error: function(jXHR, textStatus, errorThrown) {
			console.log('[ERROR] '+textStatus);
			console.log('[ERROR] '+errorThrown);
		}
	});

	// console.log(ajax);
});

$('#add-channel-vid').click(function() {
	var vidList = $('#channel-vidlist ul'),
	    input   = vidList.find('li.video-input:first'),
	    dupe    = input.clone(true);

	    dupe
	    	.find('input')
	    	.val('');

	    vidList.append(dupe);

	    $('#channel-vidlist ul').sortable('refresh');
});

$( '#channel-vidlist ul' ).sortable({
	containment: '#channel-vidlist > div',
	placeholder: 'video-input',
	connectWith: '#channel-vid-delete',
	start: function() {
		$('#channel-vidlist').addClass('dragging');
	},
	stop: function() {
		$('#channel-vidlist').removeClass('dragging');
	}
});

$('#channel-vid-delete').droppable({
	accept: '#channel-vidlist li',
	hoverClass: 'hover',
	drop: function( event, ui ) {
		if ($('#channel-vidlist li').length == 2) return; // Last item and placeholder
		$(ui.draggable).remove();
	}
});

$('button.btn-show-videos').click(function() {
	var par = $(this).parent(),
	    def = 'btn-default',
	    pri = 'btn-primary';

	if ( par.hasClass('show-videos') ) {
		par.removeClass('show-videos');
		$(this).removeClass(pri).addClass(def);
	} else {
		par.addClass('show-videos');
		$(this).removeClass(def).addClass(pri);
	}
});

$( '#default-channels ul' ).sortable({
	containment: '#default-channels',
	placeholder: 'channel col-lg-3',
	connectWith: '#default-vid-delete',
	start: function() {
		$('#default-channels').addClass('dragging');
	},
	stop: function() {
		$('#default-channels').removeClass('dragging');
	}
});

$('#default-vid-delete').droppable({
	accept: '#default-channels li',
	hoverClass: 'hover',
	drop: function( event, ui ) {
		// if ($('#channel-vidlist li').length == 2) return; // Last item and placeholder
		$(ui.draggable).remove();
	}
});

$('#add-default-channel').click(function() {
	var input = $('#default-channels input[type="text"]'),
		val   = input.val();

	alert(val);
	// if ()

	return false;
})

//end document.ready
});

function dateRangeCallback(start, end, ele) {
	if (this.element) ele = $(this.element);
	var type = ele.attr('id').replace(/-length/, '');
	$('#' + type + '_start_date').val(start.format('YYYY-MM-DD HH:mm:ss'));
	$('#' + type + '_end_date').val(end.format('YYYY-MM-DD HH:mm:ss'));

	ele.val(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
}

function generateEmbed(id) {
	var code = '<object type="application/x-shockwave-flash" width="100%" height="100%" data="http://www.youtube.com/v/#ID#?hd=1&amp;showsearch=0&amp;version=3&amp;modestbranding=1">' +
        '<param name="movie" value="http://www.youtube.com/v/#ID#?hd=1&amp;showsearch=0&amp;version=3&amp;modestbranding=1" />' +
        '<param name="allowFullScreen" value="true" />' +
        '<param name="allowscriptaccess" value="always" />' +
        '</object>';

    return code.replace(/#ID#/g, id);
}

function youtubeThumb(id, ele) {
	if (ele.css('background-image') != 'none') return;

	$.ajax({
		url: '../db/api.php?action=youtube_thumbnail&base64=1&id=' + id,
		dataType: "json",
		success: function(data) {
			ele
				.removeClass('error')
				.addClass('prepped')
				.css('background-image', 'url(' + data.image + ')');

			ele.find('input[name="b64_image"]').val(data.image);
		},
		error: function(jXHR, textStatus, errorThrown) {
			console.log('[ERROR] '+textStatus);
			console.log('[ERROR] '+errorThrown);
		}
	});
}

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