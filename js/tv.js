var RedditTV = Class.extend({
	init: function() {
		self = this;

		self.Globals = $.extend({}, {
			/* Current URL for AJAX, etc */
			current_url: window.location.origin + window.location.pathname,

			/* build uri for search type channels */
			search_str: (function () {
				var one_day = 86400,
					date = new Date(),
					unixtime_ms = date.getTime(),
					unixtime = parseInt(unixtime_ms / 1000);
				return "search/.json?q=%28and+%28or+site%3A%27youtube.com%27+site%3A%27vimeo.com%27+site%3A%27youtu.be%27%29+timestamp%3A"+(unixtime - 5*one_day)+"..%29&restrict_sr=on&sort=top&syntax=cloudsearch";
			})(),

			/* Channels Object */
			channels: [
				/*{channel: 'All', type: 'search', feed: '/r/all/'},
				{channel: 'Videos', type: 'normal', feed: '/r/videos/'},*/
				],

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
			all_channels: [],
			cur_video: 0,
			cur_chan: {},
			cur_chan_req: null,
			cur_vid_req: null,
			current_anchor: '',
			auto: true,
			sfw: true,
			shuffle: false,
			shuffled: [],
			theme: 'light',
			videoListMouse: false,

			content_minwidth: 130,  // minimum width of #content w/o width of player
			content_minheight: 320, // minimum height of #content w/o height of player
			vd_minwidth: 30,		// minimum width of #video-display w/o width of player
			vd_minheight: 213,	  // minimum height of #video-display w/o height of player

			ads: {}
		}, Globals); // end Globals

		// Load ads
		self.apiCall('ads', null, function(data) { self.Globals.ads = data; });

		self.loadSettings();
		self.setBindings();
		self.displayChannels();

		if (!self.Globals.current_anchor)
			self.loadChannel(self.Globals.channels[0], null);
	},
	loadSettings: function() {
		var channels_cookie = $.jStorage.get('user_channels'),
			auto_cookie = $.jStorage.get('auto'),
			sfw_cookie = $.jStorage.get('sfw'),
			theme_cookie = $.jStorage.get('theme'),
			shuffle_cookie = $.jStorage.get('shuffle');

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

		if(theme_cookie !== null && theme_cookie !== self.Globals.theme){
			self.Globals.theme = theme_cookie;
		}
		if(channels_cookie !== null && channels_cookie !== self.Globals.user_channels){
			self.Globals.user_channels = channels_cookie;
			for(var x in self.Globals.user_channels){
				self.Globals.channels.unshift(self.Globals.user_channels[x]);
			}
		}
	},
	setBindings: function() {
		var $filloverlay = $('#fill-overlay'), $fillnav = $('#fill-nav');
		$filloverlay.mouseenter(function() {
			$fillnav.slideDown('slow');
		});
		$filloverlay.mouseleave(function() {
			$fillnav.slideUp('slow');
		});
		$fillnav.click(function(){
			fillScreen();
		});
		$('#css li a').click(function() {
			loadTheme($(this).attr('rel'));
			return false;
		});
		$('#settings .settings-auto input').change(function() {
			self.Globals.auto = ($(this).is(':checked')) ? true : false;
			// This isn't being set right, is needing 2 clicks
			// alert(Globals.auto); 
			$.jStorage.set('auto', self.Globals.auto);
		});
		$('#settings .settings-shuffle input').change(function() {
			self.Globals.shuffle = ($(this).is(':checked')) ? true : false;
			self.Globals.shuffled = []; //reset
			$.jStorage.set('shuffle', self.Globals.shuffle);
		});
		$('#settings .settings-sfw input').change(function() {
			self.Globals.sfw = ($(this).is(':checked')) ? true : false;
			if(!Globals.sfw){
				if(!confirm("Are you over 18?")){
					$(this).removeClass('active').find('input').prop("checked", true);
					self.Globals.sfw = true;
				}
			}
			$.jStorage.set('sfw', self.Globals.sfw);
			showHideNsfwThumbs(Globals.sfw, self.Globals.cur_chan);
		});
		$('#settings .settings-fill').click(function() {
			fillScreen();
		});
		$('#settings #hax a').click(function() {
			window.open($(this).attr('href'));
		});
		$('#next-button').click(function() {
			loadVideo('next');
		});
		$('#prev-button').click(function() {
			loadVideo('prev');
		});
		$('#video-list').bind('mousewheel', function(event,delta){
			this.scrollLeft -= (delta * 30);
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
					loadVideo('prev');
					break;
				case arrow.up:	case 75: // k
					chgChan('up');
					break;
				case arrow.right: case 76: // l
					loadVideo('next');
					break;
				case arrow.down:  case 74: // j
					chgChan('down');
					break;
				case 32:
					togglePlay();
					break;
				case 70:
					$('#fill').attr('checked', true);
					fillScreen();
					break;
				case 27:
					if($('#fill').is(':checked')){
						fillScreen();
					}
					break;
				case 67:
					window.open($('#video-title>a').attr('href'), '_blank');
					break;
				}
				return false;
			}
		});

		$(window).resize(function() {
			resizePlayer();
		});

		/* clear add sr on click */
		$('#channel-name').click(function(){
			$(this).val('');
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
				// Kinda busted?
				self.closeVideoList();
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

		// VidList tooltips
		$('#video-list').on(
			'mouseenter mouseleave',
			'.thumbnail',
			function(e) {
				if (e.type == 'mouseenter') {
					if ( !$(this).attr('title') || $('#video-list').hasClass('scrolling')) return; // Don't show tooltips while scrolling

					var toolTip = $('#vid-list-tooltip'),
						toolTipPos = 0,
						title = $(this).attr('title');

					$(this).data('title', $(this).attr('title'));
					$(this).attr('title', '');
					toolTip.show().html(title);
					toolTipPos = $(this).offset().left;
					toolTip.css({
							'z-index': 9001,
							'left': (toolTipPos < 0) ? 0 : toolTipPos
						});
				} else if (e.type == 'mouseleave') {
					$(this).attr('title', $(this).data('title'));
					$('#vid-list-tooltip').hide();
				}
			}
		);

		$('#add-channel-button, #video-return').click(self.toggleAddChannel);

		$('#add-channel form').on('submit', self.addChannelFromForm);

		$('#toggle-settings').click(function() {
			consoleLog('toggling settings');
			$('#settings').toggleClass('open');
			return;

			var div = $('#settings');
			if (div.hasClass('open')) {
				$('#settings').removeClass('open');
				// $('#settings').fadeIn();
			} else {
				$('#settings *:not(input):hidden').fadeIn();
				// $('#settings').addClass('open');
			}
		});

		$('#add-channel input.channel-name').on('keyup', self.addChannelName);

		$.each(self.Globals.recommended_channels, function(i, channel) {
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

				self.addChannelName();

				return false;
			});
		});

		$('header').mouseenter(function(){
			// consoleLog('enter header');
			self.Globals.videoListMouse = true;
			setTimeout(self.videoListOpenTimeout, 500);
		});
		$('#video-list').mouseenter(function(){
			// consoleLog('enter video list');
			self.Globals.videoListMouse = true;
			self.openVideoList();
		});
		$('#settings').mouseenter(function(){
			// console.log('enter settings')
			self.Globals.videoListMouse = false;
		});
		$('header').mouseleave(function(){
			// console.log('exit header')
			self.Globals.videoListMouse = false;
			setTimeout(self.videoListCloseTimeout, 1000);
		});
		$('#video-list').mouseleave(function(){
			// console.log('exit video list')
			self.Globals.videoListMouse = false;
			setTimeout(self.videoListCloseTimeout, 1000);
		});

	},

	displayChannels: function() {
		var $channel_list = $('#channel-list'),
			$list = $('<ul></ul>'),
			$channel_base = $('#channels a.channel:first');

		$.each(self.Globals.channels, function(i, chan) {
			self.displayChannel(chan);
		});
	},

	displayChannel: function(chan) {
		// chan.feed = Globals.channels[chan].feed;
		// chan.feed = Globals.channels[chan].feed;

		var title, display_title, class_str='', remove_str='',
			$channel_base = $('#add-channel-button'),
			$channel = $channel_base.clone().removeAttr('id');

		// data = data[0];
		// chan.feed = data.feed;
		chan_title = chan.feed.split("/");
		chan_title = "/"+chan_title[1]+"/"+chan_title[2];

		/*chan = 0
		for(chan=0; chan<Globals.channels.length; chan++){
			console.log(Globals.channels[chan].feed)
			if(Globals.channels[chan].feed == data.feed)
				break;
		}
		console.log(chan);*/

		display_title = chan.channel.length > 20 ?
			chan.channel.replace(/[aeiou]/gi,'').substr(0,20) :
			chan.channel;

		/*if(isUserChan(Globals.channels[chan].channel)){
			class_str = 'class="user-chan"';
			remove_str = '<a id="remove-'+chan+'" class="remove-chan">-</a>';
		}*/

		$channel
			.show()
			.appendTo('#channels')
			.attr({
				// id: 'channel-' + chan,
				href: '#' + chan.feed,
				title: chan_title,
				'data-feed' : chan.feed
			})
			.find('.name')
				.html(display_title);
			// .removeClass('loading') // temp

		if (chan.thumbnail) {
			$channel.find('.thumbnail')
				.css({
					'background-image': 'url(' + chan.thumbnail + ')'
				});
		} else {
			self.apiCall(
				'channel_thumbnail',
				{ 'feed' : chan.feed },
				function(data) {
					var channel = data[0],
						thumb	= channel.thumbnail_url;
					if (!thumb || thumb == '') return;

					$('#channels a.channel[data-feed="' + channel.feed + '"]').find('.thumbnail')
						.css({
							'background-image': 'url(' + thumb + ')'
						});

				}
			);
		}

		// $('#channel>ul').prepend('<li id="channel-'+chan+'" title="'+title+'" '+class_str+'><img src="http://i2.ytimg.com/vi/NUkwaiJgDGY/hqdefault.jpg" />'+display_title+remove_str+'</li>');

		/*$('#remove-'+chan).bind(
			'click',
			{channel: chan},
			function(event) {
				removeChan(event.data.channel);
			}
		);*/

	},

	loadChannel: function(channel, video_id) {
		// console.log('[loadChannel]', channel, video_id);
		var last_req = self.Globals.cur_chan_req,
			// this_chan = getChan(channel),
			this_chan = channel,
			$video_embed = $('#video-embed'),
			$video_title = $('#video-title'),
			title;

		// update promo state
		$('#promo-channel li').removeClass('chan-selected');

		if(last_req !== null){
			last_req.abort();
		}
		
		self.Globals.shuffled = [];
		self.Globals.cur_chan = this_chan;
		
		/*$('#video-list').stop(true, true).animate({ height:0, padding:0 }, 500, function() {
			$(this).empty().hide();
		});*/
		$('#prev-button,#next-button').css({ 'visibility':'hidden', 'display':'none' });
		$('#vote-button').empty();
		$('#video-source').empty();

		title = channel.feed.split("/");
		title = "/"+title[1]+"/"+title[2];

		$video_title.html('Loading '+title+' ...');
		// $video_embed.addClass('loading');
		self.loadingAnimation(title);
		$video_embed.empty();
		
		// TODO: Change to highlight the channel in the grid instead
		// $('#channel-list>ul>li').removeClass('chan-selected');
		// $('#channel-'+this_chan).addClass('chan-selected');

		var npTitle = self.Globals.cur_chan.feed;
		if (self.Globals.cur_chan.channel) npTitle = self.Globals.cur_chan.channel + ' - ' + npTitle;
		$('#now-playing-title').empty().append(npTitle);

		
		if(self.Globals.videos[this_chan.feed] === undefined){
			var feed = self.getFeedURI(channel);
			self.Globals.cur_chan_req = $.ajax({
				url: "http://www.reddit.com"+feed,
				dataType: "jsonp",
				jsonp: "jsonp",
				success: function(data) {
					self.Globals.videos[this_chan.feed] = {};
					self.Globals.videos[this_chan.feed].video = []; //clear out stored videos
					for(var x in data.data.children){
						if(self.isVideo(data.data.children[x].data.domain) && (data.data.children[x].data.score > 1)){
							if(self.isEmpty(data.data.children[x].data.media_embed) || data.data.children[x].data.domain === 'youtube.com' || data.data.children[x].data.domain === 'youtu.be'){
								var created = self.createEmbed(data.data.children[x].data.url, data.data.children[x].data.domain);
								if(created !== false){
									data.data.children[x].data.media_embed.content = created.embed;
									data.data.children[x].data.media = {};
									data.data.children[x].data.media.oembed = {};
									data.data.children[x].data.media.oembed.thumbnail_url = created.thumbnail;
								}
							}
							if(data.data.children[x].data.media_embed.content){
								self.Globals.videos[this_chan.feed].video.push(data.data.children[x].data);
							}
						}
					}

					//remove duplicates
					self.Globals.videos[this_chan.feed].video = self.filterVideoDupes(self.Globals.videos[this_chan.feed].video);

					if(self.Globals.videos[this_chan.feed].video.length > 0){
						if(video_id !== null){
							self.loadVideoById(video_id);
						}else{
							self.loadVideoList(this_chan);
							self.Globals.cur_video = 0;
							self.loadVideo('first');
						}
						// $video_embed.removeClass('loading');
					}else{
						// $video_embed.removeClass('loading');
						alert('No videos found in '+this_chan.channel);
					}
					$('body').removeClass('video-loading');
				},
				error: function(jXHR, textStatus, errorThrown) {
					if(textStatus !== 'abort'){
						alert('Could not load feed. Is reddit down?');
					}
				}
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
			}else{
				alert('No videos loaded for '+this_chan.feed.slice(0,-5));
			}
		}
	},

	getFeedURI: function(channel_obj) {
		var sorting = self.Globals.sorting.split(':');
		var sortType = '';
		var sortOption = '';
		var uri;

		if (sorting.length === 2) {

			sortType = sorting[0] + '/';
			sortOption = '&t=' + sorting[1];
		}

		if (channel_obj.type === 'search' && sorting.length === 1) {

			uri = channel_obj.feed + Globals.search_str + '&limit=100';
		}
		else {

			uri = channel_obj.feed + sortType + '.json?limit=100' + sortOption;
			// Can we do this with searching? sortType seems in the way.
			// uri = channel_obj.feed + sortType."/search/.json?q=%28and+%28or+site%3A%27youtube.com%27+site%3A%27vimeo.com%27+site%3A%27youtu.be%27%29+timestamp%3A1382227035..%29&restrict_sr=on&sort=top&syntax=cloudsearch&limit=100";

		}

		console.log(uri);
		return uri;
	},

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
	},

	filterVideoDupes: function(arr) {
		var i, out=[], obj={}, original_length = arr.length;
		
		//work from last video to first video (so hottest dupe is left standing)
		//first pass on media embed
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
	},

	findVideoById: function(id,chan) {
		for(var x in self.Globals.videos[chan].video){
			if(self.Globals.videos[chan].video[x].id === id){
				return Number(x); //if found return array pos
			}
		}
		return false; //not found
	},

	sfwCheck: function(video, chan) {
		return (self.Globals.sfw && self.Globals.videos[chan].video[video].over_18);
	},

	showHideNsfwThumbs: function(sfw, this_chan) {
		$('.nsfw_thumb').each(function() {
				$(this).attr('src', self.getThumbnailUrl(this_chan.feed, Number($(this).attr('rel'))));
		});
	},

	getThumbnailUrl: function(chan, video_id) {
		var video = (typeof chan == 'object') ? chan.video[video_id] : self.Globals.videos[chan].video[video_id];

		if (self.sfwCheck(video_id, chan)) {
			return 'img/nsfw.png';
		}
		else if (video.media.oembed) {
			return video.media.oembed.thumbnail_url !== undefined ? 
				video.media.oembed.thumbnail_url :
				'img/noimage.png';
		}
		else {
			return 'img/noimage.png';
		}
	},

	createEmbed: function(url, type){
		switch(type){
		case 'youtube.com': case 'youtu.be':
			return youtube.createEmbed(url);
		case 'vimeo.com':
			return vimeo.createEmbed(url);
		default:
			return false;
		}
	},

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
	},

	addListeners: function(type) {
		switch (type) {
			case 'vimeo.com':
				vimeo.addListeners();
		}
	},

	apiCall: function(action, data, successCallback, errorCallback) {
		var apiData = $.extend({ 'action' : action }, (typeof data != 'object') ? {} : data );

		if ( !$.isFunction(successCallback) ) successCallback = function(){};
		if ( !$.isFunction(errorCallback) )	errorCallback	= function(){};

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
	},

	checkAnchor: function() {
		/* Anchor Checker */
		//check fo anchor changes, if there are do stuff
		if(self.Globals.current_anchor !== document.location.hash){
			console.log('anchor changed');
			self.Globals.current_anchor = document.location.hash;
			if(!self.Globals.current_anchor){
				/* do nothing */
			}else{
				var anchor = self.Globals.current_anchor.substring(1);
				var parts = anchor.split("/"); // #/r/videos/id
				parts = $.map(parts, self.stripHTML);

				/*if (anchor == 'add-channel') {
					toggleAddChannel();
					return;
				} else {
					$('#main-container').removeClass('add-channel');
				}*/

				if(parts[1] === 'promo'){
					// self.loadPromo(parts[2], parts[3], parts[4]);
				}else{
					var feed = '/' + parts[1] + '/' + parts[2];
					var new_chan_name = self.getChanName(feed);
					if(!new_chan_name){
						// addChannel(parts[2]);
						new_chan_name = self.getChanName(feed);
					}
					var new_chan_num = self.getChan(new_chan_name);
					var new_chan = { feed: '/' + parts[1] + '/' + parts[2] };
					if(new_chan_name !== undefined && new_chan_num !== self.Globals.cur_chan){
						if(parts[3] === undefined || parts[3] === null || parts[3] === ''){
							console.log('[checkAnchor]', 'loadChannel 1');
							self.loadChannel(new_chan, null);
						}else{
							console.log('[checkAnchor]', 'loadChannel', parts[3]);
							self.loadChannel(new_chan, parts[3]);
						}
					}else{
						if(self.Globals.videos[new_chan_num] !== undefined){
							console.log('[checkAnchor]', 'loadVideoById');
							self.loadVideoById(parts[3]);
						}else{
							console.log('[checkAnchor]', 'loadChannel');
							self.loadChannel(new_chan, parts[3]);
						}
					}
				}
			}
		}else{
			return false;
		}
	},

	getChanName: function(feed) {
		console.log('[getChanName]', feed);
		var channels = $.extend(self.Globals.channels, self.Globals.user_channels);
		for(var x in channels){
			if(self.Globals.channels[x].feed.indexOf(feed) !== -1){
				return self.Globals.channels[x].channel;
			}
		}
		return false;
	},

	getChan: function(channel) {
		console.log('getChan():', channel);
		for(var x in self.Globals.channels){
			if(self.Globals.channels[x].channel === channel || self.Globals.channels[x].feed === channel){
				return x;
			}
		}
		return false;
	},

	videoListCloseTimeout: function() {
		// console.log('[videoListMouse] '+videoListMouse);
		if (self.Globals.videoListMouse == false) {
			self.closeVideoList();
		}
	},

	videoListOpenTimeout: function() {
		// console.log('[videoListMouse] '+videoListMouse);
		if(self.Globals.videoListMouse == true) {
			self.openVideoList();
		}
	},

	toggleVideoList: function() {
		if($('#video-list').hasClass('bounceOutUp')) {
			self.openVideoList();
		}
		else {
			self.closeVideoList();
		}
	},

	openVideoList: function() {
		// videoList.open = true;
		$('#video-list').addClass('slideInDown').removeClass('bounceOutUp');
	},

	closeVideoList: function() {
		// videoList.open = false;
		$('#video-list').addClass('bounceOutUp').removeClass('slideInDown');
		$('#vid-list-tooltip').hide();
	},

	loadVideoList: function(chan) {
		console.log('[loadVideoList]', chan);

		var this_chan = chan,
			$list = $('<span></span>');
		for(var i in self.Globals.videos[this_chan.feed].video) {
			var this_video = self.Globals.videos[this_chan.feed].video[i];
			$thumbnail = self.thumbElement(this_video, this_chan, i);
			$list.append($thumbnail);
		}
		console.log('list', $list.find('.thumbnail').length);

		$('#video-list')
			.html($list);

		// Populate with ads
		if (self.Globals.ads && self.Globals.ads.videos.length > 0) {
			var adNum = 0;

			$('#video-list .thumbnail').each(function(i) {
				if (i == self.Globals.ads.settings.start - 1) adNum = self.Globals.ads.settings.every;

				var num = (adNum == 0) ? i : adNum,
					set = (adNum == 0) ? self.Globals.ads.settings.start : self.Globals.ads.settings.every,
					ad, thumbnail;

				if ( adNum == self.Globals.ads.settings.every ) {
					ad = self.getRandomAd();
					thumbnail = self.thumbElement(ad, {feed: '/promo' }, rtv.Globals.ads.videos.indexOf(ad));
					thumbnail.insertBefore($(this));

					adNum = 1;
				}

				if (i >= self.Globals.ads.settings.start) adNum++;
			});
		}

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

		// videoList.open = true;
		setTimeout(self.toggleVideoList, 2000);
	},

	loadVideo: function(video) {
		var this_chan = self.Globals.cur_chan,
			this_video = self.Globals.cur_video,
			selected_video = this_video,
			videos_size = Object.size(self.Globals.videos[this_chan.feed].video)-1;

		/*if(!videoList.open) {
			self.openVideoList();
			setTimeout(self.videoListCloseTimeout, 2000);
		}*/

		if(self.Globals.shuffle){
			if(self.Globals.shuffled.length === 0){
				self.shuffleChan(this_chan);
			}
			//get normal key if shuffled already
			selected_video = self.Globals.shuffled.indexOf(selected_video);
		}
		 
		if(video === 'next' && selected_video <= videos_size){
			selected_video++;
			if(selected_video > videos_size){
				selected_video = 0;
			}
			while(self.sfwCheck(self.getVideoKey(selected_video), this_chan.feed) && selected_video < videos_size){
				selected_video++;
			}
			if(self.sfwCheck(getVideoKey(selected_video), this_chan.feed)){
				selected_video = this_video;
			}
		}else if(selected_video >= 0 && video === 'prev'){
			selected_video--;
			if(selected_video < 0){
				selected_video = videos_size;
			}
			while(self.sfwCheck(getVideoKey(selected_video), this_chan.feed) && selected_video > 0){
				selected_video--;
			}
			if(self.sfwCheck(getVideoKey(selected_video), this_chan.feed)){
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
		if(self.sfwCheck(selected_video, this_chan.feed)){
			return false;
		}

		if(selected_video !== this_video || video === 'first' || video === 0) {
			self.Globals.cur_video = selected_video;

			// scroll to thumbnail in video list and highlight it
			$('#video-list .focus').removeClass('focus');
			$('#video-list-thumb-' + selected_video).addClass('focus');
			$('#video-list:not(.scrollbar)').stop(true,true).scrollTo('.focus', { duration:1000, offset:-280 });
			if ($('#video-list').hasClass('scrollbar')) { // Only do this for the jScrollPane-esque thing
				var focused	  = $('#video-list .focus'),
					focusedLeft  = (focused.length) ? focused.position().left : 0,
					spanMargin	= parseInt($('#video-list > span').css('margin-left')),
					scrollMargin = (spanMargin - focusedLeft < -280) ? Math.round(spanMargin - focusedLeft + 280) : 0;

				if (Math.abs(scrollMargin) - 150 >= $('#video-list > span').width() - $(document).width())
					scrollMargin = -Math.abs($('#video-list > span').width() - $(document).width());

				$('#video-list > span').stop(true,true).animate({ marginLeft: scrollMargin + 'px'}, 1000, function() {
					// To-do: reset handle position
					// $('#video-list-scrollbar .ui-slider-handle')
				});
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

			var video = self.Globals.videos[this_chan.feed].video[selected_video];
			//set location hash
			var parts, hash = document.location.hash;
			if(!hash){
				var feed = this_chan.feed;
				parts = feed.split("/");
				hash = '/'+parts[1]+'/'+parts[2]+'/'+video.id;
			}else{
				var anchor = hash.substring(1);
				parts = anchor.split("/"); // #/r/videos/id
				hash = '/'+parts[1]+'/'+parts[2]+'/'+video.id;
			}
			Globals.current_anchor = '#'+hash;
			window.location.hash = hash;

			self.gaHashTrack();

			var $video_embed = $('#video-embed');

			$video_embed.empty();
			// $video_embed.addClass('loading');
			self.loadingAnimation('', video.media.oembed.thumbnail_url);

			var embed = $.unescapifyHTML(video.media_embed.content);
			embed = self.prepEmbed(embed, video.domain);
			embed = self.prepEmbed(embed, 'size');

			var redditlink = 'http://reddit.com'+$.unescapifyHTML(video.permalink);
			$('#video-title').html('<a href="' + redditlink + '" target="_blank"'
									+ ' title="' + video.title_quot + '">'
									+ video.title_unesc + '</a>');
			$('#video-comments-link').attr("href", redditlink);
			$('#video-tweet-link').attr("href", "https://twitter.com/intent/tweet?original_referer="
									+ window.location + "&tweet=" 
									+ video.title_quot 
									+ "&url="+redditlink);
			$('#video-share-link').attr("href", redditlink);
			$video_embed.html(embed);
			// $video_embed.removeClass('loading');
			$('body').removeClass('video-loading');

			self.addListeners(video.domain);

			/*var reddit_string = self.redditButton('t3_' + self.Globals.videos[this_chan.feed].video[selected_video].id);
			var $vote_button = $('#vote-button');
			$vote_button.stop(true,true).fadeOut('slow', function() {
					$vote_button.html(reddit_string).fadeTo('slow', 1);
			});*/

			var video_source_text = 'Source: ' +
				'<a href="' + video.url + '" target="_blank">' +
				video.domain +
				'</a>';
			var $video_source = $('#video-source');
			$video_source.stop(true,true).fadeOut('slow', function() {
				$video_source.html(video_source_text).fadeIn('slow');
			});

			/*self.resizePlayer();
			self.fillScreen();*/
		}
	},

	thumbElement: function(this_video, this_chan, id) {
		var videoId, url, $thumbnail, thumbnail_image;
		console.log(this_video, this_chan);

		if ( this_video.title && !this_video.title_unesc ) {
			this_video.title_unesc = $.unescapifyHTML(this_video.title);
			this_video.title_quot  = String(this_video.title_unesc).replace(/\"/g,'&quot;');
		}
		if ( !this_video.title ) this_video.title_unesc = this_video.title_quot = '';

		videoId = (self.Globals.videos[this_chan.feed]) ? self.Globals.videos[this_chan.feed].video[id].id : id;
		url = this_chan.feed + '/' + videoId;

		// id="video-list-thumb-' + i + '"
		// ' rel="' + i + '"'
		$thumbnail = $('<a href="#' + url + '" class="thumbnail"></a>');
		if (this_video.title_quot) $thumbnail.attr('title', this_video.title_quot);

		// make nsfw thumbnails easily findable
		if (this_video.over_18) {
			$thumbnail.addClass('nsfw_thumb');
		}

		thumbnail_image = (this_video.image_url) ? this_video.image_url : self.getThumbnailUrl(this_chan.feed, id);
		$thumbnail.css('background-image', 'url(' + thumbnail_image + ')');

		return $thumbnail;
	},

	getVideoKey: function(key){
		if(self.Globals.shuffle && self.Globals.shuffled.length === Globals.videos[self.Globals.cur_chan.feed].video.length){
			return self.Globals.shuffled[key];
		} else {
			return key;
		}
	},

	loadVideoById: function(video_id) {
		var this_chan = self.Globals.cur_chan,
		video = self.findVideoById(video_id, this_chan.feed);  //returns number typed

		if(video !== false){
			self.loadVideoList(this_chan);
			self.loadVideo(Number(video));
		}else{
			//ajax request
			var last_req = self.Globals.cur_vid_req;
			if(last_req !== null){
				last_req.abort();
			}

			Globals.cur_vid_req = $.ajax({
				url: "http://www.reddit.com/by_id/t3_"+video_id+".json",
				dataType: "jsonp",
				jsonp: "jsonp",
				success: function(data) {
					var video = data.data.children[0].data;
					if (!self.isEmpty(video.media_embed) && self.isVideo(video.media.type)) {
						self.Globals.videos[this_chan.feed].video.splice(0, 0, video);
					}

					self.loadVideoList(this_chan);
					self.loadVideo('first');
				},
				error: function (jXHR, textStatus, errorThrown) {
					if (textStatus !== 'abort') {

						alert('Could not load data. Is reddit down?');
					}
				}
			});
		}
	},

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
	},

	loadingAnimation: function(text, background) {
		if ( $('#main-container').hasClass('add-channel') )
			self.toggleAddChannel(true);

		$('body').addClass('video-loading');
		if (!text) text = '';
		$('#loading .what').html(text);
		if (background) $('#loading .tv .image').css({ 'background-image' : 'url(' + background + ')' });
	},

	toggleAddChannel: function(instant) {
		var vid  = $('#video-embed'),
			vidW = vid.width(),
			vidH = vid.height(),
			container = $('#main-container'),
			speed = (instant === true) ? 10 : 500;

		console.log('vid w/h:', vidW, vidH);
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
	},

	addChannelFromForm: function() {
		var channel = $('#add-channel input.channel-name').val();

		if (channel != '')
			self.addChannel(channel);

		return false;
	},

	addChannel: function(subreddit) {
		var click;
		if (!subreddit) {
			subreddit = self.stripHTML($('#channel-name').val());
			click = true;
		}
		if (!getChan(subreddit)) {
			var feed = "/r/"+subreddit;
			console.log(feed);

			var c_data = {'channel': subreddit, feed: feed};
			self.Globals.channels.unshift(c_data);
			self.Globals.user_channels.unshift(c_data);
			
			$.jStorage.set('user_channels', self.Globals.user_channels);

			self.displayChannel(feed);

			/*if (click){
				$('#channel-'+x).click();
			}*/
		}

		return false;
	},

	getRandomAd: function() {
		if ( self.Globals.ads.used.length == self.Globals.ads.videos.length ) {
			self.Globals.ads.last = self.Globals.ads.used[self.Globals.ads.used.length-1];
			self.Globals.ads.used = [];
		}

		var rand = Math.floor( Math.random() * self.Globals.ads.videos.length );

		if (self.Globals.ads.last != rand) self.Globals.ads.last = null;
		if (self.Globals.ads.last == rand || $.inArray(rand, self.Globals.ads.used) >= 0)
			return self.getRandomAd();

		self.Globals.ads.used.push(rand);

		return self.Globals.ads.videos[rand];
	},

	stripHTML: function(s) {
		return s.replace(/[&<>"'\/]/g, '');
	},

	gaHashTrack: function() {
		if(!_gaq) return;
		_gaq.push(['_trackPageview',location.pathname + location.hash]);
	}
});

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