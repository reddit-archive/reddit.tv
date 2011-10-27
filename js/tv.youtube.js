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

    ,createEmbed: function(url){
        var ID, parts;

        if(url.match(/youtu\.be/)){
            parts = url.split("/");
            ID = parts[3].substr(0,11);
            consoleLog('youtu.be ID: '+ID);
        }

        if(url.match('youtube.com')){
            if(url.match(/\?v\=/)){
                parts = url.split('?v=');
                ID = parts[1].substr(0,11);
                consoleLog('youtube.com ID: '+ID);
            }
        }
        
        if(ID){

            return "&lt;object width=\"600\" height=\"338\"&gt;&lt;param name=\"movie\" value=\"http://www.youtube.com/v/"
            +ID+"?version=3&amp;feature=oembed\"&gt;&lt;/param&gt;&lt;param name=\"allowFullScreen\" value=\"true\"&gt;&lt;/param&gt;&lt;param name=\"allowscriptaccess\" value=\"always\"&gt;&lt;/param&gt;&lt;embed src=\"http://www.youtube.com/v/"+ID+"?version=3&amp;feature=oembed\" type=\"application/x-shockwave-flash\" width=\"600\" height=\"338\" allowscriptaccess=\"always\" allowfullscreen=\"true\"&gt;&lt;/embed&gt;&lt;/object&gt;";
            
/*
            return '<object width="640" height="480">'
                +'<param name="movie" value="http://www.youtube.com/v/'
                +ID+'?version=3&amp;enablejsapi=1&amp;playerapiid=ytplayer&amp;feature=oembed">'
                +'<param name="allowFullScreen" value="true">'
                +'<param name="allowscriptaccess" value="always">'
                +'<embed id="ytplayer" src="http://www.youtube.com/v/'
                +ID+'?version=3&amp;enablejsapi=1&amp;playerapiid=ytplayer&amp;feature=oembed" type="application/x-shockwave-flash" width="640" height="480" allowscriptaccess="always" allowfullscreen="true"></object>';
*/
        }else{
            return false;
        }
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