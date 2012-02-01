/* Globals */
var search_str = "search/.json?q=%28site%3Ayoutube.com+OR+site%3Avimeo.com+OR+site%3Ayoutu.be%29&restrict_sr=on&sort=relevance&limit=100";

var globals = {
    /* Channels Object */
    channels: [
        {"channel": "All", "feed": "/r/all/"+search_str}
        ,{"channel": "Videos", "feed": "/r/videos/.json"}
        
        ,{"channel": "Funny", "feed": "/r/funny/"+search_str}

        ,{"channel": "Tech", "feed": "/r/technology/"+search_str}
        ,{"channel": "Gaming", "feed": "/r/gaming/.json"}
        ,{"channel": "AWW", "feed": "/r/aww/"+search_str}
        ,{"channel": "WTF", "feed": "/r/wtf/.json"}
        
        ,{"channel": "Music", "feed": "/r/music/.json"}
        ,{"channel": "Listen", "feed": "/r/listentothis/.json"}

        ,{"channel": "TIL", "feed": "/r/todayilearned/"+search_str}
        ,{"channel": "PBS", "feed": "/domain/video.pbs.org/.json"}
        ,{"channel": "TED", "feed": "/domain/ted.com/.json"}

        ,{"channel": "Politics", "feed": "/r/politics/"+search_str}
        ,{"channel": "Atheism", "feed": "/r/atheism/"+search_str}
        
        ,{"channel": "Sports", "feed": "/r/sports/.json"}
    ]
    
    /* Video Domains */
    ,domains: [
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
    ]

    ,videos: []
    ,user_channels: []
    ,cur_video: 0
    ,cur_chan: 0
    ,cur_chan_req: null
    ,cur_vid_req: null
    ,current_anchor: null
    ,auto: true
    ,sfw: true
    ,shuffle: false
    ,shuffled: []
    ,theme: 'light'
}

/* Document Ready */
$().ready(function(){
    /* SOPA Blackout */
    var sd = '2012018';
    var td = new Date();
    td = td.getFullYear().toString() + td.getMonth().toString() + td.getDate().toString();
    if(sd === td){
        var html = '<style type="text/css">#fuck-sopa-wrapper{background-color:#000;position:absolute;top:0;left:0;width:100%;height:100%;margin:0;padding:0;}#fuck-sopa-content{font-family:helvetica,verdana;background:gray;width:300px;margin:100px auto 0 auto;padding:15px;text-align:center;border:2px solid darkred;-webkit-border-radius:15px;-moz-border-radius:15px;border-radius:15px;}#fuck-sopa-content h1{margin-top:0;font-size:x-large;color:darkred;}#fuck-sopa-content a{color:#000;}</style><div id="fuck-sopa-wrapper">  <div id="fuck-sopa-content">    <h1>WEBSITE BLOCKED</h1>    <p>If internet blacklist legislation becomes law, this may be all that remains of this website in the future.</p>    <p>Learn more about the adverse effects SOPA and PIPA will have for you and the internet at <a href="http://americancensorship.org/">americancensorship.org</a>  </div></div>';
        document.write(html);
        return false;
    }
    /* END SOPA Blackout */
    
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
    $('#shuffle').click(function() {
        globals.shuffle = ($('#shuffle').is(':checked')) ? true : false;
        globals.shuffled = []; //reset
        $.cookie('shuffle', globals.shuffle, {expires: 7});
    });
    $('#sfw').click(function() {
        globals.sfw = ($('#sfw').is(':checked')) ? true : false;
        if(!globals.sfw){
            if(!confirm("Are you over 18?")){
                $("#sfw").prop("checked", true);
                globals.sfw = true;
            }
        }
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
        if(!$(e.target).is('form>*')) {            
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
                window.open($('#video-title>a').attr('href'), '_blank');
                break;
            }
            return false;
        }
    });

    /* clear add sr on click */
    $('#channel-name').click(function(){
        $(this).val('');
    });

    /* Anchor Checker */
    if("onhashchange" in window){
        checkAnchor(); //perform initial check if hotlinked
        window.onhashchange = function(){
            checkAnchor();
        };
    }else{
        setInterval(checkAnchor, 100);
    }
});

/* Main Functions */
function loadSettings() {
    var channels_cookie = $.parseJSON($.cookie('user_channels')), auto_cookie = $.cookie('auto'), sfw_cookie = $.cookie('sfw'), theme_cookie = $.cookie('theme'), shuffle_cookie = $.cookie('shuffle');

    if(auto_cookie !== null && auto_cookie !== globals.auto){
        globals.auto = (auto_cookie === 'true') ? true : false;
        $('#auto').attr('checked', globals.auto);
    }
    if(shuffle_cookie !== null && shuffle_cookie !== globals.shuffle){
        globals.shuffle = (shuffle_cookie === 'true') ? true : false;
        $('#shuffle').attr('checked', globals.shuffle);
    }
    if(sfw_cookie !== null && sfw_cookie !== globals.sfw){
        globals.sfw = (sfw_cookie === 'true') ? true : false;
        $('#sfw').attr('checked', globals.sfw);
    }
    if(theme_cookie !== null && theme_cookie !== globals.theme){
        globals.theme = theme_cookie;
    }
    if(channels_cookie !== null && channels_cookie !== globals.user_channels){
        globals.user_channels = channels_cookie;
        for(var x in globals.user_channels){
            globals.channels.push(globals.user_channels[x]);
        }
    }
}

function loadTheme(id) {
    $('#theme').attr('href', 'css/theme_' + id + '.css');
    $.cookie('theme', id, {expires: 7});
}

function displayChannels() {
    var $channel_list = $('#channel-list'), $list = $('<ul></ul>');
    $channel_list.html($list);
    for(var x in globals.channels){
        displayChannel(x);
    }
}

function displayChannel(chan){
    var title, display_title, class_str='', remove_str='';

    title = globals.channels[chan].feed.split("/");
    title = "/"+title[1]+"/"+title[2];

    display_title = globals.channels[chan].channel.length > 8 ?
        globals.channels[chan].channel.replace(/[aeiou]/gi,'').substr(0,7) :
        globals.channels[chan].channel;

    if(isUserChan(globals.channels[chan].channel)){
        class_str = 'class="user-chan"';
        remove_str = '<a id="remove-'+chan+'" class="remove-chan">-</a>';
    }

    $('#channel-list>ul').append('<li id="channel-'+chan+'" title="'+title+'" '+class_str+'>'+display_title+remove_str+'</li>');
    $('#channel-'+chan).bind(
            'click'
        ,{channel: globals.channels[chan].channel, feed: globals.channels[chan].feed}
        ,function(event) {
            var parts = event.data.feed.split("/");
            window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
        }
    );
    $('#remove-'+chan).bind(
            'click'
        ,{channel: chan}
        ,function(event) {
            removeChan(event.data.channel);
        }
    );
}

function loadChannel(channel, video_id) {
    var last_req = globals.cur_chan_req, this_chan = getChan(channel), $video_embed = $('#video-embed'), $video_title = $('#video-title'), title;

    if(last_req !== null){
        last_req.abort();
    }
    
    globals.shuffled = [];
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
                    if(isVideo(data.data.children[x].data.domain) && (data.data.children[x].data.score > 1)){
                        if(isEmpty(data.data.children[x].data.media_embed) || data.data.children[x].data.domain == 'youtube.com' || data.data.children[x].data.domain == 'youtu.be'){
                            var created = createEmbed(data.data.children[x].data.url, data.data.children[x].data.domain);
                            if(created !== false){
                                data.data.children[x].data.media_embed.content = created.embed;
                                data.data.children[x].data.media = {};
                                data.data.children[x].data.media.oembed = {};
                                data.data.children[x].data.media.oembed.thumbnail_url = created.thumbnail;
                            }
                        }
                        if(data.data.children[x].data.media_embed.content){
                            globals.videos[this_chan].video.push(data.data.children[x].data);
                        }
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

    if(globals.shuffle){
        if(globals.shuffled.length == 0){
            shuffleChan(this_chan);
        }
        //get normal key if shuffled already
        selected_video = globals.shuffled.indexOf(selected_video);
    }
     
    if(video === 'next' && selected_video <= videos_size){
        selected_video++;
        if(selected_video > videos_size){
            selected_video = 0;
        }
        while(sfwCheck(getVideoKey(selected_video), this_chan) && selected_video < videos_size){
            selected_video++;
        }
        if(sfwCheck(getVideoKey(selected_video), this_chan)){
            selected_video = this_video;
        }
    }else if(selected_video >= 0 && video === 'prev'){
        selected_video--;
        if(selected_video < 0){
            selected_video = videos_size;
        }
        while(sfwCheck(getVideoKey(selected_video), this_chan) && selected_video > 0){
            selected_video--;
        }
        if(sfwCheck(getVideoKey(selected_video), this_chan)){
            selected_video = this_video;
        }
    }else if(video === 'first'){
        selected_video = 0;
        if(sfwCheck(getVideoKey(selected_video), this_chan)){
            while(sfwCheck(getVideoKey(selected_video), this_chan) && selected_video < videos_size){
                selected_video++;
            }
        }
    }
    selected_video = getVideoKey(selected_video);

    if(typeof(video) === 'number'){ //must be a number NOT A STRING - allows direct load of video # in video array
        selected_video = video;
    }

    //exit if trying to load over_18 content without confirmed over 18
    if(sfwCheck(selected_video, this_chan)){
        return false;
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

        gaHashTrack();

        var $video_embed = $('#video-embed');

        $video_embed.empty();
        $video_embed.addClass('loading');
        
        var embed = $.unescapifyHTML(globals.videos[this_chan].video[selected_video].media_embed.content);
        embed = prepEmbed(embed, globals.videos[this_chan].video[selected_video].domain);
        embed = prepEmbed(embed, 'size');

        var redditlink = 'http://reddit.com'+$.unescapifyHTML(globals.videos[this_chan].video[selected_video].permalink);
        $('#video-title').html('<a href="' + redditlink + '" target="_blank"'
                               + ' title="' + globals.videos[this_chan].video[selected_video].title_quot + '">'
                               + globals.videos[this_chan].video[selected_video].title_unesc + '</a>');
        $video_embed.html(embed);
        $video_embed.removeClass('loading');

        addListeners(globals.videos[this_chan].video[selected_video].domain);

        var reddit_string = redditButton('t3_' + globals.videos[this_chan].video[selected_video].id);
        var $vote_button = $('#vote-button');
        $vote_button.stop(true,true).fadeOut('slow', function() {
            $vote_button.html(reddit_string).fadeIn('slow');
        });

        var video_source_text = 'Source: '
            + '<a href="' + globals.videos[this_chan].video[selected_video].url + '" target="_blank">'
            + globals.videos[this_chan].video[selected_video].domain
            + '</a>';
        var $video_source = $('#video-source');
        $video_source.stop(true,true).fadeOut('slow', function() {
            $video_source.html(video_source_text).fadeIn('slow');
        });

        fillScreen();
    }
}

function getVideoKey(key){
    if(globals.shuffle && globals.shuffled.length == globals.videos[globals.cur_chan].video.length){
        return globals.shuffled[key];
    }else{
        return key;
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

function showHideNsfwThumbs(sfw, this_chan) {
    $('.nsfw_thumb').each(function() {
            $(this).attr('src', getThumbnailUrl(this_chan, Number($(this).attr('rel'))));
    });
}

function getThumbnailUrl(chan, video_id) {
    if (sfwCheck(video_id, chan)) {
        return 'img/nsfw.png';
    }
    else if (globals.videos[chan].video[video_id].media.oembed) {
        return globals.videos[chan].video[video_id].media.oembed.thumbnail_url !== undefined ? 
            globals.videos[chan].video[video_id].media.oembed.thumbnail_url :
            'img/noimage.png';
    }
    else {
        return 'img/noimage.png';
    }
}

function chgChan(up_down) {
    var old_chan = globals.cur_chan, this_chan = old_chan;

    if(up_down === 'up' && this_chan > 0){
        this_chan--;
        while(globals.channels[this_chan].channel == '' && this_chan > 0){
            this_chan--;
        }
    }else if(up_down === 'up'){
        this_chan = globals.channels.length-1;
        while(globals.channels[this_chan].channel == '' && this_chan > 0){
            this_chan--;
        }
    }else if(up_down !== 'up' && this_chan < globals.channels.length-1){
        this_chan++;
        while(globals.channels[this_chan].channel == ''){
            this_chan++;
        }
    }else if(up_down !== 'up'){
        this_chan = 0;
        while(globals.channels[this_chan].channel == ''){
            this_chan++;
        }
    }

    if(this_chan !== old_chan && globals.channels[this_chan].channel !== ''){
        var parts = globals.channels[this_chan].feed.split("/");
        window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
    }else if(this_chan !== old_chan){
        globals.cur_chan = this_chan;
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
    return false;
}

function getChan(channel) {
    for(var x in globals.channels){
        if(globals.channels[x].channel === channel || globals.channels[x].feed === channel){
            return x;
        }
    }
    return false;
}

function getUserChan(channel) {
    for(var x in globals.channels){
        if(globals.user_channels[x].channel === channel || globals.user_channels[x].feed === channel){
            return x;
        }
    }
    return false;
}

function isUserChan(channel){
    for(var x in globals.user_channels){
        if(globals.user_channels[x].channel === channel){
            return true;
        }
    }
    return false;
}

function createEmbed(url, type){
    switch(type){
    default:
        return false;
    case 'youtube.com': case 'youtu.be':
        return youtube.createEmbed(url);
    case 'vimeo.com':
        return vimeo.createEmbed(url);
    }
}

function prepEmbed(embed, type){
    switch(type){
    default:
        return embed;
    case 'youtube.com': case 'youtu.be':
        return youtube.prepEmbed(embed);
    case 'vimeo.com':
        return vimeo.prepEmbed(embed);
    case 'size':
        embed = embed.replace(/height\="(\d\w+)"/gi, 'height="480"');
        embed = embed.replace(/width\="(\d\w+)"/gi, 'width="640"');
        return embed;
    }
    
}

function addListeners(type){
    switch(type){
    case 'vimeo.com':
        vimeo.addListeners();
    }
}

function fillScreen() {
    var fill_screen_domains = ['youtube.com', 'youtu.be'];
    if(fill_screen_domains.indexOf(globals.videos[globals.cur_chan].video[globals.cur_video].domain) !== -1){
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
    switch(globals.videos[globals.cur_chan].video[globals.cur_video].domain){
    case 'youtube.com': case 'youtu.be':
        youtube.togglePlay();
        break;
    case 'vimeo.com':
        vimeo.togglePlay();
        break;
    }
}

function addChannel(subreddit){
    if(!subreddit){
        subreddit = encodeURIComponent($('#channel-name').val());
        var click = true;
    }
    if(!getChan(subreddit)){
        var feed = "/r/"+subreddit+"/.json";

        var c_data = {"channel": subreddit, "feed": feed};
        globals.channels.push(c_data);
        globals.user_channels.push(c_data);
        
        $.cookie('user_channels', JSON.stringify(globals.user_channels));

        var x = globals.channels.length - 1;
        displayChannel(x);

        if(click){
            $('#channel-'+x).click();
        }
    }

    return false;
}

function removeChan(chan){ //by index (integer)
    var idx = getUserChan(globals.channels[chan].channel);
    if(idx){
        if(chan == globals.cur_chan){
            chgChan('up');
        }
        $('#channel-'+chan).remove();
        globals.user_channels.splice(idx, 1);

        $.cookie('user_channels', JSON.stringify(globals.user_channels));
        //free some memory bitches
        globals.channels[chan] = {'channel': '', 'feed': ''};
        globals.videos[chan] = undefined;
    }
}

function shuffleChan(chan){ //by index (integer
    /* 
       does not shuffle actual video array
       but rather creates a global array of shuffled keys
    */
    globals.shuffled = []; // reset
    for(x in globals.videos[chan].video){
        globals.shuffled.push(x);
    }
    globals.shuffled = shuffleArray(globals.shuffled);
    consoleLog('shuffling channel '+chan);
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
            if(!new_chan_name){
                addChannel(parts[2]);
                new_chan_name = getChanName(feed);
            }
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
function redditButton(id){
    var reddit_string="<iframe src=\"http://www.reddit.com/static/button/button1.html?width=120";
    reddit_string += '&id=' + id;
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

//http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling/962890#962890
function shuffleArray(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
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

/* analytics */
function gaHashTrack(){
    if(_gaq){
        _gaq.push(['_trackPageview',location.pathname + location.hash]);
    }
}