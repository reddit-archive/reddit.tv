<?php

require_once('lib/class.upload.php');

$db_name = '';

function ajaxFunc() {
	global $db_name;

	if (!isset($_REQUEST['type'])) return;

	$db_names = Array(
			'videos' => 'sponsoredvideo',
			'skins' => 'sponsoredskin',
			'channels' => 'sponsoredchannel',
		);

	$db_name = $db_names[$_REQUEST['type']];

	$funcs = Array(
		'videos',
		'skins',
		'channels',
	);

	if (!in_array($_REQUEST['type'], $funcs)) return;

	if ($_REQUEST['action'] == 'get') {
		jsonQuery();
	} else {
		addEdit();
	}
}

function addEdit() {
	global $db_name;
	$edit = isset($_POST['edit']);

	$db = ($edit) ? R::load($db_name, (int)$_POST['edit']) : R::dispense($db_name);

	foreach ($_POST as $key => $val) {
		if (substr($key, 0, 3) != 'db_') continue;

		$db->{substr($key, 3)} = $val;
	}

	$filename = pickFilename(Array(
		$_POST['db_sponsor_name'],
		$_POST['db_title'],
	));

	$max_width = 0;
	if ($type == 'videos') $max_width = 150;

	$image = imageUpload($filename, $max_width);
	if ($image) $db->image_url = UPLOAD_URL . $image;

	if (!$edit) {
		$db->created_on = R::isoDateTime();
	} else {
		$db->updated_on = R::isoDateTime();
	}

	$id = R::store($db);

	jsonForAjax($db->export());
}

function jsonQuery() {
	global $db_name;

	if (!isset($_REQUEST['id'])) jsonError('ID missing');
	$item = R::load($db_name, (int)$_REQUEST['id']);

	if (!$item->id) jsonError('Unable to find item.');

	jsonForAjax($item->export());
}

function jsonError($error) {
	jsonForAjax(Array('error' => $error));
}

function jsonForAjax($arr) {
	// Only return JSON for AJAX POSTs
	if ($_REQUEST['ajax']) {
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
	$file = $_FILES['image'];
	if ($_FILES['image']['size'] === 0 && $_POST['b64_image'] != '') {
		$file = tempnam('', '');
		$handle = fopen($file, "w");
		$b64 = preg_replace("/^data:.*?;base64,/", '', $_POST['b64_image']);
		fwrite($handle, base64_decode($b64));
		fclose($handle);
	}

	$img = new Upload($file);
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