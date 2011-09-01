/* Channels Object */
var channels = [
    {"channel": "All", "feed": "/r/all/.json"}
    ,{"channel": "Videos", "feed": "/r/videos/.json"}
    ,{"channel": "YouTube", "feed": "/domain/youtube.com/.json"}
    ,{"channel": "WTF", "feed": "/r/wtf/.json"}
    //,{"channel": "Funny", "feed": "/r/funny/.json"}

    ,{"channel": "Docs", "feed": "/r/documentaries/.json"}
    ,{"channel": "Politics", "feed": "/r/politics/search/.json?q=reddit%3Apolitics+site%3Ayoutube.com&sort=relevance"}

    ,{"channel": "Gaming", "feed": "/r/gaming/.json"}
    //,{"channel": "Science", "feed": "/r/science/.json"}
    ,{"channel": "Geek", "feed": "/r/geek/.json"}
    ,{"channel": "AWW", "feed": "/r/aww/.json"}

    ,{"channel": "Music", "feed": "/r/music/.json"}
    ,{"channel": "Listen", "feed": "/r/listentothis/.json"}
    ,{"channel": "Radio", "feed": "/r/radioreddit/search/.json?q=site%3A{youtube.com}+reddit%3A{radioreddit}&sort=relevance"}

    ,{"channel": "Lectures", "feed": "/r/lectures/.json"}
    ,{"channel": "TED", "feed": "/domain/ted.com/.json"}

    ,{"channel": "Sports", "feed": "/r/sports/.json"}
];

/* Video Domains */
var domains = ['5min.com', 'abcnews.go.com', 'animoto.com', 'atom.com',
	       'bambuser.com', 'bigthink.com', 'blip.tv', 'break.com',
	       'cbsnews.com', 'cnbc.com', 'cnn.com', 'colbertnation.com', 'collegehumor.com',
	       'comedycentral.com', 'crackle.com', 'dailymotion.com',
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
	       'video.pbs.org', 'video.yahoo.com', 'vids.myspace.com', 'vimeo.com',
	       'wordpress.tv', 'worldstarhiphop.com', 'xtranormal.com',
	       'youtube.com', 'zapiks.com'];

/* Global Vars */
var videos = [];
var cur_video = 0;
var cur_chan = 0;
var cur_chan_req = null;
var cur_vid_req = null;
var currentAnchor = null;
var auto = true;
var sfw = true;
var theme = 'light';
var yt_player = false;

/* Document Ready */
$().ready(function(){
    loadSettings();
    loadTheme(theme);
    displayChannels();
    loadChannel("Videos", null);

    /* Bindings */
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
    $('#auto').click(function() {
        auto = ($('#auto').is(':checked')) ? true : false;
	$.cookie('auto', auto, {expires: 7});
    });
    $('#sfw').click(function() {
        sfw = ($('#sfw').is(':checked')) ? true : false;
	$.cookie('sfw', sfw, {expires: 7});
	showHideNsfwThumbs(sfw, cur_chan);
    });
    $('#fill').click(function() {
	fillScreen();
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
    $(document).keydown(function (e) {
	var keyCode = e.keyCode || e.which, arrow = {left: 37, up: 38, right: 39, down: 40 };
	switch (keyCode) {
	    case arrow.left:  case 72: // h
	        loadVideo('prev');
		break;
	    case arrow.up:    case 75: // k
	        chgChan('up');
		break;
	    case arrow.right: case 76: // l
		loadVideo('next');
		break;
	    case arrow.down:  case 74: // j
	        chgChan('down');
		break;
	    case 32:
                ytTogglePlay();
	        break;
	    case 70:
	        if(yt_player){
		    $('#fill').attr('checked', true);
	            fillScreen();
	        }
	        break;
	    case 27:
	        if($('#fill').is(':checked')){
		    fillScreen();
	        }
		break;
	    case 67:
	        window.open($('#vote-button>a').attr('href'), '_blank');
		break;
	}
    });

    /* Anchor Checker */
    setInterval(checkAnchor, 100);
});

/* Main Functions */
function loadSettings() {
    var auto_cookie = $.cookie('auto'), sfw_cookie = $.cookie('sfw'), theme_cookie = $.cookie('theme');
    if(auto_cookie !== null && auto_cookie !== auto){
	auto = (auto_cookie === 'true') ? true : false;
	$('#auto').attr('checked', auto);
    }
    if(sfw_cookie !== null && sfw_cookie !== sfw){
	sfw = (sfw_cookie === 'true') ? true : false;
	$('#sfw').attr('checked', sfw);
    }
    if(theme_cookie !== null && theme_cookie !== theme){
        theme = theme_cookie;
    }
}

function loadTheme(id) {
    $('#theme').attr('href', 'css/theme_' + id + '.css');
    $.cookie('theme', id, {expires: 7});
}

function displayChannels() {
    var $channel_list = $('#channel-list'), $list = $('<ul></ul>'), title;
    $channel_list.html($list);
    for(var x in channels){
	title = channels[x].feed.split("/");
	title = "/"+title[1]+"/"+title[2];
	$('#channel-list>ul').append('<li id="channel-'+x+'" title="'+title+'">'+channels[x].channel+'</li>');
	$('#channel-'+x).bind(
			       'click'
	                       ,{channel: channels[x].channel, feed: channels[x].feed}
			       ,function(event) {
				   //loadChannel(event.data.channel);
				   var parts = event.data.feed.split("/");
				   window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
			       });
    }
}

function loadChannel(channel, video_id) {
    var last_req = cur_chan_req, this_chan = getChan(channel), $video_embed = $('#video-embed'), $video_title = $('#video-title'), title;

    if(last_req !== null){
	last_req.abort();
    }

    cur_chan = this_chan;
    $('#video-list').stop(true, true).animate({ height:0, padding:0 }, 500, function() {
	$(this).empty().hide();
    });
    $('#prev-button,#next-button').css({ 'visibility':'hidden', 'display':'none' });
    $('#vote-button').empty();
    $('#video-source').empty();

    title = channels[this_chan].feed.split("/");
    title = "/"+title[1]+"/"+title[2];

    $video_title.html('Loading '+title+' ...');
    $video_embed.addClass('loading');
    $video_embed.empty();
    
    $('#channel-list>ul>li').removeClass('chan-selected');
    $('#channel-'+this_chan).addClass('chan-selected');

    if(videos[this_chan] === undefined){
	var feed = getFeedName(channel);
	cur_chan_req = $.ajax({
	    url: "http://www.reddit.com"+feed+"?limit=100",
	    dataType: "jsonp",
	    jsonp: "jsonp",
	    success: function(data) {
		videos[this_chan] = {};
		videos[this_chan].video = []; //clear out stored videos
		for(var x in data.data.children){
                    if(!isEmpty(data.data.children[x].data.media_embed)
                       && isVideo(data.data.children[x].data.media.type)
                      )
                    {
			videos[this_chan].video.push(data.data.children[x].data);
                    }
		}
		
		//remove duplicates
		videos[this_chan].video = filterVideoDupes(videos[this_chan].video);

		if(videos[this_chan].video.length > 0){
		    if(video_id !== null){
			loadVideoById(video_id);
		    }else{
			loadVideoList(this_chan);
			cur_video = 0;
			loadVideo('first');
		    }
		}else{
		    alert('No videos found in '+channels[this_chan].feed.slice(0,-5));
		}
	    },
	    error: function(jXHR, textStatus, errorThrown) {
		if(textStatus !== 'abort'){
		    alert('Could not load feed. Is reddit down?');
		}
	    }
	});
    }else{
	if(videos[this_chan].video.length > 0){
	    if(video_id !== null){
		loadVideoById(video_id);
            }else{
		loadVideoList(this_chan);
		cur_video = 0;
		loadVideo('first');
	    }
	}else{
	    alert('No videos loaded for '+channels[this_chan].feed.slice(0,-5));
	}
    }
}

function loadVideoList(chan) {
    var this_chan = chan, $list = $('<span></span>');
    for(var i in videos[this_chan].video) {
	var this_video = videos[this_chan].video[i];

	if (! this_video.title_unesc) {
	    this_video.title_unesc = $.unescapifyHTML(this_video.title);
	    this_video.title_quot  = String(this_video.title_unesc).replace(/\"/g,'&quot;');
	}

	var $thumbnail = $('<img id="video-list-thumb-' + i + '"' + ' rel="' + i + '"' +
			   ' title="' + this_video.title_quot + '"/>');

	// make nsfw thumbnails easily findable
	if (this_video.over_18) {
	    $thumbnail.addClass('nsfw_thumb');
	}

	$thumbnail
	    .attr('src', getThumbnailUrl(this_chan, i))
	    .click(function() { loadVideo( Number($(this).attr('rel')) ); });

	$list.append($thumbnail);
    }

    $('#video-list')
        .stop(true, true)
	.html($list)
	.show()
	.animate({ height: '88px', padding: '5px' }, 1000, function() {
	    $('img').lazyload({
		placeholder : "img/noimage.png",
		effect : "fadeIn",
		container: $("#video-list")
	    });
	});
}

function loadVideo(video) {
    var this_chan = cur_chan, this_video = cur_video, selected_video = this_video;
    if(video === 'next' && selected_video < Object.size(videos[this_chan].video)-1){
	selected_video++;
	while(sfwCheck(this_chan, selected_video) && selected_video < Object.size(videos[this_chan].video)-1){
	    selected_video++;
	}
	if(sfwCheck(this_chan, selected_video)){
	    selected_video = this_video;
	}
    }else if (selected_video > 0 && video === 'prev'){
	selected_video--;
	while(sfwCheck(this_chan, selected_video) && selected_video > 0){
	    selected_video--;
	}
	if(sfwCheck(this_chan, selected_video)){
            selected_video = this_video;
        }
    }
    if(video === 'first'){
	if(sfwCheck(this_chan, selected_video)){
            while(sfwCheck(this_chan, selected_video) && selected_video < Object.size(videos[this_chan].video)-1){
		selected_video++;
            }
	}
    }
    if(typeof(video) === 'number'){ //must be a number NOT A STRING - allows direct load of video # in video array
	selected_video = video;
    }
    if(selected_video !== this_video || video === 'first' || video === 0) {
	cur_video = selected_video;

	// scroll to thumbnail in video list and highlight it
	$('#video-list .focus').removeClass('focus');
	$('#video-list-thumb-' + selected_video).addClass('focus');
	$('#video-list').stop(true,true).scrollTo('.focus', { duration:1000, offset:-280 });

	// enable/disable nav-buttons at end/beginning of playlist
	var $prevbutton = $('#prev-button'), $nextbutton = $('#next-button');
	if(selected_video <= 0){
	    $prevbutton.stop(true,true).fadeOut('slow', function() {
		$(this).css({ 'visibility':'hidden', 'display':'inline' });
	    });
	}else if($prevbutton.css('visibility') === 'hidden'){
	    $prevbutton.hide().css({ 'visibility':'visible' }).stop(true,true).fadeIn('slow');
	}

	if(cur_video >= Object.size(videos[this_chan].video)-1){
	    $nextbutton.stop(true,true).fadeOut('slow', function() {
		$(this).css({ 'visibility':'hidden', 'display':'inline' });
	    });
	}else if($nextbutton.css('visibility') === 'hidden'){
	    $nextbutton.hide().css({ 'visibility':'visible' }).stop(true,true).fadeIn('slow');
	}

	//set location hash
	var hash = document.location.hash;
        if(!hash){
	    var feed = channels[this_chan].feed;
	    var parts = feed.split("/");
	    hash = '/'+parts[1]+'/'+parts[2]+'/'+videos[this_chan].video[selected_video].id;
        }else{
            var anchor = hash.substring(1);
            var parts = anchor.split("/"); // #/r/videos/id
            hash = '/'+parts[1]+'/'+parts[2]+'/'+videos[this_chan].video[selected_video].id;
	}
	currentAnchor = '#'+hash;
        window.location.hash = hash;

	$('#video-embed').empty();
	var embed = $.unescapifyHTML(videos[this_chan].video[selected_video].media_embed.content);
	if(videos[this_chan].video[selected_video].media.type === 'youtube.com'){
	    embed = prepYT(embed);
	}else{
	    yt_player = false;
	}

	var redditlink = 'http://reddit.com'+$.unescapifyHTML(videos[this_chan].video[selected_video].permalink);
	$('#video-title').html('<a href="' + redditlink + '" target="_blank"'
			       + ' title="' + videos[this_chan].video[selected_video].title_quot + '">'
			       + videos[this_chan].video[selected_video].title_unesc + '</a>');
	$('#video-embed').html(embed);
	

	var score = videos[this_chan].video[selected_video].score;
	var num_comments = videos[this_chan].video[selected_video].num_comments;
	
	var reddit_string = '<a href="'+redditlink+'" target="_blank">'
	    + score + ((score === 1) ? ' vote' : ' votes')
	    + ' &bull; '
	    + num_comments + ((num_comments === 1) ? ' comment' : ' comments')
	    + '</a>';

	/*
	console.log("video URL: " + videos[cur_chan].video[cur_video].url);
	console.log("as send to reddit: " + encodeURIComponent(videos[cur_chan].video[cur_video].url));

	var reddit_string = redditButton(
	    encodeURIComponent(videos[cur_chan].video[cur_video].url),
	    encodeURIComponent($.unescapifyHTML(videos[cur_chan].video[cur_video].title))
	);
	*/

	var $vote_button = $('#vote-button');
	$vote_button.stop(true,true).fadeOut('slow', function() {
	    $vote_button.html(reddit_string).fadeIn('slow');
	});

	var video_source_text = 'Source: '
	    + '<a href="' + videos[this_chan].video[selected_video].url + '" target="_blank">'
	    + videos[this_chan].video[selected_video].media.oembed.provider_name
	    + '</a>';
	var $video_source = $('#video-source');
	$video_source.stop(true,true).fadeOut('slow', function() {
	    $video_source.html(video_source_text).fadeIn('slow');
	});

	fillScreen();
    }
}

function loadVideoById(video_id) {
    var this_chan = cur_chan, video = findVideoById(this_chan, video_id);  //returns number typed
    if(video !== false){
	loadVideoList(this_chan);
        loadVideo(Number(video));
    }else{
        //ajax request
	var last_req = cur_vid_req;
	if(last_req !== null){
            last_req.abort();
	}
	
	cur_vid_req = $.ajax({
            url: "http://www.reddit.com/by_id/t3_"+video_id+".json",
	    dataType: "jsonp",
	    jsonp: "jsonp",
            success: function(data) {
                if(!isEmpty(data.data.children[0].data.media_embed)
                   && isVideo(data.data.children[0].data.media.type)
                  )
                {
                    videos[this_chan].video.splice(0,0,data.data.children[0].data);
                }
		loadVideoList(this_chan);
		loadVideo('first');
            },
            error: function(jXHR, textStatus, errorThrown) {
		if(textStatus !== 'abort'){
                    alert('Could not load data. Is reddit down?');
		}
            }
        });
    }
}

function isVideo(video_domain) {
    return (domains.indexOf(video_domain) !== -1);
}

//http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
function filterVideoDupes(arr){
    var i, out=[], obj={}, original_length = arr.length;
    
    //work from last video to first video (so hottest dupe is left standing)
    //first pass on media embed
    for (i=arr.length-1; i>=0; i--) {
	if(typeof obj[arr[i].media_embed.content] != 'undefined'){
	    delete obj[arr[i].media_embed.content];
	}
	obj[arr[i].media_embed.content]=arr[i];
    }
    for (i in obj) {
	out.push(obj[i]);
    }

    arr = out.reverse()
    out = [];
    obj = {};

    //second pass on url
    for (i=arr.length-1; i>=0; i--) {
	if(typeof obj[arr[i].url] != 'undefined'){
            delete obj[arr[i].url];
        }
        obj[arr[i].url]=arr[i];
    }
    for (i in obj) {
        out.push(obj[i]);
    }

    console.log('Removed '+ (original_length - out.length) + ' dupes.');
    return out.reverse();
}

function findVideoById(chan, id) {
    for(var x in videos[chan].video){
	if(videos[chan].video[x].id === id){
	    return Number(x); //if found return array pos
	}
    }
    return false; //not found
}

function sfwCheck(chan, video) {
    return (sfw && videos[chan].video[video].over_18);
}

function showHideNsfwThumbs(this_sfw, this_chan) {
    $('.nsfw_thumb').each(function() {
	$(this).attr('src', getThumbnailUrl(this_chan, Number($(this).attr('rel'))));
    });
}

function getThumbnailUrl(chan, video_id) {
    if (sfwCheck(chan, video_id)) {
	return 'img/nsfw.png';
    }
    else if (videos[chan].video[video_id].media.oembed.thumbnail_url) {
	return videos[chan].video[video_id].media.oembed.thumbnail_url;
    }
    else {
	return 'img/noimage.png';
    }
}

function chgChan(up_down) {
    var old_chan = cur_chan, this_chan = old_chan;
    if(up_down === 'up' && this_chan > 0){
	this_chan--;
    }else if(up_down !== 'up' && this_chan < channels.length-1){
	this_chan++;
    }
    if(this_chan !== old_chan){
	var parts = channels[this_chan].feed.split("/");
        window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
    }
}

function getFeedName(channel) {
    for(var x in channels){
	if(channels[x].channel === channel){
	    return channels[x].feed;
	}
    }
}

function getChanName(feed) {
    for(var x in channels){
        if(channels[x].feed.indexOf(feed) !== -1){
            return channels[x].channel;
        }
    }
}

function getChan(channel) {
    for(var x in channels){
        if(channels[x].channel === channel || channels[x].feed === channel){
            return x;
        }
    }
}

function fillScreen() {
    if(yt_player){
	$object = $('#video-embed embed');
	$fill = $('#fill');
	$filloverlay = $('#fill-overlay');
	if($object.hasClass('fill-screen')){
	    $fill.attr('checked', false);
            $object.removeClass('fill-screen');
	    $filloverlay.css('display', 'none');
	}else if($fill.is(':checked')){
            $fill.attr('checked', true);
	    $object.addClass('fill-screen');
	    $filloverlay.css('display', 'block');
	}
    }
}

/* Anchor Checker */
//check fo anchor changes, if there are do stuff
function checkAnchor(){
    if(currentAnchor !== document.location.hash){
        currentAnchor = document.location.hash;
        if(!currentAnchor){
        }else{
            var anchor = currentAnchor.substring(1);
	    var parts = anchor.split("/"); // #/r/videos/id
	    var feed = "/"+parts[1]+"/"+parts[2]+"/";
	    var new_chan_name = getChanName(feed);
	    var new_chan_num = getChan(new_chan_name);
	    if(new_chan_name !== undefined && new_chan_num !== cur_chan){
		if(parts[3] === undefined || parts[3] === null || parts[3] === ''){
		    loadChannel(new_chan_name, null);
		}else{
		    loadChannel(new_chan_name, parts[3]);
		}
	    }else{
		if(videos[new_chan_num] !== undefined){
		    loadVideoById(parts[3]);
		}else{
		    loadChannel(new_chan_name, parts[3]);
		}
	    }
        }
    }else{
        return false;
    }
}

/* Reddit Functions */
function redditButton(permalink, title){
    var reddit_string="<iframe src=\"http://www.reddit.com/static/button/button1.html?width=120";
    //reddit_string += '&id=' + videos[cur_chan].video[cur_video].id;
    reddit_string += '&url=' + permalink;
    reddit_string += '&title=' + title;
    //reddit_string += '&sr=' + encodeURIComponent($.unescapifyHTML(videos[cur_chan].video[cur_video].subreddit));
    //reddit_string += '&css=' + encodeURIComponent(window.reddit_css);
    //reddit_string += '&bgcolor=' + encodeURIComponent(window.reddit_bgcolor);
    //reddit_string += '&bordercolor=' + encodeURIComponent(window.reddit_bordercolor);
    reddit_string += '&newwindow=' + encodeURIComponent('1');
    reddit_string += "\" height=\"22\" width=\"150\" scrolling='no' frameborder='0'></iframe>";
    
    return reddit_string;
}


/* Video Functions */
/* YouTube */
function prepYT(embed) {
    var js_str = '?enablejsapi=1&version=3&playerapiid=ytplayer';
    if(embed.indexOf('?version=3"') !== -1){
        split = embed.indexOf('?version=3"');
        embed = embed.substr(0,split)+js_str+embed.substr(split+10);
    }else if(embed.indexOf('&version=3"') !== -1){
        split = embed.indexOf('&version=3"');
        embed = embed.substr(0,split)+js_str+embed.substr(split+10);
    }
    
    if(embed.indexOf('?version=3" type="') !== -1){
        split = embed.indexOf('?version=3" type="');
        embed = embed.substr(0,split)+js_str+embed.substr(split+10);
    }else if(embed.indexOf('&version=3" type="') !== -1){
        split = embed.indexOf('&version=3" type="');
        embed = embed.substr(0,split)+js_str+embed.substr(split+10);
    }
    split = embed.indexOf('embed')+5;
    embed = embed.substr(0,split)+' id="ytplayer" wmode="transparent"'+embed.substr(split);
    return embed;
}

function ytAuto(state) {
    if(auto){
        if(state === 0){
            loadVideo('next');
        }else if(state === -1){
            ytTogglePlay();
        }
    }
}

function onYouTubePlayerReady(playerId) {
    yt_player = document.getElementById("ytplayer");
    yt_player.addEventListener("onStateChange", "ytAuto", true);
}

function ytTogglePlay() {
    if (yt_player) {
	//unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
	if(yt_player.getPlayerState() !== 1){
	    yt_player.playVideo();
	}else{
	    yt_player.pauseVideo();
	}
    }
}

/* Utility Functions */
function isEmpty(obj) {
    for(var prop in obj) {
	if(obj.hasOwnProperty(prop)){
            return false;
	}
    }
    return true;
}

Object.size = function(obj) {
    var size = 0, key;
    for(key in obj) {
	if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};