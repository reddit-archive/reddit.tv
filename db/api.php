<?php

include_once('config.php');

if($_GET['action'] == 'channel_thumbnail'){
	$feed = $_GET['feed'];

	//Reload the bean
	$channel = R::findOne('channel', ' feed = ?', array($feed));

	if(empty($channel)){
		$channel = R::dispense('channel');
		$channel->feed = $feed;
		$channel->thumbnail_url = getChannelThumbnail($feed);

		//Store the bean
		$id = R::store($channel);
	}


	echo $channel->thumbnail_url;
	return;
}

function getChannelThumbnail($feed){
	$thumbnail_url = null;

	$uri = "http://reddit.com".$feed.'.json?limit=100';
	$uri = "http://www.reddit.com".$feed."/search/.json?q=%28and+%28or+site%3A%27youtube.com%27+site%3A%27vimeo.com%27+site%3A%27youtu.be%27%29+timestamp%3A1382227035..%29&restrict_sr=on&sort=top&syntax=cloudsearch&limit=100";
	$channel_info = json_decode(file($uri)[0]);
	$x = 0;

	while(!isVideo($channel_info->data->children[$x]->data->domain)){ 
		echo isVideo($channel_info->data->children[$x]->data->domain);
		echo var_export($channel_info->data->children[$x]->data->domain, true);
		echo "\n";
		$x++;
	}

	$thumbnail_url = $channel_info->data->children[$x]->data->media->oembed->thumbnail_url;

    return $thumbnail_url;
}

function isVideo($video_domain) {
	$domains = [
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
        ];
    return in_array($video_domain, $domains);
}


?>