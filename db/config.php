<?php

//Example Script, saves Hello World to the database.

//First, we need to include redbean
require_once(dirname(__FILE__).'/rb.php');

//Second, we need to setup the database

//If you work on Mac OSX or Linux (or another UNIX like system)
//You can simply use this line:

R::setup('sqlite:'.realpath(dirname(__FILE__)).'/database.s3db');
//R::setup('database.txt'); -- for other systems

?>