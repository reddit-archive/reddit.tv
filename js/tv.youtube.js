/*
 *  youtube singleton oh yeah! 
 */
var youtube = {
    obj: null, //will hold the current youtube embed

    togglePlay: function(){
        //unstarted (-1), ended (0), playing (1), 
        //paused (2), buffering (3), video cued (5)
        if(youtube.obj.getPlayerState() !== 1){
            youtube.obj.playVideo();
        }else{
            youtube.obj.pauseVideo();
        }
    },

    stateListener: function(state){

        if (Globals.cur_chan === -1) {

            if (state === 0) {

                loadNextPromo();
            }
            else if (state === -1) {

                youtube.togglePlay();
            }

            return;
        }

        if(Globals.auto){ //global scope
            if(state === 0){
                loadVideo('next');  //tv.js
            }else if(state === -1){
                youtube.togglePlay();
            }else if(state === 1){
                var qual = youtube.obj.getPlaybackQuality();
                var avail = youtube.obj.getAvailableQualityLevels();
                if((qual === 'small' || qual === 'medium') && avail.indexOf('large') !== -1){
                    youtube.obj.setPlaybackQuality('large');
                }
            }
        }
    },

    errorListener: function(error){
        consoleLog('youtube error received: '+error);
        loadVideo('next');
    },

    createEmbed: function(url){
        var ID, time, hours, minutes, seconds, total_seconds, parts, data = {};

        time = url.match(/(&|&amp;|\?|#)t=([HhMmSs0-9]+)/);
        if(time !== null){
            time = time[2];
            hours = time.match(/(\d+)h/i);
            minutes = time.match(/(\d+)m/i);
            seconds = time.match(/(\d+)s/i);

            total_seconds = hours !== null ? parseInt(hours[1])*60*60 : 0;
            total_seconds += minutes !== null ? parseInt(minutes[1])*60 : 0;
            total_seconds += seconds !== null ? parseInt(seconds[1]) : 0;
        }
        time = total_seconds > 0 ? '&start='+total_seconds : '';

        if(url.match(/(\?v\=|&v\=|&amp;v=)/)){
            parts = url.split('v=');
            ID = parts[1].substr(0,11);
        }else if(url.match(/youtu\.be/)){
            parts = url.split("/");
            ID = parts[3].substr(0,11);
        }
        
        if(ID){
            data.embed = "&lt;object width=\"600\" height=\"338\"&gt;&lt;param name=\"movie\" value=\"http://www.youtube.com/v/"
            +ID+"?version=3&amp;feature=oembed"+time+"\"&gt;&lt;/param&gt;&lt;param name=\"allowFullScreen\" value=\"true\"&gt;&lt;/param&gt;&lt;param name=\"allowscriptaccess\" value=\"always\"&gt;&lt;/param&gt;&lt;embed src=\"http://www.youtube.com/v/"+ID+"?version=3&amp;feature=oembed"+time+"\" type=\"application/x-shockwave-flash\" width=\"600\" height=\"338\" allowscriptaccess=\"always\" allowfullscreen=\"true\"&gt;&lt;/embed&gt;&lt;/object&gt;";
            data.thumbnail = "http://i2.ytimg.com/vi/"+ID+"/hqdefault.jpg";
            return data;
        }else{
            return false;
        }
    },

    // prepares embed code for js api access
    prepEmbed: function(embed) {
        var js_str = 'version=3&enablejsapi=1&playerapiid=ytplayer';

        embed = embed.replace(/version\=3/gi, js_str);        
        embed = embed.replace(/\<embed/i,'<embed id="ytplayer"');
        embed = embed.replace(/\<iframe/i,'<iframe id="ytplayer"');
        
        return embed;
    }
};

/* 
 *  youtube listener - called by youtube flash/html5 when present
 *  MUST REMAIN IN GLOBAL SCOPE
 */
function onYouTubePlayerReady(playerId) {
    youtube.obj = document.getElementById("ytplayer");
    youtube.obj.addEventListener("onStateChange", "youtube.stateListener", true);
    youtube.obj.addEventListener("onError", "youtube.errorListener", true);
    youtube.stateListener(-1);
}