<?php

include_once('config.php');

if($_GET['action'] == 'channel_thumbnail'){
	$feed = $_GET['feed'];

	//Reload the bean
	// $channel = R::findOne('channel', ' feed = ?', array($feed));
	$channel = [];

	if(empty($channel)){
		echo 'channel empty';
		$channel = R::dispense('channel');
		$channel->feed = $feed;
		$channel->thumbnail_url = getChannelThumbnail($feed);

		//Store the bean
		$id = R::store($channel);
		echo $id;
	}


	echo $channel->thumbnail_url;
	return;
}

function getChannelThumbnail($feed){
	// $sorting = Globals.sorting.split(':');
 //    $sortType = '';
 //    $sortOption = '';
 //    $uri;

 //    if (sorting.length === 2) {

 //        sortType = sorting[0] + '/';
 //        sortOption = '&t=' + sorting[1];
 //    }

 //    if ($channel_obj.type === 'search' && $sorting.length === 1) {

 //        $uri = $feed + Globals.search_str + '&limit=100';
 //    }
 //    else {

 //        $uri = $feed + $sortType + '.json?limit=100' + $sortOption;
 //    }
	$uri = "http://reddit.com".$feed.'.json?limit=100';
	echo "uri: ".$uri;
	$channel_info = file($uri);
	echo "\n\n";
	echo var_export(json_decode($channel_info[0])->data->children[0], true);
	echo "\n\n";

    return $uri;
}


?>