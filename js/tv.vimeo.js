/*
 *  vimeo singleton oh yeah!
 *  vimeo's universal embed makes use of window.postMessage for cross domain script access
 */
var vimeo = {
    obj: null, //will reference the current vimeo embed

    //sends request for paused state or reacts to paused state
    togglePlay: function(paused){
        if(paused === undefined){
            var msg = '{"method": "paused"}';
            vimeo.sendMsg(msg);
        }else{
            if(paused){
                vimeo.play();
            }else{
                vimeo.pause();
            }
        }
    },

    play: function(){
        var msg = '{"method": "play"}';
        vimeo.sendMsg(msg);
    },

    pause: function(){
        var msg = '{"method": "pause"}';
        vimeo.sendMsg(msg);
    },

    createEmbed: function(url){
        var ID, created = {};
        ID = url.match(/\/(\d+)/);
        
        if(ID){
            ID = ID[1];
        }        
        if(ID){
            created.embed = "&lt;iframe src=\"http://player.vimeo.com/video/"+ID+"\" width=\"600\" height=\"338\" frameborder=\"0\" webkitallowfullscreen allowfullscreen&gt;&lt;/iframe&gt;";
            created.thumbnail = null;
            return created;
        }else{
            return false;
        }
    },

    // prepares embed code for js api access
    prepEmbed: function(embed) {
        var split, js_str = '?api=1&player_id=vimeoplayer';
        
        if(embed.indexOf('" width="') !== -1){
            split = embed.indexOf('" width="');
            embed = embed.substr(0,split)+js_str+embed.substr(split);

            split = embed.indexOf('src="');
            embed = embed.substr(0,split)+'id="vimeoplayer" '+embed.substr(split);
        }
    
        return embed;
    },

    readyListener: function(){
        //register finish listener
        var msg = '{"method": "addEventListener", "value": "finish"}';
        vimeo.sendMsg(msg);

        //auto play if enabled
        if(Globals.auto){
            vimeo.play();
        }
    },

    finishListener: function(){
        if(Globals.auto){
            loadVideo('next');
        }
    },

    addListeners: function(){
        vimeo.obj = document.getElementById("vimeoplayer");
        window.addEventListener("message", vimeo.receiveMessage, false);  
    },

    sendMsg: function(msg){
        var target = vimeo.obj.contentWindow;
        target.postMessage(msg, 'http://player.vimeo.com/');
    },

    receiveMessage: function(msg){
        var msgData = eval('(' + msg.data + ')');
        var the_switch = (msgData.event === undefined ? msgData.method : msgData.event);

        switch(the_switch){
        case "ready":
            vimeo.readyListener();
            break;
        case "finish":
            vimeo.finishListener();
            break;
        case "paused":
            vimeo.togglePlay(msgData.value);
            break;
        default:
            consoleLog(msgData);
            break;
        }
    }
};