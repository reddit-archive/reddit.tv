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
	var_dump($_POST);
}

?>