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

			if (!$channels[$id]->owner) $channels[$id]->owner = 'site';

			if ( $thumb && $thumb->thumbnail_url != '' )
				$channels[$id]->thumbnail = $thumb->thumbnail_url;
		}

		$settings_name = $type . '_channels_json';
		$settings->{$settings_name} = json_encode($channels);
	}
}

function getSponsoredChannels() {
	$sponsored_channel = R::getAll('
		SELECT id, title as channel, video_list, image_url as thumbnail
		FROM sponsoredchannel
		WHERE status = 1
		AND start_date <= NOW()
		AND end_date >= NOW()
		ORDER BY start_date DESC
	  '
	);

	return json_encode($sponsored_channel);
}

function getSkins() {
	$skins = Array(
		'header'  => '',
		'video'   => '',
		'channel' => '',
		);

	$sponsored_skins = R::getAll('
		SELECT id, position, image_url
		FROM sponsoredskin
		WHERE status = 1
		AND start_date <= NOW()
		AND end_date >= NOW()
		ORDER BY start_date DESC
		LIMIT 10
	  '
	);

	foreach ($sponsored_skins as $skin) {
		$skins[ $skin['position'] ] = $skin['image_url'];
	}

	return $skins;
}

function printSkinCss() {
	$skins = getSkins();
	?>
<style type="text/css" id="skin-css">
<?php
	if ($skins['header'] != '') :
?>
	#header-container { background-image: url('<?php echo $skins['header']; ?>'); }
<?php
	endif;

	if ($skins['video'] != '') :
?>
	#video-view { background-image: url('<?php echo $skins['video']; ?>'); }
<?php
	endif;

	if ($skins['channel'] != '') :
?>
	#channels-container { background-image: url('<?php echo $skins['channel']; ?>'); }
<?php
	endif;
?>
</style>
	<?php

	return $skins;
}

function jsonError($error) {
	jsonForAjax(Array('error' => $error));
}

function jsonForAjax($arr) {
	header('X-Content-Type-Options: nosniff');
	header('Content-Type: application/json');
	die(json_encode($arr, JSON_HEX_TAG));
}

function default_value(&$var, $default) {
    if (empty($var)) {
        $var = $default;
    }

	return $var;
}

?>