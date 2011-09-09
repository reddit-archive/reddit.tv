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

    // prepares embed code for js api access
    ,prepEmbed: function(embed) {
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
}

/* 
 *  youtube listener - called by youtube flash/html5 when present 
 */
function onYouTubePlayerReady(playerId) {
    youtube.obj = document.getElementById("ytplayer");
    youtube.obj.addEventListener("onStateChange", "youtube.stateListener", true);
}