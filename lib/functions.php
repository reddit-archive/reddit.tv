<?php

$settings = new stdClass();

function init() {
	global $settings;

	$settings = R::load('settings', 1);
	getChannels();
}

function getChannels() {
	global $settings;

	$types = Array('default', 'recommended');

	foreach ($types as $type) {
		$db_table = $type . '_channels';
		$channels = json_decode($settings->{$db_table});
		foreach ($channels as $id => $channel) {
			$thumb = R::findOne('channel',
			  ' feed = ? LIMIT 1 ', array( $channel->feed )
			);

			if ( $thumb && $thumb->thumbnail_url != '' )
				$channels[$id]->thumbnail = $thumb->thumbnail_url;
		}

		$settings_name = $type . '_channels_json';
		$settings->{$settings_name} = json_encode($channels);
	}
}

function jsonError($error) {
	die(json_encode(Array('error' => $error)));
}

function jsonForAjax($arr) {
	// Only return JSON for AJAX requests
	echo json_encode($arr);
	die();
}

function default_value(&$var, $default) {
    if (empty($var)) {
        $var = $default;
    }

	return $var;
}

?>