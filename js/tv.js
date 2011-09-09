/* Globals */
var globals = {

    /* Channels Object */
    channels: [
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
    ]
    
    /* Video Domains */
    ,domains: [
        '5min.com', 'abcnews.go.com', 'animoto.com', 'atom.com',
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
	'youtube.com', 'zapiks.com'
    ]

    ,videos: []
    ,cur_video: 0
    ,cur_chan: 0
    ,cur_chan_req: null
    ,cur_vid_req: null
    ,current_anchor: null
    ,auto: true
    ,sfw: true
    ,theme: 'light'
}

/* Document Ready */
$().ready(function(){
    loadSettings();
    loadTheme(globals.theme);
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
        globals.auto = ($('#auto').is(':checked')) ? true : false;
        $.cookie('auto', globals.auto, {expires: 7});
    });
    $('#sfw').click(function() {
        globals.sfw = ($('#sfw').is(':checked')) ? true : false;
        $.cookie('sfw', globals.sfw, {expires: 7});
        showHideNsfwThumbs(globals.sfw, globals.cur_chan);
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
    if(auto_cookie !== null && auto_cookie !== globals.auto){
        globals.auto = (auto_cookie === 'true') ? true : false;
        $('#auto').attr('checked', globals.auto);
    }
    if(sfw_cookie !== null && sfw_cookie !== globals.sfw){
        globals.sfw = (sfw_cookie === 'true') ? true : false;
        $('#sfw').attr('checked', globals.sfw);
    }
    if(theme_cookie !== null && theme_cookie !== globals.theme){
        globals.theme = theme_cookie;
    }
}

function loadTheme(id) {
    $('#theme').attr('href', 'css/theme_' + id + '.css');
    $.cookie('theme', id, {expires: 7});
}

function displayChannels() {
    var $channel_list = $('#channel-list'), $list = $('<ul></ul>'), title;
    $channel_list.html($list);
    for(var x in globals.channels){
        title = globals.channels[x].feed.split("/");
        title = "/"+title[1]+"/"+title[2];
        $('#channel-list>ul').append('<li id="channel-'+x+'" title="'+title+'">'+globals.channels[x].channel+'</li>');
        $('#channel-'+x).bind(
            'click'
            ,{channel: globals.channels[x].channel, feed: globals.channels[x].feed}
            ,function(event) {
                var parts = event.data.feed.split("/");
                window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
            }
        );
    }
}

function loadChannel(channel, video_id) {
    var last_req = globals.cur_chan_req, this_chan = getChan(channel), $video_embed = $('#video-embed'), $video_title = $('#video-title'), title;

    if(last_req !== null){
        last_req.abort();
    }

    globals.cur_chan = this_chan;
    $('#video-list').stop(true, true).animate({ height:0, padding:0 }, 500, function() {
        $(this).empty().hide();
    });
    $('#prev-button,#next-button').css({ 'visibility':'hidden', 'display':'none' });
    $('#vote-button').empty();
    $('#video-source').empty();

    title = globals.channels[this_chan].feed.split("/");
    title = "/"+title[1]+"/"+title[2];

    $video_title.html('Loading '+title+' ...');
    $video_embed.addClass('loading');
    $video_embed.empty();
    
    $('#channel-list>ul>li').removeClass('chan-selected');
    $('#channel-'+this_chan).addClass('chan-selected');

    if(globals.videos[this_chan] === undefined){
        var feed = getFeedName(channel);
        globals.cur_chan_req = $.ajax({
            url: "http://www.reddit.com"+feed+"?limit=100",
            dataType: "jsonp",
            jsonp: "jsonp",
            success: function(data) {
                globals.videos[this_chan] = {};
                globals.videos[this_chan].video = []; //clear out stored videos
                for(var x in data.data.children){
                    if(!isEmpty(data.data.children[x].data.media_embed)
                       && isVideo(data.data.children[x].data.media.type)
                      )
                    {
                        globals.videos[this_chan].video.push(data.data.children[x].data);
                    }
                }

                //remove duplicates
                globals.videos[this_chan].video = filterVideoDupes(globals.videos[this_chan].video);

                if(globals.videos[this_chan].video.length > 0){
                    if(video_id !== null){
                        loadVideoById(video_id);
                    }else{
                        loadVideoList(this_chan);
                        globals.cur_video = 0;
                        loadVideo('first');
                    }
                    $video_embed.removeClass('loading');
                }else{
                    $video_embed.removeClass('loading');
                    alert('No videos found in '+globals.channels[this_chan].feed.slice(0,-5));
                }
            },
            error: function(jXHR, textStatus, errorThrown) {
                if(textStatus !== 'abort'){
                    alert('Could not load feed. Is reddit down?');
                }
            }
        });
    }else{
        if(globals.videos[this_chan].video.length > 0){
            if(video_id !== null){
	        loadVideoById(video_id);
            }else{
                loadVideoList(this_chan);
                globals.cur_video = 0;
                loadVideo('first');
            }
        }else{
            alert('No videos loaded for '+globals.channels[this_chan].feed.slice(0,-5));
        }
    }
}

function loadVideoList(chan) {
    var this_chan = chan, $list = $('<span></span>');
    for(var i in globals.videos[this_chan].video) {
        var this_video = globals.videos[this_chan].video[i];

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
    var this_chan = globals.cur_chan,
        this_video = globals.cur_video,
        selected_video = this_video, 
        videos_size = Object.size(globals.videos[this_chan].video)-1;
    
    if(video === 'next' && selected_video < videos_size){
        selected_video++;
        while(sfwCheck(selected_video, this_chan) && selected_video < videos_size){
            selected_video++;
        }
        if(sfwCheck(selected_video, this_chan)){
            selected_video = this_video;
        }
    }else if (selected_video > 0 && video === 'prev'){
        selected_video--;
        while(sfwCheck(selected_video, this_chan) && selected_video > 0){
            selected_video--;
        }
        if(sfwCheck(selected_video, this_chan)){
            selected_video = this_video;
        }
    }
    if(video === 'first'){
        if(sfwCheck(selected_video, this_chan)){
            while(sfwCheck(selected_video, this_chan) && selected_video < videos_size){
                selected_video++;
            }
        }
    }
    if(typeof(video) === 'number'){ //must be a number NOT A STRING - allows direct load of video # in video array
        selected_video = video;
    }
    if(selected_video !== this_video || video === 'first' || video === 0) {
        globals.cur_video = selected_video;

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

        if(globals.cur_video >= videos_size){
            $nextbutton.stop(true,true).fadeOut('slow', function() {
                $(this).css({ 'visibility':'hidden', 'display':'inline' });
            });
        }else if($nextbutton.css('visibility') === 'hidden'){
            $nextbutton.hide().css({ 'visibility':'visible' }).stop(true,true).fadeIn('slow');
        }

        //set location hash
        var hash = document.location.hash;
        if(!hash){
            var feed = globals.channels[this_chan].feed;
            var parts = feed.split("/");
            hash = '/'+parts[1]+'/'+parts[2]+'/'+globals.videos[this_chan].video[selected_video].id;
        }else{
            var anchor = hash.substring(1);
            var parts = anchor.split("/"); // #/r/videos/id
            hash = '/'+parts[1]+'/'+parts[2]+'/'+globals.videos[this_chan].video[selected_video].id;
        }
        globals.current_anchor = '#'+hash;
        window.location.hash = hash;

        var $video_embed = $('#video-embed');

        $video_embed.empty();
        $video_embed.addClass('loading');
        var embed = $.unescapifyHTML(globals.videos[this_chan].video[selected_video].media_embed.content);
        embed = prepEmbed(embed, globals.videos[this_chan].video[selected_video].media.type);

        var redditlink = 'http://reddit.com'+$.unescapifyHTML(globals.videos[this_chan].video[selected_video].permalink);
        $('#video-title').html('<a href="' + redditlink + '" target="_blank"'
                               + ' title="' + globals.videos[this_chan].video[selected_video].title_quot + '">'
                               + globals.videos[this_chan].video[selected_video].title_unesc + '</a>');
        $video_embed.html(embed);
        $video_embed.removeClass('loading');

        var score = globals.videos[this_chan].video[selected_video].score;
        var num_comments = globals.videos[this_chan].video[selected_video].num_comments;
	
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
            + '<a href="' + globals.videos[this_chan].video[selected_video].url + '" target="_blank">'
            + globals.videos[this_chan].video[selected_video].media.oembed.provider_name
            + '</a>';
        var $video_source = $('#video-source');
        $video_source.stop(true,true).fadeOut('slow', function() {
            $video_source.html(video_source_text).fadeIn('slow');
        });

        fillScreen();
    }
}

function loadVideoById(video_id) {
    var this_chan = globals.cur_chan, video = findVideoById(video_id, this_chan);  //returns number typed
    if(video !== false){
        loadVideoList(this_chan);
        loadVideo(Number(video));
    }else{
        //ajax request
        var last_req = globals.cur_vid_req;
        if(last_req !== null){
            last_req.abort();
        }
	
        globals.cur_vid_req = $.ajax({
            url: "http://www.reddit.com/by_id/t3_"+video_id+".json",
            dataType: "jsonp",
            jsonp: "jsonp",
            success: function(data) {
                if(!isEmpty(data.data.children[0].data.media_embed)
                   && isVideo(data.data.children[0].data.media.type)
                  )
                {
                    globals.videos[this_chan].video.splice(0,0,data.data.children[0].data);
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
    return (globals.domains.indexOf(video_domain) !== -1);
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

    consoleLog('Removed '+ (original_length - out.length) + ' dupes.');
    return out.reverse();
}

function findVideoById(id,chan) {
    for(var x in globals.videos[chan].video){
        if(globals.videos[chan].video[x].id === id){
            return Number(x); //if found return array pos
        }
    }
    return false; //not found
}

function sfwCheck(video, chan) {
    return (globals.sfw && globals.videos[chan].video[video].over_18);
}

function showHideNsfwThumbs(this_sfw, this_chan) {
    $('.nsfw_thumb').each(function() {
        $(this).attr('src', getThumbnailUrl(this_chan, Number($(this).attr('rel'))));
    });
}

function getThumbnailUrl(chan, video_id) {
    if (sfwCheck(video_id, chan)) {
        return 'img/nsfw.png';
    }
    else if (globals.videos[chan].video[video_id].media.oembed.thumbnail_url) {
        return globals.videos[chan].video[video_id].media.oembed.thumbnail_url;
    }
    else {
        return 'img/noimage.png';
    }
}

function chgChan(up_down) {
    var old_chan = globals.cur_chan, this_chan = old_chan;
    if(up_down === 'up' && this_chan > 0){
        this_chan--;
    }else if(up_down !== 'up' && this_chan < globals.channels.length-1){
        this_chan++;
    }
    if(this_chan !== old_chan){
        var parts = globals.channels[this_chan].feed.split("/");
        window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
    }
}

function getFeedName(channel) {
    for(var x in globals.channels){
        if(globals.channels[x].channel === channel){
            return globals.channels[x].feed;
        }
    }
}

function getChanName(feed) {
    for(var x in globals.channels){
        if(globals.channels[x].feed.indexOf(feed) !== -1){
            return globals.channels[x].channel;
        }
    }
}

function getChan(channel) {
    for(var x in globals.channels){
        if(globals.channels[x].channel === channel || globals.channels[x].feed === channel){
            return x;
        }
    }
}

function prepEmbed(embed, type){
    switch(type){
    default:
        return embed;
    case 'youtube.com':
        return youtube.prepEmbed(embed);
    }
}

function fillScreen() {
    var fill_screen_domains = ['youtube.com'];
    if(fill_screen_domains.indexOf(globals.videos[globals.cur_chan].video[globals.cur_video].media.type) !== -1){
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

function togglePlay(){
    switch(globals.videos[globals.cur_chan].video[globals.cur_video].media.type){
    case 'youtube.com':
        youtube.togglePlay();
        break;
    }
}

/* Anchor Checker */
//check fo anchor changes, if there are do stuff
function checkAnchor(){
    if(globals.current_anchor !== document.location.hash){
        globals.current_anchor = document.location.hash;
        if(!globals.current_anchor){
        }else{
            var anchor = globals.current_anchor.substring(1);
            var parts = anchor.split("/"); // #/r/videos/id
            var feed = "/"+parts[1]+"/"+parts[2]+"/";
            var new_chan_name = getChanName(feed);
            var new_chan_num = getChan(new_chan_name);
            if(new_chan_name !== undefined && new_chan_num !== globals.cur_chan){
                if(parts[3] === undefined || parts[3] === null || parts[3] === ''){
                    loadChannel(new_chan_name, null);
                }else{
                    loadChannel(new_chan_name, parts[3]);
                }
            }else{
                if(globals.videos[new_chan_num] !== undefined){
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

/* Utility Functions */
//safe console log
function consoleLog(string){
    if(window.console) {
        console.log(string);
    }
}

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