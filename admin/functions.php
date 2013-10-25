<?php

function ajaxFunc() {
	if (!$_POST['function']) return;

	$funcs = Array(
		'videoAdd'
	);

	if (!in_array($_POST['function'], $funcs)) {
		die($_POST['function']);
		return;
	}

	if (function_exists($_POST['function']))
		$_POST['function']();
}

function videoAdd() {
	$video = R::dispense('sponsoredvideo');

	foreach ($_POST as $key => $val) {
		if (substr($key, 0, 3) != 'db_') continue;

		$video->{substr($key, 3)} = $val;
	}
	$video->created_on = R::isoDateTime();

	$id = R::store($video);

	jsonForAjax($video->export());
}

function jsonForAjax($arr) {
	// Only return JSON for AJAX POSTs
	if ($_POST['ajax']) {
		echo json_encode($arr);
		die();
	}
}

function statusCodeToText($code, $start_date) {
	$statuses = Array(
		'draft',
		'ready',
		'ended',
		'deleted'
	);

	$status = $statuses[$code];
	if ($status == 'ready' && mktime() > strtotime($start_date)) $status = 'active';

	return $status;
}

?>