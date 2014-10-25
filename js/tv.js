var RedditTV = Class.extend({
	init: function() {
		self = this;

		self.Globals = $.extend({}, {
			/* Current URL for AJAX, etc */
			current_url: window.location.protocol + '//' + window.location.host + window.location.pathname,

			/* build uri for search type channels */
			search_str: (function () {
				var one_day = 86400,
					date = new Date(),
					unixtime_ms = date.getTime(),
					unixtime = parseInt(unixtime_ms / 1000);
				return "search/.json?q=%28and+%28or+site%3A%27youtube.com%27+site%3A%27vimeo.com%27+site%3A%27youtu.be%27%29+timestamp%3A"+(unixtime - 5*one_day)+"..%29&restrict_sr=on&sort=top&syntax=cloudsearch";
			})(),

			/* Channels Object */
			channels: [],

			/* Video Domains */
			domains: [
				'5min.com', 'abcnews.go.com', 'animal.discovery.com', 'animoto.com', 'atom.com',
				'bambuser.com', 'bigthink.com', 'blip.tv', 'break.com',
				'cbsnews.com', 'cnbc.com', 'cnn.com', 'colbertnation.com', 'collegehumor.com',
				'comedycentral.com', 'crackle.com', 'dailymotion.com', 'dsc.discovery.com', 'discovery.com',
				'dotsub.com', 'edition.cnn.com', 'escapistmagazine.com', 'espn.go.com',
				'fancast.com', 'flickr.com', 'fora.tv', 'foxsports.com',
				'funnyordie.com', 'gametrailers.com', 'godtube.com', 'howcast.com', 'hulu.com',
				'justin.tv', 'kinomap.com', 'koldcast.tv', 'liveleak.com', 'livestream.com',
				'mediamatters.org', 'metacafe.com', 'money.cnn.com',
				'movies.yahoo.com', 'msnbc.com', 'nfb.ca', 'nzonscreen.com',
				'overstream.net', 'photobucket.com', 'qik.com', 'redux.com',
				'revision3.com', 'revver.com', 'schooltube.com',
				'screencast.com', 'screenr.com', 'sendables.jibjab.com',
				'spike.com', 'teachertube.com', 'techcrunch.tv', 'ted.com',
				'thedailyshow.com', 'theonion.com', 'traileraddict.com', 'trailerspy.com',
				'trutv.com', 'twitvid.com', 'ustream.com', 'viddler.com', 'video.google.com',
				'video.nationalgeographic.com', 'video.pbs.org', 'video.yahoo.com', 'vids.myspace.com', 'vimeo.com',
				'wordpress.tv', 'worldstarhiphop.com', 'xtranormal.com',
				'youtube.com', 'youtu.be', 'zapiks.com'
				],

			sorting: 'hot',

			videos: [],
			user_channels: [],
			channel_sorting: [],
			video_minimum: 10,
			cur_video: 0,
			cur_chan: {},
			cur_chan_req: null,
			cur_vid_req: null,
			current_anchor: '',
			auto: true,
			sfw: true,
			shuffle: false,
			shuffled: [],
			videoListMouse: false,

			ads: {}
		}, Globals); // end Globals

		// Load ads
		self.Globals.videos['/sponsor'] = { 'video': [] };
		self.apiCall('ads', null, function(data) {
			self.Globals.ads = data;
			self.Globals.videos['/sponsor'].video = self.formatAdVideos(data.videos);
			$(document).trigger('adsLoaded');
		});

		if (!self.Globals.channels) {
			self.Globals.channels = [];
		}
		if (!self.Globals.sponsored_channels) {
			self.Globals.sponsored_channels = [];
		}

		// Load sponsored channel
		var sponsored_channels = self.Globals.sponsored_channels;
		if(sponsored_channels.length >= 1){
			self.Globals.sponsored_channels = self.formatSponsoredChannels(sponsored_channels);
			for(c in sponsored_channels){
				self.Globals.videos[sponsored_channels[c].feed] = {
					video: sponsored_channels[c].videos
				};
			}
		}

		$('#video-list').hide();

		self.loadSettings();
		self.displayChannels();
		self.setBindings();

		if (!self.Globals.current_anchor) {
			var firstChannel = $('#channels a.channel:not(#add-channel-button):first');
			if (firstChannel.length) self.loadChannel(self.getChanObj(firstChannel.data('feed')), null);
		}

		if (self.isiPad) $('html').addClass('os-iPad');
	}, // init()

	loadSettings: function() {
		var channels_cookie = $.jStorage.get('user_channels'),
			auto_cookie = $.jStorage.get('auto'),
			sfw_cookie = $.jStorage.get('sfw'),
			shuffle_cookie = $.jStorage.get('shuffle'),
			sorting_cookie = $.jStorage.get('channel_sorting');

		if(auto_cookie !== null && auto_cookie !== self.Globals.auto){
			self.Globals.auto = (auto_cookie === 'true') ? true : false;
		}
		if(shuffle_cookie !== null && shuffle_cookie !== self.Globals.shuffle){
			self.Globals.shuffle = (shuffle_cookie === 'true') ? true : false;
		}
		if(sfw_cookie !== null && sfw_cookie !== self.Globals.sfw){
			self.Globals.sfw = (sfw_cookie === 'true') ? true : false;
		}
		$('#sorting a[href="#sort=' + self.Globals.sorting + '"]').addClass('active');

		// Mark settings as active
		var settingNames = ['auto', 'shuffle', 'sfw'];
		settingNames.forEach(function(i) {
			if (self.Globals[i])
				$('#settings .settings-' + i).addClass('active').find('input').attr('checked', true);
		});

		if (sorting_cookie !== null && sorting_cookie !== self.Globals.channel_sorting) {
			self.Globals.channel_sorting = sorting_cookie;
		}

		if(channels_cookie !== null && channels_cookie !== self.Globals.user_channels){
			self.Globals.user_channels = channels_cookie;
			self.convertUserChannels();
			self.Globals.channels = self.Globals.user_channels.concat(self.Globals.channels);
		}
	}, // loadSettings()

	setBindings: function() {
		$('#settings .settings-auto input').change(function() {
			self.Globals.auto = ($(this).is(':checked')) ? true : false;
			$.jStorage.set('auto', self.Globals.auto);
		});
		$('#settings .settings-shuffle input').change(function() {
			self.Globals.shuffle = ($(this).is(':checked')) ? true : false;
			self.Globals.shuffled = []; //reset
			$.jStorage.set('shuffle', self.Globals.shuffle);
		});
		$('#settings .settings-sfw input').change(function() {
			self.Globals.sfw = ($(this).is(':checked')) ? true : false;
			if(!self.Globals.sfw){
				if(!confirm("Are you over 18?")){
					$(this).removeClass('active').find('input').prop("checked", true);
					self.Globals.sfw = true;
				}
			}
			$.jStorage.set('sfw', self.Globals.sfw);
			self.showHideNsfwThumbs(self.Globals.sfw);
		});
		$('#settings #hax a').click(function() {
			window.open($(this).attr('href'));
		});
		$('#next-button, #prev-button').click(function() {
			var direction = (this.id == 'next-button') ? 'next' : 'prev';

			self.gaEventTrack('Video', 'Skip', self.curVideoTitle());
			self.gaEventTrack('Channel', 'Skip', self.Globals.cur_chan.feed);

			self.loadVideo(direction);
		});
		$('#video-list').bind('mousewheel', function(event,delta){
			this.scrollLeft -= (delta * 30);
			event.preventDefault();
		});
		$('#sorting a').click(function() {
			if ($(this).hasClass('active')) return false;
			
			$('#sorting').removeClass('open')
				.find('a').removeClass('active');
			$(this).addClass('active');
			
			self.Globals.sorting = $(this).attr('href').replace(/^.*#sort=/, '')
			self.Globals.videos = [];
			loadChannel(self.Globals.channels[self.Globals.cur_chan], null);

			return false;
		});

		$(document).keydown(function (e) {
			if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return true;

			if(!$(e.target).is('form>*, input')) {
				var keyCode = e.keyCode || e.which, arrow = {left: 37, up: 38, right: 39, down: 40 };
				switch (keyCode) {
				case arrow.left:  case 72: // h
					self.loadVideo('prev');
					break;
				case arrow.right: case 76: // l
					self.loadVideo('next');
					break;
				case arrow.up:	case 75: // k
					self.changeChan('up');
					break;
				case arrow.down:  case 74: // j
					self.changeChan('down');
					break;
				case 32: // space
					self.togglePlay();
					break;
				case 67: // c
					window.open($('#video-title>a').attr('href'), '_blank');
					break;
				}
				return false;
			}
		});

		/* Anchor Checker */
		if("onhashchange" in window){
			self.checkAnchor(); //perform initial check if hotlinked
			window.onhashchange = function(){
				self.checkAnchor();
			};
		}else{
			setInterval(self.checkAnchor, 100);
		}

		// Video thumbnail onClicks
		$('#video-list').on(
			'click',
			'.thumbnail',
			function() {
				$(this).addClass('focus').blur();
				self.Globals.videoListMouse = false;
				self.Globals.videoListCloseTimeout = window.setTimeout(self.closeVideoList, 1000);


				if ( $(this).hasClass('sponsored') ) {
					self.loadVideo(parseInt($(this).attr('data-adNum')), $(this).attr('data-unique'));
				}
			}
		);

		// Channel thumbnail onClicks
		$('#channels').on(
			'click',
			'a.channel',
			function() {
				$('#channels a.channel').removeClass('focus');
				$(this).addClass('focus');
			}
		);

		// Channel thumbnail delete onClicks
		$('#channels').on(
			'click',
			'a.channel span.delete',
			function() {
				var thumb  = $(this).parent(),
				    anchor = $(this).parents('a.channel'),
				    confirm;

				anchor.addClass('deleting');
				confirm = $('<div class="delete confirm">Are you sure you want to delete this channel?<button type="button" class="btn btn-primary" title="Delete">YES</button></div>');
				thumb.append(confirm);
				confirm.hide().fadeIn(100);

				return false;
			}
		);

		// Channel thumbnail delete bindings
		$('#channels').on(
			'click',
			'a.channel.deleting button',
			function() {
				var anchor    = $(this).parents('a.channel'),
				    feed      = anchor.data('feed'),
				    deleted   = self.removeChannel(feed),
				    isCurChan = (self.Globals.cur_chan.feed == feed);

				if (deleted && isCurChan) {
					anchor
						.addClass('temp')
						.removeClass('deleting')
						.find('.thumbnail span.delete')
							.attr({
								'class': 'add',
								'title': 'Add this channel permanently'
							})
							.text('+');

					anchor.find('.thumbnail .confirm').fadeOut(100, function() {
						$(this).remove();
					});
				}

				if (deleted && !isCurChan) {
					anchor.transition({
						scale   : 0,
						opacity : 0
					}, 300, function() {
						$(this).remove();

						self.bindChannelSorting(true);
					});
				}

				self.saveChannelOrder();

				return false;
			}
		);

		// Remove deletion confirmation on mouseleave
		$('#channels').on(
			'mouseleave',
			'a.channel.deleting',
			function() {
				var thumb  = $(this).find('.thumbnail');

				$(this).removeClass('deleting');
				$(this).find('.thumbnail .confirm').fadeOut(100, function() {
					$(this).remove();
				});
			}
		);

		// Channel thumbnail add onClicks
		$('#channels').on(
			'click',
			'a.channel span.add',
			function() {
				var thumb  = $(this).parent(),
				    anchor = $(this).parents('a.channel'),
				    feed   = anchor.data('feed');

				self.addChannel(feed);

				return false;
			}
		);

		// Header click to open/close
		$('#header-container').on('click', function(event) {
			if ( !$(event.target).parents('#settings').length ) // Click isn't in settings panel
				self.toggleVideoList(true);
		});

		// VidList tooltips
		$('#video-list').on(
			'mouseenter mouseleave',
			'.thumbnail',
			function(e) {
				if (e.type == 'mouseenter') {
					if ( !$(this).attr('title') || $('#video-list').hasClass('scrolling')) return; // Don't show tooltips while scrolling

					var toolTip = $('#vid-list-tooltip'),
						toolTipPos = 0,
						title = $(this).attr('title'),
						toolTipCss = { 'z-index': 9001, 'left': '', 'right': '' };

					$(this).data('title', $(this).attr('title'));
					$(this).attr('title', '');
					toolTip.show().html(title);
					toolTipPos = $(this).offset().left;
					toolTipCss.left = (toolTipPos < 0) ? 0 : toolTipPos;
					if ($(document).width() - toolTipPos <= 150) {
						toolTipCss.left = '';
						toolTipCss.right = 0;
					}
					toolTip.css(toolTipCss);
				} else if (e.type == 'mouseleave') {
					$(this).attr('title', $(this).data('title'));
					$('#vid-list-tooltip').hide();
				}
			}
		);

		$('#add-channel-button, #video-return').click(self.toggleAddChannel);

		$('#add-channel form').on('submit', self.addChannelFromForm);

		$('#toggle-settings').click(function() {
			$('#settings').toggleClass('open');
		});

		$('#add-channel input.channel-name').on('keyup', function() {
			self.addChannelName();

			// Only continue if the value has changed, no arrow keys, etc
			if ( $(this).data('val') == $(this).val() ) return;
			$(this).data('val', $(this).val());

			$('#add-channel-message').text('');
			$('#add-channel').addClass('disabled');

			window.clearTimeout(self.Globals.addChannelCheck);
			self.Globals.addChannelCheck = window.setTimeout(self.addChannelCheck, 500);
		});

		var recs = (!self.Globals.recommended_channels) ? [] : self.Globals.recommended_channels;
		$.each(recs, function(i, channel) {
			var anchor, thumb, name;

			if (i >= 8) return; // Only display the first 8

			anchor = $('<a />')
				.addClass('grid-25 channel')
				.attr({
					href : '#',
					'data-feed' : channel.feed
				})
				.appendTo('#add-channel .recommended.channels');

			thumb = $('<div class="thumbnail" />')
						.css({
							'background-image' : 'url(' + channel.thumbnail + ')'
						})
						.appendTo(anchor);

			name = $('<span class="name" />')
						.text(channel.channel)
						.appendTo(anchor);

			anchor.on('click', function() {
				$('#add-channel input.channel-name')
					.val( $(this).attr('data-feed').replace(/^\/\w+\//, '') )
					.focus();

				$('#add-channel .recommended.channels').fadeOut(200);
				$('#add-channel .channel-to-add .channel').remove();
				self.addChannelName();
				self.addChannelCheck();

				return false;
			});
		});

		$('header').mouseenter(function(){
			self.Globals.videoListMouse = true;
			self.Globals.videoListOpenTimeout = window.setTimeout(self.videoListOpenTimeout, 500);
		});
		$('#settings').mouseenter(function(){
			self.Globals.videoListMouse = false;
		});
		$('header').mouseleave(function(){
			self.Globals.videoListMouse = false;
			self.Globals.videoListCloseTimeout = window.setTimeout(self.videoListCloseTimeout, 1000);
		});
	}, // setBindings()

	bindChannelSorting: function(animate) {
		var channels = $('#channels');
		
		if (animate) channels.addClass('animate');

		if ( !$('#channels[class*="shapeshifted_container"]').length )
			channels.on('ss-arranged', self.saveChannelOrder);

		channels.shapeshift({
			selector: 'a.channel',
			ignore: '#add-channel-button',
			align: 'center',
			columns: 4,
			minColumns: 4,
			gutterX: 0,
			gutterY: 0,
			paddingX: 0,
			paddingY: 0,
		});

		if (animate) channels.removeClass('animate');
	}, // bindChannelSorting()

	convertUserChannels: function() {
		// Convert old reddit.tv user_channels cookie into new style one
		var uc = self.Globals.user_channels;

		if ( !uc.length ) return;
		if ( uc[0].owner ) return;

		for (var i in uc) {
			self.Globals.user_channels[i].owner = 'user';
		}

		$.jStorage.set('user_channels', self.Globals.user_channels);
	}, // convertUserChannels()

	saveChannelOrder: function() {
		var feeds = [];
		var feed;
		$('#channels a.channel:not(#add-channel-button):not(.temp)').each(function() {
			feed = $(this).data('feed');
			if (!feed.match(/^\/sponsor\//)) {
				feeds.push(feed);
			}
		});

		self.Globals.channel_sorting = feeds;

		if (self.Globals.channels.length > feeds.length) {
			$.each(self.Globals.channels, function(i, chan) {
				if (self.Globals.channel_sorting.indexOf(chan.feed) == -1)
					self.Globals.channel_sorting.push(chan.feed);
			});
		}

		$.jStorage.set('channel_sorting', self.Globals.channel_sorting);
	}, // saveChannelOrder()

	displayChannels: function() {
		var sorted = (self.Globals.channel_sorting.length);
		var sponsoredChannels = self.Globals.sponsored_channels;
		var channels = (sorted) ? self.Globals.channel_sorting : self.Globals.channels;
		
		if (sorted) {
			channels = $.map(channels, function(feed) {
				return self.getChanObj(feed);
			});
		}

		$.each(sponsoredChannels, function(i, chan) {
			var n = 2 + i * 4;
			channels.splice(n, 0, chan);
		});

		$.each(channels, function(i, chan) {
			if (!chan.feed) {
				return;
			}
			self.displayChannel(chan);
		});

		self.bindChannelSorting();
	}, // displayChannels()

	displayChannel: function(chan, added) {
		var $channel_base = $('#add-channel-button'),
			$channel = $channel_base.clone().removeAttr('id'),
			title, display_title, class_str='', remove_str='';

		chan_title = chan.feed.split("/");
		chan_title = "/"+chan_title[1]+"/"+chan_title[2];

		if ( !chan.channel ) chan.channel = chan_title.replace(/^.*\//, '');

		display_title = chan.channel.length > 20 ?
			chan.channel.replace(/[aeiou]/gi,'').substr(0,20) :
			chan.channel;
		display_title = chan.channel; // Let's not shorten the titles that way right now

		var chanAttr = {
				href: '#' + chan.feed,
				title: chan_title,
				'data-feed' : chan.feed
			};

		if (chan.owner) {
			var ownerClass = chan.owner;
			if (chan.owner == 'temp') ownerClass += ' user';
			$channel.addClass(ownerClass);

			chanAttr['data-owner'] = chan.owner;

			var spanHtml = {
				'user' : '<span class="delete" title="Delete this channel">&times;</span>',
			    'temp' : '<span class="add" title="Add this channel permanently">+</span>'
			};
	
			if (spanHtml[chan.owner])
				$channel.find('.thumbnail')
					.append(spanHtml[chan.owner]);
		}

		$channel
			.show()
			.attr(chanAttr)
			.find('.name')
				.html(display_title);

		if (added) {
			$channel.insertAfter('#add-channel-button');
		} else {
			$channel.appendTo('#channels');
		}

		if (chan.thumbnail) {
			$channel.find('.thumbnail')
				.css({
					'background-image': 'url(' + chan.thumbnail + ')'
				});
		}

		if ( !chan.thumbnail || chan.owner == 'user' ) { // get the newest thumbnail if it's a user channel
			self.apiCall(
				'channel_thumbnail',
				{ 'feed' : chan.feed },
				function(data) {
					var channel   = data[0],
						thumb	  = channel.thumbnail_url,
						chanIndex = self.getChan(channel.feed),
						chanObj   = self.Globals.channels[chanIndex];

					if (!thumb || thumb == '') return;

					if (chanObj) {
						chanObj.thumbnail = thumb;
						if (chanObj.owner == 'user') {
							self.Globals.user_channels[chanIndex] = chanObj;
							$.jStorage.set('user_channels', self.Globals.user_channels);
						}
					}
					$('#channels a.channel[data-feed="' + channel.feed + '"]').find('.thumbnail')
						.css({
							'background-image': 'url(' + thumb + ')'
						});

				}
			);
		}

		if (added == true) {
			self.bindChannelSorting(true);
			$channel.css({
				scale   : 0,
				opacity : 0
			})
			.delay(300)
			.transition({
				scale   : 1,
				opacity : 1
			}, 300);
		}

		return $channel;

	}, // displayChannel()

	loadChannel: function(channel, video_id) {
		var $video_embed = $('#video-embed'),
			$video_title = $('#video-title'),
			this_chan, title, getChan, anchor;

		if (!video_id) video_id = null;

		getChan = self.getChanObj(channel.feed);
		this_chan = (getChan) ? getChan : channel;

		anchor = $('#channels a.channel[data-feed="' + this_chan.feed + '"]');
		if ( !anchor.length ) {
			this_chan.owner = 'temp';
			anchor = self.displayChannel(this_chan, true);
		}
		anchor.addClass('focus');

		self.Globals.shuffled = [];
		self.Globals.cur_chan = this_chan;
		
		$('#prev-button,#next-button').css({ 'visibility':'hidden', 'display':'none' });
		$('#vote-button').empty();
		$('#video-source').empty();

		title = channel.feed.split("/");
		title = "/"+title[1]+"/"+title[2];

		$video_title.html('Loading '+title+' ...');
		var thumbId = video_id;
		if (!thumbId) {
			var vidFeed = self.Globals.videos[channel.feed];
			if (vidFeed && vidFeed.video && vidFeed.video.length) thumbId = vidFeed.video[0].id;
		}
		var loadingThumb = (!thumbId && this_chan.thumbnail) ? this_chan.thumbnail : self.getThumbnailUrl(channel, thumbId);
		self.loadingAnimation(title, loadingThumb);
		$video_embed.empty();

		var npTitle = self.Globals.cur_chan.feed;
		if (self.Globals.cur_chan.channel) npTitle = self.Globals.cur_chan.channel + ' - ' + npTitle;
		$('#now-playing-title').empty().append(npTitle+" &#9660;");

		
		if(self.Globals.videos[this_chan.feed] === undefined){
			self.redditApiCall('videos', { 'channel': this_chan, 'video_id': video_id },
				function(data, local) {
					var this_chan = local.channel,
					    video_id  = local.video_id;

					if (self.Globals.videos[this_chan.feed].video.length > 0) {
						if (video_id !== null) {
							self.loadVideoById(video_id);
						} else {
							self.loadVideoList(this_chan);
							self.Globals.cur_video = 0;
							self.loadVideo('first');
						}
					}

					self.gaEventTrack('Channel', 'Load', this_chan.feed);
				},
				function(jXHR, textStatus, errorThrown, local) {
					var this_chan = local.channel,
					    error     = 'Error loading channel.';

					if (this_chan && this_chan.video_count === 0) 
						error = 'No videos found in ' + this_chan.feed;

					self.tvError(error);
				});
		}else{
			if(self.Globals.videos[this_chan.feed].video.length > 0){
				if(video_id !== null){
					self.loadVideoById(video_id);
				}else{
					self.loadVideoList(this_chan);
					self.Globals.cur_video = 0;
					self.loadVideo('first');
				}

				self.gaEventTrack('Channel', 'Load', this_chan.feed);
			}
		}
	}, // loadChannel()

	getFeedURI: function(req) {
		var domain     = 'http://www.reddit.com',
		    sorting    = self.Globals.sorting.split(':'),
		    sortType   = '',
		    sortOption = '',
		    extras     = '',
		    limit      = 100,
		    channel_obj, uri;

		if (typeof req == 'string') { // video ID
			uri = '/by_id/t3_' + req + '.json';
			return domain + uri;
		}

		channel_obj = req;

		if (channel_obj.video_count < self.Globals.video_minimum) {
			limit = 1000;
			if (channel_obj.last_id) extras = '&after=' + channel_obj.last_id;
		}

		if (sorting.length === 2) {

			sortType = sorting[0] + '/';
			sortOption = '&t=' + sorting[1];
		}

		if (channel_obj.type === 'search' && sorting.length === 1) {

			uri = channel_obj.feed + Globals.search_str + '&limit=' + limit;
		}
		else {

			uri = channel_obj.feed + sortType + '.json?limit=' + limit + sortOption;
			// Can we do this with searching? sortType seems in the way.
			// uri = channel_obj.feed + sortType."/search/.json?q=%28and+%28or+site%3A%27youtube.com%27+site%3A%27vimeo.com%27+site%3A%27youtu.be%27%29+timestamp%3A1382227035..%29&restrict_sr=on&sort=top&syntax=cloudsearch&limit=100";

		}

		uri += extras;

		return domain + uri;
	}, // getFeedURI()

	isVideo: function(video_domain) {
		return (self.Globals.domains.indexOf(video_domain) !== -1);
	},

	isEmpty: function(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop)){
				return false;
			}
		}
		return true;
	}, // isEmpty()

	filterVideoDupes: function(arr) {
		var i, out=[], obj={}, original_length = arr.length;
		
		// work from last video to first video (so hottest dupe is left standing)
		// first pass on media embed
		for (i=arr.length-1; i>=0; i--) {
			if(typeof obj[arr[i].media_embed.content] !== 'undefined'){
				delete obj[arr[i].media_embed.content];
			}
			obj[arr[i].media_embed.content]=arr[i];
		}
		for (i in obj) {
			out.push(obj[i]);
		}

		arr = out.reverse();
		out = [];
		obj = {};

		//second pass on url
		for (i=arr.length-1; i>=0; i--) {
			if(typeof obj[arr[i].url] !== 'undefined'){
				delete obj[arr[i].url];
			}
			obj[arr[i].url]=arr[i];
		}
		for (i in obj) {
			out.push(obj[i]);
		}

		return out.reverse();
	}, // filterVideoDupes()

	findVideoById: function(id,chan) {
		for(var x in self.Globals.videos[chan].video){
			if(self.Globals.videos[chan].video[x].id === id){
				return Number(x); //if found return array pos
			}
		}
		return false; //not found
	}, // findVideoById()

	sfwCheck: function(video, chan) {
		return (self.Globals.sfw && self.Globals.videos[chan].video[video].over_18);
	},

	showHideNsfwThumbs: function(sfw) {
		$('.nsfw_thumb').toggleClass('visible', !sfw);
	},

	getThumbnailUrl: function(chan, video_id) {
		var video;
		if (typeof chan == 'object') {
			if (!chan.video) return false;
 			video = chan.video[video_id];
		} else {
			if (!self.Globals.videos[chan].video) return false;
			video = self.Globals.videos[chan].video[video_id];
		}

		if (video.media.oembed) {
			return video.media.oembed.thumbnail_url !== undefined ? 
				video.media.oembed.thumbnail_url :
				'img/noimage.png';
		}
		else {
			return 'img/noimage.png';
		}
	}, // getThumbnailUrl()

	createEmbed: function(url, type){
		switch(type){
		case 'youtube.com': case 'youtu.be':
			return youtube.createEmbed(url);
		case 'vimeo.com':
			return vimeo.createEmbed(url);
		default:
			return false;
		}
	}, // createEmbed()

	prepEmbed: function(embed, type) {
		// Flash and z-index on Windows fix
		if (!embed.match(/wmode/))
			embed = embed
				.replace(/<embed /, '<embed wmode="opaque" ')
				.replace(/<\/object>/, '<param name="wmode" value="opaque" /></object>');

		switch(type){
		case 'youtube.com': case 'youtu.be':
			return youtube.prepEmbed(embed);
		case 'vimeo.com':
			return vimeo.prepEmbed(embed);
		case 'size':
			embed = embed.replace(/height\="(\d\w+)"/gi, 'height="100%"');
			embed = embed.replace(/width\="(\d\w+)"/gi, 'width="100%"');
		}
		
		return embed;
	}, // prepEmbed()

	addListeners: function(type) {
		switch (type) {
			case 'vimeo.com':
				vimeo.addListeners();
		}
	}, // addListeners()

	apiCall: function(action, data, successCallback, errorCallback) {
		var apiData = $.extend({ 'action' : action }, (typeof data != 'object') ? {} : data );

		if ( !$.isFunction(successCallback) ) successCallback = function(){};
		if ( !$.isFunction(errorCallback) )   errorCallback   = function(){};

		$.ajax({
			url: self.Globals.current_url + 'db/api.php',
			data: apiData,
			dataType: 'json',
			success: successCallback,
			error: function(jXHR, textStatus, errorThrown) {
				console.log('[apiCall]', action);
				console.log('[ERROR]', textStatus);
				console.log('[ERROR]', errorThrown);
				errorCallback(jXHR, textStatus, errorThrown);
			}
		});
	}, // apiCall()

	redditApiCall: function(action, data, successCallback, errorCallback) {
		var last_req = self.Globals.cur_chan_req,
		    successFuncs, redditApiError;

		if ( !$.isFunction(successCallback) ) successCallback = function(){};
		if ( !$.isFunction(errorCallback) )   errorCallback   = function(){};

		if (last_req !== null) last_req.abort();

		successFuncs = {
			'video' : function(data, textStatus) {
					var this_chan = this.data.channel,
					    video     = data.data.children[0].data;

					if ( !self.isEmpty(video.media_embed) && self.isVideo(video.media.type) ) {
						self.Globals.videos[this_chan.feed].video.splice(0, 0, video);
					}

					self.loadVideoList(this_chan);
					self.loadVideo('first');
				},
			'videos' : function(data, textStatus) {
					var this_chan  = this.data.channel,
					    chan_index = self.getChan(this_chan.feed);

					if ( !this_chan.video_count ) this_chan.video_count = 0;
					this_chan.page = (this_chan.page) ? this_chan.page + 1 : 1;

					//clear out stored videos if not grabbing more videos
					if ( !this_chan.last_id || !self.Globals.videos[this_chan.feed] ) {
						self.Globals.videos[this_chan.feed] = {};
						self.Globals.videos[this_chan.feed].video = [];
					}

					for (var x in data.data.children) {
						if ( !this_chan.channel ) this_chan.channel = data.data.children[x].data.subreddit;

						if (self.isVideo(data.data.children[x].data.domain) && (data.data.children[x].data.score > 0)) {
							if ( self.isEmpty(data.data.children[x].data.media_embed) || data.data.children[x].data.domain === 'youtube.com' || data.data.children[x].data.domain === 'youtu.be' ){
								var created = self.createEmbed(data.data.children[x].data.url, data.data.children[x].data.domain);
								if (created !== false) {
									data.data.children[x].data.media_embed.content = created.embed;
									data.data.children[x].data.media = {};
									data.data.children[x].data.media.oembed = {};
									data.data.children[x].data.media.oembed.thumbnail_url = created.thumbnail;
								}
							}
							if (data.data.children[x].data.media_embed.content) {
								self.Globals.videos[this_chan.feed].video.push(data.data.children[x].data);
							}
						}

						this_chan.last_id = data.data.children[x].data.name;
					}

					//remove duplicates
					self.Globals.videos[this_chan.feed].video = self.filterVideoDupes(self.Globals.videos[this_chan.feed].video);
					this.data.videos = self.Globals.videos[this_chan.feed].video;
					this.data.data = data;

					if (!this_chan.owner) this_chan.owner = 'temp';
					if (!chan_index) chan_index = self.Globals.channels.length;
					this_chan.video_count += this.data.videos.length;
					self.Globals.channels[chan_index] = this_chan;

					if (data.data.children.length && this.data.videos.length < self.Globals.video_minimum) {
						var moreVideos = true;

						if (this_chan.page >= 5) {
							if (this_chan.video_count == 0) {
								redditApiError(null, textStatus, null, this.data);
							} else {
								moreVideos = false;
							}
						} else {
							self.redditApiCall(this.action, this.data, this.successCallback, this.errorCallback);
						}
					}

					if (moreVideos) return;

					successCallback(data, this.data);

					$('body').removeClass('video-loading');
				}
		}; // successFuncs{}

		redditApiError = function(jXHR, textStatus, errorThrown, local) {
			console.log('[redditApiError]', jXHR, textStatus, errorThrown);
			errorCallback(jXHR, textStatus, errorThrown, local);

			$('body').removeClass('video-loading');
		};

		if (action == 'video' || action == 'videos') {
			var video_id       = data.video_id,
			    this_chan      = data.channel,
			    defaultSuccess = successFuncs[action],
			    uri_req;

			uri_req = (action == 'video') ? video_id : this_chan;

			self.Globals.cur_chan_req = $.ajax({
				url: self.getFeedURI(uri_req),
				dataType: 'jsonp',
				jsonp: 'jsonp',
				timeout: 5000, // Server doesn't return JSON on error, have to rely on this.
				context: { 'action' : action, 'data' : data, 'successCallback' : successCallback, 'errorCallback' : errorCallback },
				success: defaultSuccess
			});
		} // action == videos

		self.Globals.cur_chan_req.error(function(jXHR, textStatus, errorThrown) {
			redditApiError(jXHR, textStatus, errorThrown, this);
		});
	}, // redditApiCall()

	checkAnchor: function() {
		/* Anchor Checker */
		//check fo anchor changes, if there are do stuff
		if(self.Globals.current_anchor === document.location.hash)
			return false;

		self.Globals.current_anchor = document.location.hash;
		if(!self.Globals.current_anchor)
			return false;

		var anchor = self.Globals.current_anchor.substring(1);
		var parts = anchor.split("/"); // #/r/videos/id
		parts = $.map(parts, self.stripHTML);

		var feed     = '/' + parts[1] + '/' + parts[2],
		    new_chan = { 'feed': feed },
		    videoId  = parts[3];

		if (videoId === undefined || videoId === null || videoId === '')
			videoId = null;

		if (self.Globals.cur_chan.feed != feed) {
			self.loadChannel(new_chan, videoId);
		} else {
			if (self.Globals.videos[feed] !== undefined){
				self.loadVideoById(videoId);
			} else {
				self.loadChannel(new_chan, videoId);
			}
		}
	}, // checkAnchor()

	getChanName: function(feed) {
		var channels = self.Globals.user_channels.concat(self.Globals.channels);
		for(var x in channels){
			if(channels[x].feed.indexOf(feed) !== -1){
				return channels[x].channel;
			}
		}
		return false;
	}, // getChanName()

	getChan: function(channel) {
		var channelList = self.Globals.channels
		for(var x in channelList){
			if(channelList[x].feed === channel){
				return x;
			}
		}
		return false;
	}, // getChan()

	getChanObj: function(channel) {
		var getChan = self.getChan(channel);
		return (getChan !== false) ? self.Globals.channels[getChan] : getChan;
	}, // getChanObj()

	videoListCloseTimeout: function() {
		window.clearTimeout(self.Globals.videoListCloseTimeout);
		if (self.Globals.videoListMouse == false)
			self.closeVideoList();
	}, // videoListCloseTimeout()

	videoListOpenTimeout: function() {
		if(self.Globals.videoListMouse == true)
			self.openVideoList();
	}, // videoListOpenTimeout()

	toggleVideoList: function(clicked) {
		if($('#video-list').hasClass('bounceOutUp')) {
			self.openVideoList(clicked);
		}
		else {
			self.closeVideoList(clicked);
		}
	}, // toggleVideoList()

	openVideoList: function(clicked) {
		if ( !$('#video-list').children().length ) return;

		self.videoListClicked(clicked);

		window.clearTimeout(self.Globals.videoListCloseTimeout);

		$('#video-list').show().addClass('slideInDown').removeClass('bounceOutUp');
		$('#now-playing-title').addClass('active');
	}, // openVideoList()

	closeVideoList: function(clicked) {
		if ( $('#video-list').hasClass('scrolling') ) return;

		self.videoListClicked(clicked);

		window.clearTimeout(self.Globals.videoListOpenTimeout);

		$('#video-list').addClass('bounceOutUp').removeClass('slideInDown');
		$('#vid-list-tooltip').hide();
		$('#now-playing-title').removeClass('active');
	}, // closeVideoList()

	videoListClicked: function(clicked) {
		var vidList = $('#video-list');
		if (clicked) {
			vidList.addClass('clicked');
			window.clearTimeout(self.Globals.videoListOpenTimeout);
			window.clearTimeout(self.Globals.videoListCloseTimeout);
		} else {
			vidList.removeClass('clicked');
		}
	},

	loadVideoList: function(chan) {
		var $video_list = $('#video-list'),
		    this_chan   = chan,
			$list       = $('<span></span>');

		if (this_chan.feed == $video_list.data('feed')) return true;

		$video_list.data('feed', this_chan.feed);

		for(var i in self.Globals.videos[this_chan.feed].video) {
			var this_video = self.Globals.videos[this_chan.feed].video[i];
			$thumbnail = self.thumbElement(this_video, this_chan, i);
			$list.append($thumbnail);
		}

		$('#video-list')
			.html($list);

		// Populate with ads
		if ( !this_chan.feed.match('/sponsor/') && self.Globals.ads && self.Globals.ads.videos.length > 0 ) {
			var adNum = 0;

			$('#video-list .thumbnail').each(function(i) {
				if (i == self.Globals.ads.settings.start - 1) adNum = self.Globals.ads.settings.every;

				var num = (adNum == 0) ? i : adNum,
					set = (adNum == 0) ? self.Globals.ads.settings.start : self.Globals.ads.settings.every,
					ad, thumbnail;

				if ( adNum == self.Globals.ads.settings.every ) {
					ad = self.getRandomAd();
					thumbnail = self.thumbElement(ad, {feed: '/sponsor' }, rtv.Globals.ads.videos.indexOf(ad));
					thumbnail.insertBefore($(this));
					thumbnail.addClass('sponsored')
						.attr({
							'data-adNum' : ad.index,
							'data-unique'    : parseInt(Math.random()*10000)
						});

					adNum = 1;
				}

				if (i >= self.Globals.ads.settings.start) adNum++;
			});
		}

		self.showHideNsfwThumbs(self.Globals.sfw);

		$('#video-list')
			.stop(true, true)
			.show()
			.animate({ height: '100px', padding: '5px' }, 1000, function() {
				$('img').lazyload({
					effect : "fadeIn",
					container: $("#video-list")
				});
			});

		// Use jScrollPane-esque thing if not using Webkit
		if ( !$.browser.webkit && $('#video-list > span').width() > $('#video-list').width() ) {
			self.videoListScrollbar();
		}

		self.Globals.videoListCloseTimeout = window.setTimeout(self.closeVideoList, 2000);
	}, // loadVideoList()

	loadVideo: function(video, sponsored) {
		var this_chan = self.Globals.cur_chan,
			this_video = self.Globals.cur_video,
			selected_video = this_video,
			videos_size = 0,
			sponsoredChannel = (this.owner == 'sponsor'),
			thumbAnchor, newAnchor, isAdVideo, video;

		if (this_chan.feed) videos_size = Object.size(self.Globals.videos[this_chan.feed].video)-1;
		if (!sponsored) sponsored = sponsoredChannel;

		if( $('#video-list').hasClass('bounceOutUp') ) { // Video list isn't open
			self.openVideoList();
			self.Globals.videoListCloseTimeout = setTimeout(self.videoListCloseTimeout, 2000);
		}

		if(self.Globals.shuffle){
			if(self.Globals.shuffled.length === 0){
				self.shuffleChan(this_chan);
			}
			//get normal key if shuffled already
			selected_video = self.Globals.shuffled.indexOf(selected_video);
		}
		 
		thumbAnchor = $('#video-list .sponsored.thumbnail.focus:first');
		if (!thumbAnchor.length) thumbAnchor = $('#video-list-thumb-' + selected_video);

		newAnchor = (video == 'next') ? thumbAnchor.next() : thumbAnchor.prev();
		if ( newAnchor.length && (video == 'next' || video == 'prev') ) {
			if ( thumbAnchor.hasClass('sponsored') ) {
				var next_video = parseInt(newAnchor.data('id'))
				next_video = (video == 'next') ? next_video + 1 : next_video - 1;
				this_video = selected_video = next_video;
			}

			if ( newAnchor.hasClass('sponsored') || thumbAnchor.hasClass('sponsored') ) {
				newAnchor.trigger('click');
				if (thumbAnchor.hasClass('sponsored')) window.location.hash = newAnchor.attr('href');
				return;
			}
		}

		if(video === 'next' && selected_video <= videos_size){
			selected_video++;
			if(selected_video > videos_size){
				selected_video = 0;
			}
			while(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed) && selected_video < videos_size){
				selected_video++;
			}
			if(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed)){
				selected_video = this_video;
			}
		}else if(selected_video >= 0 && video === 'prev'){
			selected_video--;
			if(selected_video < 0){
				selected_video = videos_size;
			}
			while(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed) && selected_video > 0){
				selected_video--;
			}
			if(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed)){
				selected_video = this_video;
			}
		}else if(video === 'first'){
			selected_video = 0;
			if(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed)){
				while(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed) && selected_video < videos_size){
					selected_video++;
				}
			}
		}
		selected_video = self.getVideoKey(selected_video);

		if(typeof(video) === 'number'){ //must be a number NOT A STRING - allows direct load of video # in video array
			selected_video = video;
		}

		//exit if trying to load over_18 content without confirmed over 18
		if (!sponsored && self.sfwCheck(selected_video, this_chan.feed) ) {
			return false;
		}

		if ( self.Globals.ads && self.Globals.ads.settings && self.Globals.ads.settings.start == 1 && ( video === 'first' || video === null ) ) {
			sponsored = true;
			$('#video-list a.thumbnail:first').addClass('focus');
		}

		if ( (selected_video !== this_video && !sponsored || sponsored) || video === 'first' || video === 0) {
			isAdVideo = ( sponsored && self.Globals.cur_chan.owner != 'sponsor' );
			self.Globals.cur_video = (isAdVideo) ? 0 : selected_video;
			video = (isAdVideo) ? self.Globals.ads.videos[selected_video] : self.Globals.videos[this_chan.feed].video[selected_video];

			// scroll to thumbnail in video list and highlight it
			$('#video-list a.thumbnail').removeClass('focus');
			if (sponsored) {
				if ( !isNaN(parseInt(sponsored)) ) $('#video-list a.sponsored[data-unique="' + sponsored + '"]').addClass('focus');
			} else {
				$('#video-list-thumb-' + selected_video).addClass('focus');
			}
			$('#video-list:not(.scrollbar)').stop(true,true).scrollTo('.focus', { duration:1000, offset:-325 });
			if ($('#video-list').hasClass('scrollbar')) { // Only do this for the jScrollPane-esque thing
				var focused      = $('#video-list .focus'),
					focusedLeft  = (focused.length) ? focused.position().left : 0,
					span         = $('#video-list > span'),
					spanMargin   = parseInt(span.css('margin-left')),
					scrollMargin = (spanMargin - focusedLeft < -325) ? Math.round(spanMargin - focusedLeft + 325) : 0,
					handlePos;

				if (Math.abs(scrollMargin) - 150 >= $('#video-list > span').width() - $(document).width())
					scrollMargin = -Math.abs($('#video-list > span').width() - $(document).width());

				handlePos = (Math.abs(scrollMargin) / span.width() * 100).toFixed(2);

				span.stop(true,true).animate({ marginLeft: scrollMargin + 'px'}, 1000);
				$('#video-list-scrollbar .ui-slider-handle').stop(true,true).animate({ left: handlePos + '%' }, 1000);
			}

			// enable/disable nav-buttons at end/beginning of playlist
			var $prevbutton = $('#prev-button'), $nextbutton = $('#next-button');
			if(selected_video <= 0){
				$prevbutton.stop(true,true).fadeOut('slow', function() {
					$(this).css({ 'visibility':'hidden', 'display':'inline' });
				});
			}else if($prevbutton.css('visibility') === 'hidden'){
				$prevbutton.hide().css({ 'visibility':'visible' }).stop(true,true).fadeIn('slow');
			}

			if(self.Globals.cur_video >= videos_size){
				$nextbutton.stop(true,true).fadeOut('slow', function() {
					$(this).css({ 'visibility':'hidden', 'display':'inline' });
				});
			}else if($nextbutton.css('visibility') === 'hidden'){
				$nextbutton.hide().css({ 'visibility':'visible' }).stop(true,true).fadeIn('slow');
			}

			//set location hash
			var parts, hash = document.location.hash;
			if (sponsored && !sponsoredChannel) {
				hash = '/ad/' + video.index;
			} else {
				if (!hash) {
					var feed = this_chan.feed;
					parts = feed.split("/");
					hash = '/'+parts[1]+'/'+parts[2]+'/'+video.id;
				} else {
					var anchor = hash.substring(1);
					parts = anchor.split("/"); // #/r/videos/id
					hash = '/'+parts[1]+'/'+parts[2]+'/'+video.id;
				}
				window.location.hash = hash;
			}
			self.Globals.current_anchor = '#' + hash;

			self.gaHashTrack();

			var $video_embed = $('#video-embed');

			$video_embed.empty();
			self.loadingAnimation('', video.media.oembed.thumbnail_url);

			var embed = $.unescapifyHTML(video.media_embed.content);
			embed = self.prepEmbed(embed, video.domain);
			embed = self.prepEmbed(embed, 'size');
			$('#video-container').toggleClass('sponsored', sponsored);

			var redditlink = 'http://reddit.com'+$.unescapifyHTML(video.permalink);

			self.gaEventTrack('Video', 'Play', self.curVideoTitle());
			self.gaEventTrack('Channel', 'Video Play', self.Globals.cur_chan.feed);

			var videoTitle = '<a href="' + redditlink + '" target="_blank"'
									+ ' title="' + video.title_quot + '">'
									+ video.title_unesc + '</a>';
			if (sponsored) videoTitle = ( video.title ) ? video.title_unesc : '';

			$('#video-title').html(videoTitle);
			$('#video-comments-link').attr("href", redditlink);
			$('#video-tweet-link').attr("href", "https://twitter.com/intent/tweet?text=" 
									+ encodeURIComponent(video.title_quot)
									+ "&url="+encodeURIComponent(window.location)
									+ "&original_referrer="+encodeURIComponent(window.location));
			$('#video-share-link').attr("href", "https://www.facebook.com/sharer/sharer.php?src=bm"
									+ "&u="+encodeURIComponent(window.location)
									+ "&t="+encodeURIComponent(video.title_quot)
									+ "&v=3");
			$video_embed.html(embed);
			$('body').removeClass('video-loading');
			if (video.domain == 'youtube.com') youtube.createPlayer();

			self.addListeners(video.domain);

			var video_source_text = 'Source: ' +
				'<a href="' + video.url + '" target="_blank">' +
				video.domain +
				'</a>';
			var $video_source = $('#video-source');
			$video_source.stop(true,true).fadeOut('slow', function() {
				$video_source.html(video_source_text).fadeIn('slow');
			});
		}
	}, // loadVideo()

	thumbElement: function(this_video, this_chan, id) {
		var videoId, url, $thumbnail, thumbnail_image, anchorId,
		    anchorClass = [ 'thumbnail' ],
			sponsored = (this_chan.feed == '/sponsor');

		if ( this_video.title && !this_video.title_unesc ) {
			this_video.title_unesc = $.unescapifyHTML(this_video.title);
			this_video.title_quot  = this.escape(this_video.title_unesc);
		}
		if ( !this_video.title ) this_video.title_unesc = this_video.title_quot = '';

		videoId = (self.Globals.videos[this_chan.feed]) ? self.Globals.videos[this_chan.feed].video[id].id : id;
		url = ( !sponsored ) ? this_chan.feed + '/' + videoId : '';

		anchorId = ( !sponsored ) ? ' id="video-list-thumb-' + id + '"' : '';
		if (sponsored) anchorClass.push('sponsored');
		$thumbnail = $('<a href="#' + url + '"' + anchorId + ' class="' + anchorClass.join(' ') + '"></a>');
		if (this_video.title_quot) $thumbnail.attr('title', this_video.title_quot);
		$thumbnail.data('id', id);

		// make nsfw thumbnails easily findable
		if (this_video.over_18) {
			$thumbnail.addClass('nsfw_thumb');
		}

		thumbnail_image = (this_video.image_url) ? this_video.image_url : self.getThumbnailUrl(this_chan.feed, id);
		$thumbnail.css('background-image', 'url(' + thumbnail_image + ')');

		return $thumbnail;
	}, // thumbElement()

	getVideoKey: function(key){
		if(self.Globals.shuffle && self.Globals.shuffled.length === Globals.videos[self.Globals.cur_chan.feed].video.length){
			return self.Globals.shuffled[key];
		} else {
			return key;
		}
	}, // getVideoKey()

	loadVideoById: function(video_id) {
		var this_chan = self.Globals.cur_chan,
		    video     = self.findVideoById(video_id, this_chan.feed);  //returns number typed

		if(video !== false){
			self.loadVideoList(this_chan);
			self.loadVideo(Number(video));
		}else{
			self.redditApiCall('video', { 'channel': this_chan, 'video_id': video_id },
				function() {},
				function(jXHR, textStatus, errorThrown, local) {
					var this_chan = local.channel,
					    error     = 'Error loading video.';

					self.tvError(error);
				});
		}
	}, // loadVideoById()

	videoListScrollbar: function() {
		var scrollPane = $('#video-list').addClass('scrollbar'),
			scrollBar = $('<div id="video-list-scrollbar" />').appendTo(scrollPane),
			scrollContent = $( "#video-list span:first" );

		scrollbar = scrollBar.slider({
			start: function() {
				scrollPane.addClass('scrolling');
			},
			stop: function() {
				scrollPane.removeClass('scrolling');
			},
			slide: function( event, ui ) {
				if ( scrollContent.width() > scrollPane.width() ) {
					scrollContent.css( "margin-left", Math.round(
						ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
						) + "px" );
				} else {
					scrollContent.css( "margin-left", 0 );
				}
			}
		});
	}, // videoListScrollbar()

	loadingAnimation: function(text, background) {
		if ( $('#main-container').hasClass('add-channel') )
			self.toggleAddChannel(true);

		$('body').addClass('video-loading');
		if (!text) text = '';
		$('#loading').removeClass('error')
			.find('.what').html(text);
		if (background) $('#loading .tv .image').css({ 'background-image' : 'url(' + background + ')' });
	}, // loadingAnimation()

	tvError: function(text) {
		$('#loading').addClass('error')
			.find('.image')
				.css('background-image', 'none')
				.html('<h1>ERROR</h1><span>' + text + '</span>');
	}, // tvError()

	toggleAddChannel: function(instant) {
		var vid  = $('#video-embed'),
			vidW = vid.width(),
			vidH = vid.height(),
			container = $('#main-container'),
			speed = (instant === true) ? 10 : 500;

		$('#ytplayer').height('100%');

		if (!container.hasClass('add-channel')) {
			vid
				.animate({
					width: '480px',
					height: '300px'
				}, speed);

			$('#main-container').addClass('add-channel');
			$('#video-container, #video-embed').width(vidW).height(vidH);

			$('#add-channel .channel-name').focus();

			// window.document.location.hash = 'add-channel';
			// $(document).scrollTop(0);
		} else {
			$('#video-container').css({
				'width': '100%'
			});

			vid
				.animate({
					width: '1000px',
					height: '625px'
				}, speed, function() {
					$('#main-container').removeClass('add-channel');
					$('#video-container').css({
						'width': '100%'
					});
				});
		}

		return false;
	}, // toggleAddChannel()

	addChannelFromForm: function() {
		var addChan   = $('#add-channel'),
		    channel   = addChan.find('input.channel-name').val(),
		    submitBtn = addChan.find('input.channel-submit');

		if (addChan.hasClass('loading') || addChan.hasClass('disabled')) return false;

		if (channel != '')
			self.addChannel(channel);

		return false;
	}, // addChannelFromForm()

	addChannelName: function() {
		var addChan = $('#add-channel'),
		    val     = addChan.find('input.channel-name').val();

		addChan.removeClass('subreddit site');
		if (val == '') {
			addChan.removeClass('videos');
			addChan.find('.recommended.channels').show();
		}
		
		if ( val.match(/\w\.\w/) ) {
			addChan.addClass('site');
		} else if (val != '') {
			addChan.addClass('subreddit');
		}
	}, // addChannelName()

	addChannelCheck: function() {
		var msg     = $('#add-channel-message'),
		    input   = $('#add-channel input.channel-name'),
		    channel = input.val(),
		    oldChan = channel,
		    chanObj = self.getChan(channel),
		    videos;

		// Strip out /r/ etc if anyone adds it
		if (channel.match(/\//)) channel = channel.replace(/^.*\//, '');

		// I don't think any subreddits less than 3 characters exist, and return non-JSONP 404s which bug up $.ajax anyway
		if (channel.length < 3 || $('#add-channel').hasClass('loading')) return;

		if (channel != oldChan) input.val(channel).data('val', channel);

		channel = (channel.match(/\./)) ? '/domain/' + channel : '/r/' + channel;
		videos  = self.Globals.videos[channel];

		if (chanObj && chanObj.owner != 'temp') {
			msg.html('Channel already exists.');
			return;
		}

		msg.html('');

		if (videos) {
			self.populateAddChanVids(channel);
		} else {
			$('#add-channel').addClass('loading');
			self.redditApiCall('videos', { 'channel': { 'feed': channel } },
				function(data, local) {
					self.populateAddChanVids(local.channel.feed);
					$('#add-channel').removeClass('loading');
				},
				function(jXHR, textStatus, errorThrown, local) {
					var msg     = $('#add-channel-message'),
					    channel = $('#add-channel input.channel-name').val(),
					    addChan = $('#add-channel'),
					    errorTxt;

					addChan.removeClass('loading');

					if (addChan.hasClass('videos')) {
						addChan.find('.channel-to-add').fadeOut(200, function() {
							addChan.removeClass('videos');
						});
						addChan.find('.recommended.channels').fadeIn(200);
					}

					if (textStatus == 'success') {
						errorTxt = 'Subreddit exists, ';
						if ( !local.videos.length || !local.data.data.children.length ) {
							errorTxt += 'but contains no ';
							errorTxt += (!local.data.data.children.length) ? 'posts.' : 'video posts.';
						} else {
							errorTxt += 'but errored.';
						}
					} else {
						errorTxt = 'Error loading feed.';
						if (local.channel && local.channel.feed.match(/^\/r\//)) errorTxt += '.. Are you sure the <a href="http://reddit.com' + local.channel.feed + '" target="_blank">subreddit exists?</a>';
					}

					msg.html(errorTxt);
				}
			);
		}

	}, // addChannelCheck()

	populateAddChanVids: function(feed) {
		var channel = self.Globals.videos[feed],
		    addChan = $('#add-channel'),
		    div     = $('#add-channel .channel-to-add'),
		    chans   = $('#add-channel .channel-to-add .channel');

		if (!channel || !channel.video) return; // No videos, let's handle this error later

		addChan.removeClass('disabled');

		if ( !$('#add-channel').hasClass('videos') ) {
			$('#add-channel .recommended.channels').fadeOut(200);
		}

		div.find('h2').text(feed);

		$.each(channel.video, function(i, val) {
			if (i >= 8) return false;
			var vid = $('<a class="grid-25 channel" href="#' + feed + '/' + val.id + '"><div class="thumbnail" style="background-image: url(' + val.media.oembed.thumbnail_url + ');"></div><span class="name">' + val.title + '</span></a>');

			if (chans.length) {
				chans.eq(i).show().delay(i * 50).fadeOut(200, function() {
					$(this).replaceWith(vid).fadeIn(200);
				});
			} else {
				vid.hide().delay(i * 50).fadeIn(200)
					.appendTo(div);
			}
		});

		$('#add-channel').addClass('videos');
	}, // populateAddChanVids()

	addChannel: function(subreddit) {
		var feed, getChan, tempChan, c_data, chanThumb;

		if (!subreddit) subreddit = self.stripHTML($('#channel-name').val());

		feed = subreddit;
		if ( !feed.match(/\//) ) {
			feed = (subreddit.match(/\./)) ? '/domain/' + subreddit : '/r/' + subreddit;
		} else {
			subreddit = subreddit.replace(/^.*\//, '');
		}

		getChan = self.getChanObj(feed);
		tempChan = ( getChan && getChan.owner == 'temp' );

		if ( !getChan || tempChan ) {
			c_data = (getChan) ? getChan : { 'channel': subreddit, 'feed': feed };
			c_data.owner = 'user';

			self.Globals.channels.unshift(c_data);
			self.Globals.user_channels.unshift(c_data);
			
			$.jStorage.set('user_channels', self.Globals.user_channels);

			chanThumb = $('#channels a.channel[data-feed="' + feed + '"]');
			if ( tempChan && chanThumb.length ) {
				chanThumb.removeClass('temp')
					.find('.thumbnail span.add')
						.attr({
							'class': 'delete',
							'title': 'Delete this channel'
						})
						.html('&times;');
			} else {
				self.displayChannel(c_data, true);
			}

			self.saveChannelOrder();

			self.gaEventTrack('Channel', 'Add', feed);

			return true;
		}

		return false;
	}, // addChannel()

	removeChannel: function(feed) {
		var chanIndex = self.getChan(feed),
		    channel   = self.Globals.channels[chanIndex];
		    canDelete = false;

		if (!chanIndex || !channel) return false;

		if (channel.owner == 'user') canDelete = true;

		if (canDelete) {
			self.Globals.channels.splice(chanIndex, 1);
			self.Globals.user_channels.splice(chanIndex, 1);
			$.jStorage.set('user_channels', self.Globals.user_channels);
		}

		return canDelete;
	}, // removeChannel()

	changeChan: function(direction) {
		var curChan  = $('#channels a.channel.focus:first'),
		    chan     = false,
		    feed;

		if (direction == 'up') {
			chan = curChan.prev();
		} else if (direction == 'down') {
			chan = curChan.next();
		}

		if (!chan) return false;

		feed = chan.data('feed');

		if (!feed) return false;

		chan.trigger('click');
		document.location.href = chan.attr('href');

		return true;
	}, // changeChan()

	channelType: function(channel) {
		return (subreddit.match(/(\/domain\/|\.)/)) ? 'domain' : 'subreddit';
	},

	getRandomAd: function() {
		if ( self.Globals.ads.used.length == self.Globals.ads.videos.length ) {
			if (self.Globals.ads.videos.length > 1) self.Globals.ads.last = self.Globals.ads.used[self.Globals.ads.used.length-1];
			self.Globals.ads.used = [];
		}

		var rand = Math.floor( Math.random() * self.Globals.ads.videos.length );

		if (self.Globals.ads.last != rand) self.Globals.ads.last = null;
		if (self.Globals.ads.last == rand || $.inArray(rand, self.Globals.ads.used) >= 0)
			return self.getRandomAd();

		self.Globals.ads.used.push(rand);

		return self.Globals.ads.videos[rand];
	}, // getRandomAd()

	formatAdVideos: function(videos) {
		$.each(videos, function(i, vid) {
			var domain  = vid.video_url.replace(/^https?:\/\/(?:www\.)?(.*?)\/.*$/, '$1'),
			    created = self.createEmbed(vid.video_url, domain);

			videos[i].media = { 'oembed': { 'thumbnail_url': (vid.image_url) ? vid.image_url : created.thumbnail } };
			videos[i].media_embed = { 'content': created.embed };
			videos[i].domain = domain;
			videos[i].index = i;
		});

		return videos;
	}, // formatAdVideos()

	formatSponsoredChannels: function(channels) {
		for(c in channels){
			channels[c] = {
				channel: channels[c].channel.toLowerCase(),
				feed: '/sponsor/'+channels[c].channel.toLowerCase().replace(/[^\w]/, ''),
				thumbnail: channels[c].thumbnail,
				owner: 'sponsor',
				videos: self.formatSponsoredChannelVideos(JSON.parse(channels[c].video_list)),
			}
		}
		return shuffleArray(channels);
	}, // formatSponsoredChannels()

	formatSponsoredChannelVideos: function(videos) {
		$.each(videos, function(i, video_url) {
			var domain  = video_url.replace(/^https?:\/\/(?:www\.)?(.*?)\/.*$/, '$1'),
			    created = self.createEmbed(video_url, domain);

			videos[i] = {};
			videos[i].id = created.id;
			videos[i].media = { 'oembed': { 'thumbnail_url': created.thumbnail } };
			videos[i].media_embed = { 'content': created.embed };
			videos[i].domain = domain;
		});

		return videos;
	}, // formatSponsoredChannelVideos()

	curVideoTitle: function() {
		var sponsored = $('#video-container').hasClass('sponsored'),
		    title     = self.Globals.current_anchor.replace(/^#/, ''),
		    video     = self.Globals.videos[self.Globals.cur_chan.feed].video[self.Globals.cur_video];

		if (sponsored) {
			title += ' - ' + $('#video-title').text();
		} else {
			if (video) title += ' - ' + video.title;
		}

		return title;
	}, // curVideoTitle()

	stripHTML: function(s) {
		return s.replace(/[&<>"'\/]/g, '');
	},

	gaHashTrack: function() {
		if(!_gaq) return;
		_gaq.push(['_trackPageview',location.pathname + location.hash]);
	},

	gaEventTrack: function(category, action, label) {
		if(!_gaq || !category || !action || !label) return;

		_gaq.push(['_trackEvent', category, action, label]);
	},

	escape: function(string) {
		// List of HTML entities for escaping.
		var htmlEscapes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'/': '&#x2F;'
		};

		// Regex containing the keys listed immediately above.
		var htmlEscaper = /[&<>"'\/]/g;

		return ('' + string).replace(htmlEscaper, function(match) {
			return htmlEscapes[match];
		});
	}, // escape() [stolen from _.js]

    isiPad: function() {
        return (navigator.userAgent.match(/iPad/i) != null);
    }, // isiPad
});

// http://www.codinghorror.com/blog/2007/12/the-danger-of-naivete.html
function shuffleArray(arr) {
	var i
	var j;
	var l;
	var temp;
	for (i = 0, l = arr.length; i < l; i++) {
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

var rtv;
$(document).ready(function() {
	rtv = new RedditTV();
});

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			size++;
		}
	}
	return size;
};