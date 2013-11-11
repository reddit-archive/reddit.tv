<?php

define('BASE_PATH', dirname(realpath(__FILE__)) . '/../');
define('UPLOAD_PATH', dirname(realpath(__FILE__)) . '/../uploads/');
define('UPLOAD_URL', 'uploads/');

//Example Script, saves Hello World to the database.

//First, we need to include redbean
require_once(dirname(__FILE__).'/rb.php');

//Second, we need to setup the database

//If you work on Mac OSX or Linux (or another UNIX like system)
//You can simply use this line:

if(!empty($_SERVER['RDS_HOSTNAME'])){
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
	//R::setup('database.txt'); -- for other systems
}

?>