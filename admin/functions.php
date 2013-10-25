<?php

require_once('lib/class.upload.php');

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

	$filename = pickFilename(Array(
		$_POST['db_sponsor_name'],
		$_POST['db_title'],
	));

	$image = imageUpload($filename, 150);
	if ($image) $video->thumbnail_url = UPLOAD_URL . $image;

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

function imageUpload($filename, $max_width = 0, $max_height = 0) {
	$img = new Upload($_FILES['image']);
	if (!$img->uploaded) return;

	// save uploaded image with a new name
	$img->file_new_name_body = $filename;
	$img->image_convert = 'jpg';

	// resize if needed
	if ($max_width > 0 || $max_height > 0) {
		$img->image_resize = true;
		if ($max_width > 0) {
			$img->image_x = $max_width;
			$img->image_ratio_y = true;
		} else if ($max_height > 0) {
			$img->image_ratio_x = true;
			$img->image_y = $max_height;
		}
	} 

	$img->Process(UPLOAD_PATH);
	if (!$img->processed) {
		echo 'error : ' . $img->error;
		echo 'image renamed "foo" copied';
	} else {
		$img->Clean();
	}

	return $filename . '.jpg';
}

function pickFilename($arr=Array(), $ext='.jpg') {
	$arr = array_filter($arr);
	foreach ($arr as $key => $val) {
		$arr[$key] = sanitize_file_name($val);
	}

	$filename = implode('_', $arr);
	$old_filename = $filename;

	$i = 0;
	while (file_exists(UPLOAD_PATH . $filename . '.jpg')) {
		$i++;
		$filename = $old_filename . '_' . $i;
	}

	return $filename;
}

function sanitize_file_name( $filename ) {
	$filename_raw = $filename;
	$special_chars = array("?", "[", "]", "/", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}");
	$filename = str_replace($special_chars, '', $filename);
	$filename = preg_replace('/[\s-]+/', '-', $filename);
	$filename = trim($filename, '.-_');
	return $filename;
}

?>