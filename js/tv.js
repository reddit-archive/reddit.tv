/* Globals */
var Globals = {
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
        {channel: 'All', type: 'search', feed: '/r/all/'},
        {channel: 'Videos', type: 'normal', feed: '/r/videos/'},
        {channel: 'Funny', type: 'search', feed: '/r/funny/'},
        {channel: 'Tech', type: 'search', feed: '/r/technology/'},
        {channel: 'Gaming', type: 'normal', feed: '/r/gaming/'},
        {channel: 'AWW', type: 'search', feed: '/r/aww/'},
        {channel: 'WTF', type: 'search', feed: '/r/wtf/'},
        {channel: 'Music', type: 'normal', feed: '/r/music/'},
        {channel: 'Listen', type: 'normal', feed: '/r/listentothis/'},
        {channel: 'TIL', type: 'search', feed: '/r/todayilearned/'},
        {channel: 'PBS', type: 'domain', feed: '/domain/video.pbs.org/'},
        {channel: 'TED', type: 'domain', feed: '/domain/ted.com/'},
        {channel: 'Politics', type: 'search', feed: '/r/politics/'},
        {channel: 'Atheism', type: 'search', feed: '/r/atheism/'},
        {channel: 'Sports', type: 'normal', feed: '/r/sports/'}
        ],

    promo: {

        'channel': 'Vice',
        'type': 'youtube',
        'videos': [
            {
                'id': 'X51rPtxmd3Y',
                'title': 'VICE Season 1 Trailer'
            },

            {
                'title': 'VICE Season 1 Preview',
                'id': '56lGttuY0cY'
            },

            {
                'title': 'What is VICE? Featurette',
                'id': 'UT18_goPvHc'
            },

            {
                'title': 'What is VICE? Extended Version',
                'id': '5jhYMlfuVNI'
            }
        ]
    },

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
    cur_video: 0,
    cur_chan: 0,
    cur_chan_req: null,
    cur_vid_req: null,
    current_anchor: null,
    auto: true,
    sfw: true,
    shuffle: false,
    shuffled: [],
    theme: 'light',

    content_minwidth: 130,  // minimum width of #content w/o width of player
    content_minheight: 320, // minimum height of #content w/o height of player
    vd_minwidth: 30,        // minimum width of #video-display w/o width of player
    vd_minheight: 213      // minimum height of #video-display w/o height of player
};

/* MAIN (Document Ready) */
$().ready(function(){
    loadSettings();
    loadTheme(Globals.theme);
    displayChannels();

    if ('promo' in Globals) {

        var $channelList = $('#channel-list');
        $channelList.addClass('promo');

        var $promoList = $('#promo-channel').append($('<ul/>'));
        $promoList.find('ul').append($('<li/>').text(Globals.promo.channel));
        $promoList.find('li').addClass('chan-selected');


        function loadThePromo () {

            loadPromoVideoList();

            var type = 'youtube';
            var id = Globals.promo.videos[0].id;
            var desc = Globals.promo.videos[0].title;
            loadPromo(type, id, desc);
            Globals.cur_chan = -1;
            Globals.cur_video = 0;
        }

        $promoList.find('li').on('click', function () {

            $promoList.find('li').addClass('chan-selected');
            $channelList.find('li').removeClass('chan-selected');
            loadThePromo();
        });

        loadThePromo();
    }
    else {

        loadChannel("Videos", null);
    }


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
        Globals.auto = ($('#auto').is(':checked')) ? true : false;
        $.jStorage.set('auto', Globals.auto);
    });
    $('#shuffle').click(function() {
        Globals.shuffle = ($('#shuffle').is(':checked')) ? true : false;
        Globals.shuffled = []; //reset
        $.jStorage.set('shuffle', Globals.shuffle);
    });
    $('#sfw').click(function() {
        Globals.sfw = ($('#sfw').is(':checked')) ? true : false;
        if(!Globals.sfw){
            if(!confirm("Are you over 18?")){
                $("#sfw").prop("checked", true);
                Globals.sfw = true;
            }
        }
        $.jStorage.set('sfw', Globals.sfw);
        showHideNsfwThumbs(Globals.sfw, Globals.cur_chan);
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
    $('#sorting').on('change', function () {

        Globals.sorting = $('#sorting').val();
        Globals.videos = [];
        loadChannel(Globals.channels[Globals.cur_chan].channel, null);
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

    $(window).resize(function() {
        resizePlayer();
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
    var channels_cookie = $.jStorage.get('user_channels'),
        auto_cookie = $.jStorage.get('auto'),
        sfw_cookie = $.jStorage.get('sfw'),
        theme_cookie = $.jStorage.get('theme'),
        shuffle_cookie = $.jStorage.get('shuffle');

    if(auto_cookie !== null && auto_cookie !== Globals.auto){
        Globals.auto = (auto_cookie === 'true') ? true : false;
        $('#auto').attr('checked', Globals.auto);
    }
    if(shuffle_cookie !== null && shuffle_cookie !== Globals.shuffle){
        Globals.shuffle = (shuffle_cookie === 'true') ? true : false;
        $('#shuffle').attr('checked', Globals.shuffle);
    }
    if(sfw_cookie !== null && sfw_cookie !== Globals.sfw){
        Globals.sfw = (sfw_cookie === 'true') ? true : false;
        $('#sfw').attr('checked', Globals.sfw);
    }
    if(theme_cookie !== null && theme_cookie !== Globals.theme){
        Globals.theme = theme_cookie;
    }
    if(channels_cookie !== null && channels_cookie !== Globals.user_channels){
        Globals.user_channels = channels_cookie;
        for(var x in Globals.user_channels){
            Globals.channels.push(Globals.user_channels[x]);
        }
    }
}

function loadTheme(id) {
    $('#theme').attr('href', 'css/theme_' + id + '.css');
    $.jStorage.set('theme', id);
}

function displayChannels() {
    var $channel_list = $('#channel-list'), $list = $('<ul></ul>');
    $channel_list.html($list);
    for(var x in Globals.channels){
        displayChannel(x);
    }
}

function displayChannel(chan){
    var title, display_title, class_str='', remove_str='';

    title = Globals.channels[chan].feed.split("/");
    title = "/"+title[1]+"/"+title[2];

    display_title = Globals.channels[chan].channel.length > 8 ?
        Globals.channels[chan].channel.replace(/[aeiou]/gi,'').substr(0,7) :
        Globals.channels[chan].channel;

    if(isUserChan(Globals.channels[chan].channel)){
        class_str = 'class="user-chan"';
        remove_str = '<a id="remove-'+chan+'" class="remove-chan">-</a>';
    }

    $('#channel-list>ul').append('<li id="channel-'+chan+'" title="'+title+'" '+class_str+'>'+display_title+remove_str+'</li>');
    $('#channel-'+chan).bind(
        'click',
        {channel: Globals.channels[chan].channel, feed: Globals.channels[chan].feed},
        function(event) {
            var parts = event.data.feed.split("/");
            window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
        }
    );
    $('#remove-'+chan).bind(
        'click',
        {channel: chan},
        function(event) {
            removeChan(event.data.channel);
        }
    );
}

function loadChannel(channel, video_id) {
    var last_req = Globals.cur_chan_req, this_chan = getChan(channel), $video_embed = $('#video-embed'), $video_title = $('#video-title'), title;

    // update promo state
    $('#promo-channel li').removeClass('chan-selected');

    if(last_req !== null){
        last_req.abort();
    }
    
    Globals.shuffled = [];
    Globals.cur_chan = this_chan;
    
    $('#video-list').stop(true, true).animate({ height:0, padding:0 }, 500, function() {
        $(this).empty().hide();
    });
    $('#prev-button,#next-button').css({ 'visibility':'hidden', 'display':'none' });
    $('#vote-button').empty();
    $('#video-source').empty();

    title = Globals.channels[this_chan].feed.split("/");
    title = "/"+title[1]+"/"+title[2];

    $video_title.html('Loading '+title+' ...');
    $video_embed.addClass('loading');
    $video_embed.empty();
    
    $('#channel-list>ul>li').removeClass('chan-selected');
    $('#channel-'+this_chan).addClass('chan-selected');

    

    if(Globals.videos[this_chan] === undefined){
        var feed = getFeedURI(channel);
        Globals.cur_chan_req = $.ajax({
            url: "http://www.reddit.com"+feed,
            dataType: "jsonp",
            jsonp: "jsonp",
            success: function(data) {
                Globals.videos[this_chan] = {};
                Globals.videos[this_chan].video = []; //clear out stored videos
                for(var x in data.data.children){
                    if(isVideo(data.data.children[x].data.domain) && (data.data.children[x].data.score > 1)){
                        if(isEmpty(data.data.children[x].data.media_embed) || data.data.children[x].data.domain === 'youtube.com' || data.data.children[x].data.domain === 'youtu.be'){
                            var created = createEmbed(data.data.children[x].data.url, data.data.children[x].data.domain);
                            if(created !== false){
                                data.data.children[x].data.media_embed.content = created.embed;
                                data.data.children[x].data.media = {};
                                data.data.children[x].data.media.oembed = {};
                                data.data.children[x].data.media.oembed.thumbnail_url = created.thumbnail;
                            }
                        }
                        if(data.data.children[x].data.media_embed.content){
                            Globals.videos[this_chan].video.push(data.data.children[x].data);
                        }
                    }
                }

                //remove duplicates
                Globals.videos[this_chan].video = filterVideoDupes(Globals.videos[this_chan].video);

                if(Globals.videos[this_chan].video.length > 0){
                    if(video_id !== null){
                        loadVideoById(video_id);
                    }else{
                        loadVideoList(this_chan);
                        Globals.cur_video = 0;
                        loadVideo('first');
                    }
                    $video_embed.removeClass('loading');
                }else{
                    $video_embed.removeClass('loading');
                    alert('No videos found in '+Globals.channels[this_chan].channel);
                }
            },
            error: function(jXHR, textStatus, errorThrown) {
                if(textStatus !== 'abort'){
                    alert('Could not load feed. Is reddit down?');
                }
            }
        });
    }else{
        if(Globals.videos[this_chan].video.length > 0){
            if(video_id !== null){
                loadVideoById(video_id);
            }else{
                loadVideoList(this_chan);
                Globals.cur_video = 0;
                loadVideo('first');
            }
        }else{
            alert('No videos loaded for '+Globals.channels[this_chan].feed.slice(0,-5));
        }
    }
}

function loadVideoList(chan) {
    var this_chan = chan, $list = $('<span></span>');
    for(var i in Globals.videos[this_chan].video) {
        var this_video = Globals.videos[this_chan].video[i];

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
            .attr('src', 'img/noimage.png')
            .attr('data-original', getThumbnailUrl(this_chan, i))
            .click( function () {
                loadVideo( Number( $(this).attr('rel') ));
            });

        $list.append($thumbnail);
    }

    $('#video-list')
        .stop(true, true)
        .html($list)
        .show()
        .animate({ height: '88px', padding: '5px' }, 1000, function() {
            $('img').lazyload({
                effect : "fadeIn",
                container: $("#video-list")
            });
        });
}

function loadPromoVideoList () {

    $list = $('<span></span>');

    for (var i in Globals.promo.videos) {

        var this_video = Globals.promo.videos[i];

        var $thumbnail = $('<img id="video-list-thumb-' + i + '"' + ' rel="' + i + '"' +
                           ' title="' + this_video.title + '"/>');

        var thumbNail;
        if (Globals.promo.type === 'youtube') {

            thumbNail = 'http://i2.ytimg.com/vi/' + this_video.id + '/hqdefault.jpg';
        }

        $thumbnail
            .attr('src', 'img/noimage.png')
            .attr('data-original', thumbNail)
            .attr('data-id', this_video.id)
            .attr('data-title', this_video.title)
            .attr('data-index', i)
            .click( function () {

                var $this = $(this);
                Globals.cur_video = parseInt($this.attr('data-index'), 10);
                loadPromo(Globals.promo.type, $this.attr('data-id'), $this.attr('data-title'));
            });

        $list.append($thumbnail);
    }

    $('#video-list')
        .stop(true, true)
        .html($list)
        .show()
        .animate({ height: '88px', padding: '5px' }, 1000, function () {

            $('img').lazyload({

                effect : "fadeIn",
                container: $("#video-list")
            });
        });
}

function loadVideo(video) {
    var this_chan = Globals.cur_chan,
        this_video = Globals.cur_video,
        selected_video = this_video,
        videos_size = Object.size(Globals.videos[this_chan].video)-1;

    if(Globals.shuffle){
        if(Globals.shuffled.length === 0){
            shuffleChan(this_chan);
        }
        //get normal key if shuffled already
        selected_video = Globals.shuffled.indexOf(selected_video);
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
        Globals.cur_video = selected_video;

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

        if(Globals.cur_video >= videos_size){
            $nextbutton.stop(true,true).fadeOut('slow', function() {
                $(this).css({ 'visibility':'hidden', 'display':'inline' });
            });
        }else if($nextbutton.css('visibility') === 'hidden'){
            $nextbutton.hide().css({ 'visibility':'visible' }).stop(true,true).fadeIn('slow');
        }

        //set location hash
        var parts, hash = document.location.hash;
        if(!hash){
            var feed = Globals.channels[this_chan].feed;
            parts = feed.split("/");
            hash = '/'+parts[1]+'/'+parts[2]+'/'+Globals.videos[this_chan].video[selected_video].id;
        }else{
            var anchor = hash.substring(1);
            parts = anchor.split("/"); // #/r/videos/id
            hash = '/'+parts[1]+'/'+parts[2]+'/'+Globals.videos[this_chan].video[selected_video].id;
        }
        Globals.current_anchor = '#'+hash;
        window.location.hash = hash;

        gaHashTrack();

        var $video_embed = $('#video-embed');

        $video_embed.empty();
        $video_embed.addClass('loading');
        
        var embed = $.unescapifyHTML(Globals.videos[this_chan].video[selected_video].media_embed.content);
        embed = prepEmbed(embed, Globals.videos[this_chan].video[selected_video].domain);
        embed = prepEmbed(embed, 'size');

        var redditlink = 'http://reddit.com'+$.unescapifyHTML(Globals.videos[this_chan].video[selected_video].permalink);
        $('#video-title').html('<a href="' + redditlink + '" target="_blank"'
                               + ' title="' + Globals.videos[this_chan].video[selected_video].title_quot + '">'
                               + Globals.videos[this_chan].video[selected_video].title_unesc + '</a>');
        $video_embed.html(embed);
        $video_embed.removeClass('loading');

        addListeners(Globals.videos[this_chan].video[selected_video].domain);

        var reddit_string = redditButton('t3_' + Globals.videos[this_chan].video[selected_video].id);
        var $vote_button = $('#vote-button');
        $vote_button.stop(true,true).fadeOut('slow', function() {
                $vote_button.html(reddit_string).fadeTo('slow', 1);
        });

        var video_source_text = 'Source: ' +
            '<a href="' + Globals.videos[this_chan].video[selected_video].url + '" target="_blank">' +
            Globals.videos[this_chan].video[selected_video].domain +
            '</a>';
        var $video_source = $('#video-source');
        $video_source.stop(true,true).fadeOut('slow', function() {
            $video_source.html(video_source_text).fadeIn('slow');
        });

        resizePlayer();
        fillScreen();
    }
}

function getVideoKey(key){
    if(Globals.shuffle && Globals.shuffled.length === Globals.videos[Globals.cur_chan].video.length){
        return Globals.shuffled[key];
    }else{
        return key;
    }
}

function loadVideoById(video_id) {
    var this_chan = Globals.cur_chan, video = findVideoById(video_id, this_chan);  //returns number typed
    if(video !== false){
        loadVideoList(this_chan);
        loadVideo(Number(video));
    }else{
        //ajax request
        var last_req = Globals.cur_vid_req;
        if(last_req !== null){
            last_req.abort();
        }
	
        Globals.cur_vid_req = $.ajax({
            url: "http://www.reddit.com/by_id/t3_"+video_id+".json",
            dataType: "jsonp",
            jsonp: "jsonp",
            success: function(data) {
                if (!isEmpty(data.data.children[0].data.media_embed) && isVideo(data.data.children[0].data.media.type)) {

                    Globals.videos[this_chan].video.splice(0,0,data.data.children[0].data);
                }

                loadVideoList(this_chan);
                loadVideo('first');
            },
            error: function (jXHR, textStatus, errorThrown) {
                if (textStatus !== 'abort') {

                    alert('Could not load data. Is reddit down?');
                }
            }
        });
    }
}

function loadNextPromo () {

    var numVids = Globals.promo.videos.length;
    if (Globals.cur_video < numVids -1) {

        Globals.cur_video++;
        var nextVideo = Globals.promo.videos[Globals.cur_video];
        loadPromo(Globals.promo.type, nextVideo.id, nextVideo.title);
    }
}

function loadPromo(type, id, desc){
    consoleLog('loading promo');
    if(Globals.cur_chan_req){
        Globals.cur_chan_req.abort();
    }
    var created, url, embed, domain = type + '.com',
        hash = '/promo/' + type + '/' + id + '/' + desc;

    Globals.current_anchor = '#' + hash;
    window.location.hash = hash;
    gaHashTrack();

    switch(type){
    case 'youtube':
        url = 'http://www.youtube.com/watch?v=' + id;
        break;
    case 'vimeo':
        url = 'http://vimeo.com/' + id;
        break;
    default:
        consoleLog('unsupported promo type');
    }
    
    created = createEmbed(url, domain);
    if (created !== false) {

        embed = prepEmbed($.unescapifyHTML(created.embed), domain);
        embed = prepEmbed(embed, 'size');

        var $video_embed = $('#video-embed');
        $video_embed.empty();
        $video_embed.addClass('loading');

        $('#video-title').text(unescape(desc));
        $video_embed.html(embed);
        $video_embed.removeClass('loading');

        addListeners(domain);

        var video_source_text = 'Source: ' + '<a href="' + url + '" target="_blank">' + domain + '</a>';
        var $video_source = $('#video-source');
        $video_source.stop(true,true).fadeOut('slow', function() {
            $video_source.html(video_source_text).fadeIn('slow');
        });

    }
    else {

        consoleLog('unable to create promo embed');
    }
}

function isVideo (video_domain) {

    return (Globals.domains.indexOf(video_domain) !== -1);
}

//http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
function filterVideoDupes (arr) {

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
}

function findVideoById(id,chan) {
    for(var x in Globals.videos[chan].video){
        if(Globals.videos[chan].video[x].id === id){
            return Number(x); //if found return array pos
        }
    }
    return false; //not found
}

function sfwCheck(video, chan) {
    return (Globals.sfw && Globals.videos[chan].video[video].over_18);
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
    else if (Globals.videos[chan].video[video_id].media.oembed) {
        return Globals.videos[chan].video[video_id].media.oembed.thumbnail_url !== undefined ? 
            Globals.videos[chan].video[video_id].media.oembed.thumbnail_url :
            'img/noimage.png';
    }
    else {
        return 'img/noimage.png';
    }
}

function chgChan(up_down) {
    var old_chan = Globals.cur_chan, this_chan = old_chan;

    if(up_down === 'up' && this_chan > 0){
        this_chan--;
        while(Globals.channels[this_chan].channel === '' && this_chan > 0){
            this_chan--;
        }
    }else if(up_down === 'up'){
        this_chan = Globals.channels.length-1;
        while(Globals.channels[this_chan].channel === '' && this_chan > 0){
            this_chan--;
        }
    }else if(up_down !== 'up' && this_chan < Globals.channels.length-1){
        this_chan++;
        while(Globals.channels[this_chan].channel === ''){
            this_chan++;
        }
    }else if(up_down !== 'up'){
        this_chan = 0;
        while(Globals.channels[this_chan].channel === ''){
            this_chan++;
        }
    }

    if(this_chan !== old_chan && Globals.channels[this_chan].channel !== ''){
        var parts = Globals.channels[this_chan].feed.split("/");
        window.location.hash = "/"+parts[1]+"/"+parts[2]+"/";
    }else if(this_chan !== old_chan){
        Globals.cur_chan = this_chan;
    }
}

function getFeedURI(channel){
    for(var x in Globals.channels){
        if(Globals.channels[x].channel === channel){
            return formatFeedURI(Globals.channels[x]);
        }
    }
}

function formatFeedURI(channel_obj){

    var sorting = Globals.sorting.split(':');
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
    }

    console.log(uri);
    return uri;
}

function getChanName(feed){
    for(var x in Globals.channels){
        if(Globals.channels[x].feed.indexOf(feed) !== -1){
            return Globals.channels[x].channel;
        }
    }
    return false;
}

function getChan(channel) {
    for(var x in Globals.channels){
        if(Globals.channels[x].channel === channel || Globals.channels[x].feed === channel){
            return x;
        }
    }
    return false;
}

function getUserChan(channel) {
    for(var x in Globals.channels){
        if(Globals.user_channels[x].channel === channel || Globals.user_channels[x].feed === channel){
            return x;
        }
    }
    return false;
}

function isUserChan(channel){
    for(var x in Globals.user_channels){
        if(Globals.user_channels[x].channel === channel){
            return true;
        }
    }
    return false;
}

function createEmbed(url, type){
    switch(type){
    case 'youtube.com': case 'youtu.be':
        return youtube.createEmbed(url);
    case 'vimeo.com':
        return vimeo.createEmbed(url);
    default:
        return false;
    }
}

function prepEmbed(embed, type){
    switch(type){
    case 'youtube.com': case 'youtu.be':
        return youtube.prepEmbed(embed);
    case 'vimeo.com':
        return vimeo.prepEmbed(embed);
    case 'size':
        embed = embed.replace(/height\="(\d\w+)"/gi, 'height="480"');
        embed = embed.replace(/width\="(\d\w+)"/gi, 'width="640"');
        return embed;
    default:
        return embed;
    }
    
}

function addListeners (type) {

    switch (type) {
    case 'vimeo.com':
        vimeo.addListeners();
    }
}

function fillScreen() {
    var $object, $fill, $filloverlay, fill_screen_domains = ['youtube.com', 'youtu.be'];
    if(fill_screen_domains.indexOf(Globals.videos[Globals.cur_chan].video[Globals.cur_video].domain) !== -1){
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

function resizePlayer() {
    if(typeof(Globals.cur_chan) == 'undefined' ||
       typeof(Globals.videos[Globals.cur_chan]) == 'undefined') {
        setTimeout(resizePlayer, 100);
        return;
    }

    consoleLog('window size changed: ' + $(window).width() + 'x' + $(window).height());
    sitename = Globals.videos[Globals.cur_chan].video[Globals.cur_video].domain;

    if(sitename == 'youtube.com' || sitename == 'youtu.be') {
        player = $('#ytplayer');
    }
    else if(sitename == 'vimeo.com') {
        player = $('#vimeoplayer');
    }
    else {
        consoleLog('unsupported player: '+sitename);
        return;
    }

    curr_player_width = player.width();
    curr_player_height = player.height();
    win_width = $(window).width();
    win_height = $(window).height();

    // consoleLog('content_min size: ' + (Globals.content_minwidth+curr_player_width) + 'x' + (Globals.content_minheight+curr_player_height));
    // consoleLog('vd_min size: ' + (Globals.vd_minwidth+curr_player_width) + 'x' + (Globals.vd_minheight+curr_player_height));

    if(win_width < 853+Globals.content_minwidth || win_height < 505+Globals.content_minheight) {
        player_width  = 640;
        player_height = 385;
    }
    else if(win_width < 1280+Globals.content_minwidth || win_height < 745+Globals.content_minheight) {
        player_width  = 853;
        player_height = 505;
    }
    else {
        player_width  = 1280;
        player_height = 745;
    }

    if(player_width == curr_player_width) { return; }  // nothing to do
    consoleLog('resizing player to '+player_width+'x'+player_height);
    player.width(player_width);
    player.height(player_height);
    player_width = player.width();    // player may not accept our request
    player_height = player.height();

    consoleLog('new player size: '+player_width+'x'+player_height);

    $('#content').width(player_width + Globals.content_minwidth);
    $('#video-display').width(player_width + Globals.vd_minwidth);
    $('#video-display').height(player_height + Globals.vd_minheight);
}

function togglePlay(){
    switch(Globals.videos[Globals.cur_chan].video[Globals.cur_video].domain){
    case 'youtube.com': case 'youtu.be':
        youtube.togglePlay();
        break;
    case 'vimeo.com':
        vimeo.togglePlay();
        break;
    }
}

function addChannel(subreddit){
    var click;
    if(!subreddit){
        subreddit = stripHTML($('#channel-name').val());
        click = true;
    }
    if(!getChan(subreddit)){
        var feed = "/r/"+subreddit+"/";

        var c_data = {'channel': subreddit, feed: feed};
        Globals.channels.push(c_data);
        Globals.user_channels.push(c_data);
        
        $.jStorage.set('user_channels', Globals.user_channels);

        var x = Globals.channels.length - 1;
        displayChannel(x);

        if(click){
            $('#channel-'+x).click();
        }
    }

    return false;
}

function removeChan(chan){ //by index (integer)
    var idx = getUserChan(Globals.channels[chan].channel);
    if(idx){
        if (parseInt(chan) === parseInt(Globals.cur_chan)) {

            chgChan('up');
        }
        $('#channel-'+chan).remove();
        Globals.user_channels.splice(idx, 1);

        $.jStorage.set('user_channels', Globals.user_channels);

        //free some memory bitches
        Globals.channels[chan] = {channel: '', feed: ''};
        Globals.videos[chan] = undefined;
    }
}

function shuffleChan (chan) { //by index (integer
    /* 
       does not shuffle actual video array
       but rather creates a global array of shuffled keys
    */
    Globals.shuffled = []; // reset
    for(var x in Globals.videos[chan].video){
        Globals.shuffled.push(x);
    }
    Globals.shuffled = shuffleArray(Globals.shuffled);
    consoleLog('shuffling channel '+chan);
}

/* Anchor Checker */
//check fo anchor changes, if there are do stuff
function checkAnchor(){
    if(Globals.current_anchor !== document.location.hash){
        consoleLog('anchor changed');
        Globals.current_anchor = document.location.hash;
        if(!Globals.current_anchor){
            /* do nothing */
        }else{
            var anchor = Globals.current_anchor.substring(1);
            var parts = anchor.split("/"); // #/r/videos/id
            parts = $.map(parts, stripHTML);
            if(parts[1] === 'promo'){
                loadPromo(parts[2], parts[3], parts[4]);
            }else{
                var feed = "/"+parts[1]+"/"+parts[2]+"/";
                var new_chan_name = getChanName(feed);
                if(!new_chan_name){
                    addChannel(parts[2]);
                    new_chan_name = getChanName(feed);
                }
                var new_chan_num = getChan(new_chan_name);
                if(new_chan_name !== undefined && new_chan_num !== Globals.cur_chan){
                    if(parts[3] === undefined || parts[3] === null || parts[3] === ''){
                        loadChannel(new_chan_name, null);
                    }else{
                        loadChannel(new_chan_name, parts[3]);
                    }
                }else{
                    if(Globals.videos[new_chan_num] !== undefined){
                        loadVideoById(parts[3]);
                    }else{
                        loadChannel(new_chan_name, parts[3]);
                    }
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

    if(top){
        while(--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = array[current];
            array[current] = array[top];
            array[top] = tmp;
        }
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
        if(obj.hasOwnProperty(key)){
            size++;
        }
    }
    return size;
};


function stripHTML (s) {
    return s.replace(/[&<>"'\/]/g, '');
}

/* analytics */
function gaHashTrack(){
    if(_gaq){
        _gaq.push(['_trackPageview',location.pathname + location.hash]);
    }
}
