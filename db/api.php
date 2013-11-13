<?php

include_once('../lib/functions.php');
include_once('config.php');

if($_GET['action'] == 'channel_thumbnail'){
	$feed = $_GET['feed'];

	if($cacheAvailable){
		$thumbnail_url = $memcache->get("chthmb-$feed");
		if(!empty($thumbnail_url)){
			$channel = new stdClass();
			$channel->feed = $feed;
			$channel->thumbnail_url = $thumbnail_url;
			$channel->data_source = 'memcache';
			echo json_encode(array($channel));
			die();
		}
	}

	//Reload the bean
	$channel = R::findOne('channel', ' feed = ?', array($feed));

	if(empty($channel) || empty($channel->thumbnail_url) || !empty($_GET['debug'])){
		if(empty($channel))
			$channel = R::dispense('channel');
		$channel->feed = $feed;
		$channel->thumbnail_url = getChannelThumbnail($feed);

		//Store the bean
		$id = R::store($channel);

		$channel->data_source = 'http';
	} else {
		$channel->data_source = 'database';
	}

	if($cacheAvailable)
		$memcache->add("chthmb-$feed", $channel->thumbnail_url, false, 1800);

	echo json_encode(R::exportAll($channel));
	die();
} else if ($_GET['action'] == 'youtube_thumbnail') {
	getYoutubeThumbnail($_GET['id'], isset($_GET['base64']));
} else if ($_GET['action'] == 'ads') {
	getAds();
}

function getChannelThumbnail($feed){
	$thumbnail_url = null;

	if(preg_match("/\/domain\//u", $feed) > 0){
		$uri = "http://www.reddit.com".$feed."/search/.json?timestamp%3A1382227035..%29&restrict_sr=on&sort=top&syntax=cloudsearch&limit=100";
	}
	else {
		$uri = "http://www.reddit.com".$feed."/search/.json?q=%28and+%28or+site%3A%27youtube.com%27+site%3A%27vimeo.com%27+site%3A%27youtu.be%27%29+timestamp%3A1382227035..%29&restrict_sr=on&sort=top&syntax=cloudsearch&limit=100";
	}
	$file = file($uri);
	$channel_info = json_decode($file[0]);

	$entries = $channel_info->data->children;

	for($x=0; $x<count($entries); $x++){
		if(isVideo($entries[$x]->data->domain)){ 
			if(!empty($entries[$x]->data->media->oembed->thumbnail_url)){
				$thumbnail_url = $entries[$x]->data->media->oembed->thumbnail_url;
				break;
			}
		}
		$x++;
	}

    return $thumbnail_url;
}

function getYoutubeThumbnail($id, $base64=false) {
	$url = 'http://img.youtube.com/vi/' . $id . '/hqdefault.jpg';
	$imginfo = getimagesize($url);
	if ($base64) {
		ob_start();
		readfile($url);
		$img = ob_get_contents();
		ob_end_clean();
		$dataUri = 'data:' . $imginfo['mime'] . ';base64,' . base64_encode($img);
		$arr = Array(
				'url' => $url,
				'image' => $dataUri
			);

		echo json_encode($arr);
		die();
	} else {
		header('Content-type: ' . $imginfo['mime']);
		readfile($url);
	}
}

function isVideo($video_domain) {
	$domains = Array(
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
        );
    return in_array($video_domain, $domains);
}

function getAds() {
	$settings = R::load('settings', 1);
	// For SQLite:
	/*
		AND DATETIME(start_date) <= DATETIME("now")
		AND DATETIME(end_date) >= DATETIME("now")
	*/

	$sponsoredvideos = R::getAll('
		SELECT id, title, video_url, video_embed_code, image_url
		FROM sponsoredvideo
		WHERE status = 1
		AND start_date <= NOW()
		AND end_date >= NOW()
		ORDER BY id
	  '
	);

	$result = Array(
		'settings' =>
			Array(
				'start' => (int)$settings->ads_start_at,
				'every' => (int)$settings->ads_show_every
				),
		'videos' => $sponsoredvideos,
		'used' => Array(),
		'last' => 9001
		);

	jsonForAjax($result);
}


?>