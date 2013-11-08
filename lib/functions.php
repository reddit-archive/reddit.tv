<?php

$settings = new stdClass();

function init() {
	global $settings;

	$settings = R::load('settings', 1);
}

function defaultChannels() {
	global $settings;

	$channels = json_decode($settings->default_channels);
	foreach ($channels as $id => $channel) {
		$thumb = R::findOne('channel',
		  ' feed = ? LIMIT 1 ', array( $channel->feed )
		);

		if ( $thumb && $thumb->thumbnail_url != '' )
			$channels[$id]->thumbnail = $thumb->thumbnail_url;
	}

	return json_encode($channels);
}

?>