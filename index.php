<?php
  include_once('db/config.php');
  include_once('lib/functions.php');
  init();
?><!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
<title>reddit.tv</title>

<link rel="shortcut icon" href="favicon.ico" />

<!-- TODO Set up social media metadata for sharing -->
<meta property="og:type" content="website" />
<meta itemprop="name" content="reddit.tv" />
<meta itemprop="headline" content="" />
<meta property="og:title" content="reddit.tv" />
<meta itemprop="description" content="" />
<meta property="og:description" content="" />
<link itemprop="url" href="" />
<meta property="og:url" content="" />
<link itemprop="thumbnailUrl" href="" />
<meta property="og:image" content="" />

<!-- Unsemantic Grid -->
<!--[if (gt IE 8) | (IEMobile)]><!-->
  <link rel="stylesheet" href="./css/unsemantic-grid-responsive.css" />
<!--<![endif]-->
<!--[if (lt IE 9) & (!IEMobile)]>
  <link rel="stylesheet" href="./css/unsemantic-grid-ie.css" />
<![endif]-->

<link rel="stylesheet" href="css/layout.css" type="text/css" />
<link rel="stylesheet" href="css/bootstrap.min.css" type="text/css" />
<link rel="stylesheet" href="css/theme_light.css" type="text/css" id="theme" />
<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic' rel='stylesheet' type='text/css'>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" type="text/javascript"></script>
<script src="js/plugins.js" type="text/javascript"></script>

<script src="js/bootstrap.min.js" type="text/javascript"></script>

<script src="https://www.youtube.com/player_api" type="text/javascript"></script>
<script src="js/tv.youtube.js" type="text/javascript"></script>
<script src="js/tv.vimeo.js" type="text/javascript"></script>

<script type="text/javascript">
Globals = {
  channels: <?php echo default_value($settings->default_channels_json, '[]'); ?>,
  recommended_channels: <?php echo default_value($settings->recommended_channels_json, '[]'); ?>,
  sponsored_channels: <?php echo getSponsoredChannels(); ?>
};
</script>
<script src="js/tv.js" type="text/javascript"></script>

</head>
<body>
  <header>
    <div id="header-container">
      <div id="header" class="grid-container">
        <div id="logo" class="grid-25">
          <a href="/"><img src="img/logo.png" /></a>
        </div>
        <div id="now-playing-title" class="grid-50 center-align">
          /r/subreddit &#9660;
        </div>

        <div id="settings">
          <div class="buttons btn-group" data-toggle="buttons">
            <label class="btn btn-default icon-next settings-auto">
              <input type="checkbox"> Auto Play/Advance
            </label>
            <label class="btn btn-default icon-shuffle settings-shuffle">
              <input type="checkbox"> Shuffle
            </label>
            <label class="btn btn-default icon-spam settings-sfw">
              <input type="checkbox"> SFW
            </label>

            <div id="sorting" class="btn-group">
              <button type="button" class="btn btn-default icon-menu" data-toggle="dropdown">
                Sorting
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li><a href="#sort=hot">Hot</a></li>
                <li><a href="#sort=top:day">Top Today</a></li>
                <li><a href="#sort=top:week">Top Week</a></li>
                <li><a href="#sort=top:month">Top Month</a></li>
                <li><a href="#sort=top:year">Top Year</a></li>
              </ul>
            </div>
            <div id="hax" class="btn-group">
              <button type="button" class="btn btn-default" data-toggle="dropdown">
                Hax
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li><a href="https://www.youtube.com/account_playback" target="_blank">YouTube Annotations</a></li>
              </ul>
            </div>

            <button id="toggle-settings" type="button" class="btn btn-default icon-equalizer"></button>
          </div>
        </div>
      </div> <!-- /#header -->
    </div> <!-- /#header-container -->
    <div id="video-list" class="animated"></div>
  </header>
  <div id="video-view">
    <div id="main-container" class="grid-container">
      <div id="loading">
         <div class="text"><div class="loading">loading</div><div class="what"></div></div>
         <div class="tv"><div class="image"></div></div>
      </div>
      <div id="video-container">
        <div id="video-embed" class="grid-100 mobile-grid-100">

        </div>
        <a id="prev-button" href="javascript:void(0);"><img src="img/arrow-prev.png" /></a>
        <a id="next-button" href="javascript:void(0);"><img src="img/arrow-next.png" /></a>
        <div id="video-meta">
          <div id="video-description" class="grid-70 mobile-grid-75">
            <span id="video-sponsored-label" class="sponsored">SPONSORED </span>
            <span id="video-title"></span> 
          </div>
          <div id="sponsored-actions" class="grid-30 right-align">
          </div>
          <div id="video-actions" class="grid-30 right-align">
            <a id="video-comments-link" href="" target="_blank">COMMENTS</a> | <a id="video-tweet-link" href="" target="_blank">TWEET</a> | <a id="video-share-link" href="" target="_blank">SHARE</a>
          </div>
        </div>
      </div>

      <div id="add-channel" class="disabled">
        <div id="video-return"></div>

        <div class="grid-50 prefix-50 text">
          <h1>Add your own channel</h1>

          <div class="subreddit">
            <h2>Subreddit channel</h2>
            <h1 class="or">or</h2>
            You can make your own channel from a subreddit. <i>(e.g. jazz)</i>
          </div>

          <div class="site">
            <h2>Site channel</h2>
            Search for all the videos from a certain domain. <i>(e.g. ted.com)</i>
          </div>

          <form>
            <input type="text" class="channel-name" placeholder="Subreddit or domain name" />
            <input type="submit" class="channel-submit" value="Add channel" />
          </form>

          <div id="add-channel-message"></div>
        </div>

        <div class="recommended channels">
          <h2>Recommended channels</h2>
        </div>

        <div class="channel-to-add channels">
          <h2>Videos in /r/subreddit</h2>
        </div>

      </div>
    </div>
  </div>

  <div id="channels" class="channels grid-container">
    <a id="add-channel-button" class="grid-25 channel" href="#add-channel">
      <div class="thumbnail"></div>
      <span class="name">Add Channel</span>
    </a>
  </div>

  <footer>
    <div class="grid-container">
      Use of this site constitutes acceptance of our <a href="http://www.reddit.com/help/useragreement">User Agreement (updated)</a> and <a href="http://www.reddit.com/help/privacypolicy">Privacy Policy</a>. © 2013 reddit Inc. All rights reserved.
      <!-- Use of Twitter Bootstrap under Apache 2.0 license -->
    </div>
  </footer>

<div id="vid-list-tooltip"></div>

<script src="js/analytics.js" type="text/javascript"></script>
</body>
</html>
