<?php

$settings = new stdClass();

function init() {
	global $settings;

	$settings = R::load('settings', 1);
}

function defaultChannels() {
	global $settings;

	$channels = json_decode($settings->default_channels);

	echo $settings->default_channels;
}

?>