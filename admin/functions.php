<?php

// AWS Includes
require '../vendor/autoload.php';
use Aws\S3\S3Client;

$db_name = '';

function ajaxFunc() {
	global $db_name;

	if (!isset($_REQUEST['type'])) return;

	$db_names = Array(
			'videos' => 'sponsoredvideo',
			'skins' => 'sponsoredskin',
			'channels' => 'sponsoredchannel',
			'settings' => 'settings',
		);

	$db_name = $db_names[$_REQUEST['type']];

	$funcs = Array(
		'videos',
		'skins',
		'channels',
		'settings'
	);

	if (!in_array($_REQUEST['type'], $funcs)) jsonError('Invalid action.');

	if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'get') {
		jsonQuery();
	} else if ($_REQUEST['type'] == 'settings') {
		updateSettings();
	} else {
		addEdit();
	}
}

function addEdit() {
	global $db_name;
	$edit = isset($_POST['edit']);
	$type = $_REQUEST['type'];
	$errors = Array();

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
	if ($type == 'videos') {
		$max_width = 150;
	} else if ($type == 'channels') {
		$max_width = 230;
	}

	$image_url = imageUpload($filename, $max_width);
	if ($image_url) {
		$db->image_url = $image_url;
	} else {
		$errors[] = 'Image upload failed.';
	}

	if ($type == 'channels') $db->video_list = json_encode($_REQUEST['video_urls']);

	if (!$edit) {
		$db->created_on = R::isoDateTime();
	} else {
		$db->updated_on = R::isoDateTime();
	}

	$id = R::store($db);

	$returnArr = $db->export();
	if (!empty($errors)) $returnArr['errors'] = $errors;

	jsonForAjax($returnArr);
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
	// Only return JSON for AJAX requests
	if (isset($_REQUEST['ajax'])) {
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
	if ($status == 'ready' && time() > strtotime($start_date)) $status = 'active';

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
		$img = $file;
	} else {
		if ($file['error'] > 0) return false;

		$img = $file['tmp_name'];
	}

	list($upload_w, $upload_h, $upload_type) = getimagesize($img);

	switch ($upload_type) {
		case IMAGETYPE_GIF:
			$gd_img = imagecreatefromgif($img);
			break;
		case IMAGETYPE_JPEG:
			$gd_img = imagecreatefromjpeg($img);
			break;
		case IMAGETYPE_PNG:
			$gd_img = imagecreatefrompng($img);
			break;
	}
	if ($gd_img === false) return false;

	$img_w = $upload_w;
	$img_h = $upload_h;
	$img_ar = $img_w / $img_h;

	// resize if needed
	if ($max_width > 0 || $max_height > 0) {
		if ($max_width > 0) {
			$img_w = $max_width;
			$img_h = floor($max_width / $img_ar);
		} else if ($max_height > 0) {
			$img_w = ceil($max_height * $img_ar);
			$img_h = $max_height;
		}
	}

	$resized_img = tempnam('', '');

	$gd_img_resized = imagecreatetruecolor($img_w, $img_h);
	imagecopyresampled($gd_img_resized, $gd_img, 0, 0, 0, 0, $img_w, $img_h, $upload_w, $upload_h);
	$jpg_created = imagejpeg($gd_img_resized, $resized_img, 90);
	imagedestroy($gd_img);
	imagedestroy($gd_img_resized);

	if (!$jpg_created) return false;

	// Upload to S3
	$aws_s3_client = S3Client::factory();
	$key = $filename.'.jpg';

	$result = $aws_s3_client->putObject(array(
	    'Bucket' => AWS_BUCKET,
	    'Key'    => $key,
	    'Body'   => fopen($resized_img, 'r')
	));

	return $result['ObjectURL'];
}

function pickFilename($arr=Array(), $ext='.jpg') {
	$arr = array_filter($arr);
	foreach ($arr as $key => $val) {
		$sanitized = sanitize_file_name($val);
		$arr[$key] = ($sanitized) ? $sanitized : uniqid();
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
	$special_chars = array("?", "[", "]", "/", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}");
	$filename = str_replace($special_chars, '', $filename);
	$filename = preg_replace('/[\s-]+/', '-', $filename);
	$filename = trim($filename, '.-_');
	return $filename;
}

function updateSettings() {
	$db_name = 'settings';

	$item = R::load($db_name, 1);
	foreach ($_POST as $key => $val) {
		if (substr($key, 0, 3) != 'db_') continue;

		$item->{substr($key, 3)} = $val;
	}

	$id = R::store($item);

	$res = new stdClass();
	$res->success = $id ? true : false;
	jsonForAjax($res);
}

?>