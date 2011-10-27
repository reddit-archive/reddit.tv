/*
 *  youtube singleton oh yeah! 
 */
var youtube = {
    obj: null //will hold the current youtube embed

    ,togglePlay: function(){
        //unstarted (-1), ended (0), playing (1), 
        //paused (2), buffering (3), video cued (5)
        if(youtube.obj.getPlayerState() !== 1){
            youtube.obj.playVideo();
        }else{
            youtube.obj.pauseVideo();
        }
    }

    ,stateListener: function(state){
        if(globals.auto){ //global scope
            if(state === 0){
                loadVideo('next');  //tv.js
            }else if(state === -1){
                youtube.togglePlay();
            }
        }
    }

    ,errorListener: function(error){
        consoleLog('youtube error received: '+error);
        loadVideo('next');
    }

    // prepares embed code for js api access
    ,prepEmbed: function(embed) {
        var js_str = 'version=3&enablejsapi=1&playerapiid=ytplayer';

        embed = embed.replace(/version\=3/gi, js_str);        
        embed = embed.replace(/\<embed/i,'<embed id="ytplayer"');
    
        return embed;
    }
}

/* 
 *  youtube listener - called by youtube flash/html5 when present 
 */
function onYouTubePlayerReady(playerId) {
    youtube.obj = document.getElementById("ytplayer");
    youtube.obj.addEventListener("onStateChange", "youtube.stateListener", true);
    youtube.obj.addEventListener("onError", "youtube.errorListener", true);
}