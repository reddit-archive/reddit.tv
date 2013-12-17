<?php

if(file_exists(dirname(realpath(__FILE__)) . '/config-local.php')){
	require_once(dirname(realpath(__FILE__)) . '/config-local.php');
}
else {
	define('BASE_PATH', dirname(realpath(__FILE__)) . '/../');
	define('UPLOAD_PATH', dirname(realpath(__FILE__)) . '/../uploads/');
	define('UPLOAD_URL', 'uploads/');
	define('AWS_BUCKET', $_SERVER['S3_BUCKET']);
	define('USE_SQLITE', false);

	// Include RedbeanPHP
	require_once(dirname(__FILE__).'/rb.php');

	if(!USE_SQLITE && !empty($_SERVER['RDS_HOSTNAME'])){
		$dbhost = $_SERVER['RDS_HOSTNAME'];
		$dbport = $_SERVER['RDS_PORT'];
		$dbname = $_SERVER['RDS_DB_NAME'];

		$username = $_SERVER['RDS_USERNAME'];
		$password = $_SERVER['RDS_PASSWORD'];

		R::setup("mysql:host=$dbhost;port=$dbport;
	    	dbname=$dbname",$username,$password);
	}
	else{
		R::setup('sqlite:'.realpath(dirname(__FILE__)).'/database.s3db');
	}

	// Free db from schema changes
	R::freeze(true);

	if(class_exists('Memcache')){
		// Connection creation
		$memcache = new Memcache;
		$cacheAvailable = $memcache->connect($_SERVER['MEMCACHED_HOST'], $_SERVER['MEMCACHED_PORT']);
	} else {
		$cacheAvailable = false;
	}
}

?>