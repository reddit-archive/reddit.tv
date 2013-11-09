<?php
  include_once('../db/config.php');
  include_once('functions.php');
  ajaxFunc();
?>
<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
<title>reddit.tv Admin</title>

<link rel="shortcut icon" href="../favicon.ico" />

<!-- HTML5 Boilerplate -->


<!-- Unsemantic Grid -->
<!-- <link rel="stylesheet" href="./lib/unsemantic-grid/assets/stylesheets/demo.css" /> -->
<!--[if (gt IE 8) | (IEMobile)]><!-->
  <!-- <link rel="stylesheet" href="../css/unsemantic-grid-responsive.css" /> -->
<!--<![endif]-->
<!--[if (lt IE 9) & (!IEMobile)]>
  <link rel="stylesheet" href="../css/ie.css" />
<![endif]-->

<link rel="stylesheet" href="../css/layout.css" type="text/css" />
<link rel="stylesheet" href="../css/animate.css" type="text/css" />
<link rel="stylesheet" href="./css/bootstrap.css" type="text/css" />
<link rel="stylesheet" href="./style.css" type="text/css" />
<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic' rel='stylesheet' type='text/css'>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" type="text/javascript"></script>
<script src="js/bootstrap.min.js" type="text/javascript"></script>
<script src="js/jquery-ui.min.js" type="text/javascript"></script>
<script src="js/plugins.js" type="text/javascript"></script>
<script src="js/admin.js" type="text/javascript"></script>
</head>
<body>
  <header>
    <div id="header" class="container">
      <div class="row">
        <div class="col-lg-6">
          <img src="../img/logo.png" id="logo" class="pull-left" />
          <h2 class="pull-left">Admin</h2>
        </div>

        <div class="col-lg-6 adminTabs">
          <ul class="nav nav-tabs" id="adminTabs">
            <li><a href="#videos" data-toggle="tab">Videos</a></li>
            <li><a href="#skins" data-toggle="tab">Skins</a></li>
            <li><a href="#channels" data-toggle="tab">Channels</a></li>
            <li><a href="#admin-settings" data-toggle="tab">Settings</a></li>
          </ul>
        </div>
      </div>
    </div> <!-- /#header -->
  </header>

  <div class="container">
    <div id='content' class="tab-content">

      <!-- Videos Pane -->
      <div class="tab-pane active" id="videos">
        <h1>Sponsored Videos</h1>

        <form action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="type" value="videos" />
          <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-6">
                  <input type="text" class="form-control" name="db_sponsor_name" id="inputSponsor1" placeholder="Sponsor Name" required />
                </div>
                <div class="col-lg-6">
                  <input type="text" class="form-control" name="db_title" placeholder="Video Title (Optional)" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon" for="video-length">Length</label>
                <input type="hidden" name="db_start_date" id="video_start_date" value="" />
                <input type="hidden" name="db_end_date" id="video_end_date" value="" />
                <input id="video-length" type="text" class="form-control campaign-length" />
              </div>
                  <!-- <span class="add-on"><i class="icon-calendar"></i></span><input type="text" name="reservation" id="reservation" /> -->
            </div>
            <div class="col-lg-2">
              <div id="video-thumbnail" class="upload vid-thumbnail">
                <span class="text">Video Thumbnail</span>
                <input id="video-thumbnail-input" class="btn-default" type="file" name="image" title="Upload" />
                <input type="hidden" name="b64_image" />
              </div>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-lg-3">
              <div class="input-group">
                <input type="url" class="form-control" name="db_video_url" placeholder="URL" required />
                <div class="input-group-btn">
                  <button type="button" class="btn-embed-code btn btn-default dropdown-toggle" title="Embed Code"><span class="caret"></span></button>
                  <ul class="dropdown-menu pull-right embed-code">
                    <li><textarea name="db_video_embed_code" class="form-control" rows="3"></textarea></li>
                  </ul>
                </div><!-- /btn-group -->
              </div><!-- /input-group -->
            </div>

              <div class="col-lg-2">
                <div class="input-group">
                  <label class="input-group-addon" for="view_target">View Target</label>
                  <input type="text" pattern="[0-9]*" class="form-control" id="view_target" name="db_view_target" placeholder="0" />
                </div>
              </div>

            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Status</label>
                <div class="btn-group">
                  <select name="db_status" class="selectpicker" data-style="btn-success">
                    <option value="1" class="success">Ready</option>
                    <option value="0" class="primary">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-lg-offset-2">
              <button type="submit" class="btn btn-primary btn-block">Add Video</button>
            </div>

          </div>
        </form>

        <h2>Campaigns</h2>

        <?php 
          $sponsoredvideos = R::find('sponsoredvideo', '
              WHERE status != :deleted
              ORDER BY status, start_date
            ', array(
              ':deleted' => 3
              )
          );

          foreach($sponsoredvideos as $video):
            $status_code = statusCodeToText($video->status, $video->start_date);
        ?>
          <div class="well item" data-id="<?php echo $video->id; ?>">
            <div class="form-group row">
              <div class="col-lg-5">
                <div class="row">
                  <div class="col-lg-12">
                    <b>Sponsor:</b> <?php echo $video->sponsor_name; ?>
                  </div>
                </div>
              </div>
              <div class="col-lg-3">
                <b>Length:</b> <?php echo $video->start_date; ?> - <?php echo $video->end_date; ?> 
              </div>
              <div class="col-lg-3">
                <div class="vid-thumbnail" style="background-image: url(../<?php echo $video->image_url; ?>);"></div>
              </div>
            </div>

            <div class="form-group row">
              <div class="col-lg-5">
                <div class="input-group">
                  <input type="text" class="form-control" name="video_url" value="<?php echo $video->video_url; ?>" disabled="disabled" />
                  <div class="input-group-btn">
                    <button type="button" class="btn-embed-code btn btn-default dropdown-toggle">Embed Code&nbsp;&nbsp;&nbsp;<span class="caret"></span></button>
                    <ul class="dropdown-menu pull-right embed-code">
                      <li><textarea class="form-control" rows="3"><?php echo htmlentities($video->video_embed_code); ?></textarea></li>
                    </ul>
                  </div><!-- /btn-group -->
                </div><!-- /input-group -->
              </div>

              <div class="col-lg-3">
                <div class="input-group">
                  <label class="input-group-addon">Status</label>
                  <div class="btn-group">
                    <div class="btn status-btn" data-status="<?php echo $status_code; ?>">
                      <span class="pull-left"><?php echo $status_code; ?></span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-2 col-lg-offset-2">
                <button  class="btn btn-default btn-block btn-edit">Edit</button>
              </div>

            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <!-- Skins Pane -->
      <div class="tab-pane" id="skins">
        <h1>Sponsored Skins</h1>

        <form action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="type" value="skins" />
          <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" name="db_title" placeholder="Campaign Title" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon" for="skins-length">Length</label>
                <input type="hidden" name="db_start_date" id="skins_start_date" value="" />
                <input type="hidden" name="db_end_date" id="skins_end_date" value="" />
                <input id="skins-length" type="text" class="form-control campaign-length" />
              </div>
            </div>
            <div class="col-lg-2">
              <div id="skin-thumbnail" class="upload vid-thumbnail">
                <span class="text">Skin Image</span>
                <input id="skin-thumbnail-input" class="btn-default" type="file" name="image" title="Upload" />
                <input type="hidden" name="b64_image" />
              </div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-6">
                  <input type="text" class="form-control" name="db_sponsor_name" placeholder="Sponsor Name" />
                </div>

                <div class="col-lg-6">
                  <div class="input-group">
                    <label class="input-group-addon">Status</label>
                    <div class="btn-group">
                      <select name="db_status" class="selectpicker" data-style="btn-success">
                        <option value="1" class="success">Ready</option>
                        <option value="0" class="primary">Draft</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Placement</label>
                <div class="btn-group">
                  <select name="db_position" class="selectpicker placement">
                    <option value="header">Header Background</option>
                    <option value="video" selected="selected">Video Background</option>
                    <option value="channel">Channel Background</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-lg-offset-2">
              <button type="submit" name="add" class="btn btn-primary btn-block">Add Skin</button>
            </div>

          </div>
        </form>

        <h2>Campaigns</h2>
        <?php 
          $sponsoredskins = R::find('sponsoredskin', '
              WHERE status != :deleted
              ORDER BY status, start_date
            ', array(
              ':deleted' => 3
              )
          );

          foreach($sponsoredskins as $skin):
            $status_code = statusCodeToText($skin->status, $skin->start_date);
        ?>
          <div class="well item" data-id="<?php echo $skin->id; ?>">
            <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <b>Title:</b> <?php echo $skin->title; ?>
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <b>Length:</b> <?php echo $skin->start_date; ?> - <?php echo $skin->end_date; ?> 
              </div>
            </div>
            <div class="col-lg-3">
              <div class="vid-thumbnail" style="background-image: url(../<?php echo $skin->image_url; ?> );"></div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-6">
                  <b>Sponsor:</b> <?php echo $skin->sponsor_name; ?>
                </div>

                <div class="col-lg-6">
                  <div class="input-group">
                    <label class="input-group-addon">Status</label>
                    <div class="btn-group">
                      <div class="btn status-btn" data-status="<?php echo $status_code; ?>">
                        <span class="pull-left"><?php echo $status_code; ?></span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Placement</label>
                <div class="btn-group">
                  <div class="btn status-btn">
                    <span class="pull-left"><?php echo ucfirst($skin->position); ?> Background</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-lg-offset-2">
              <button class="btn btn-default btn-block btn-edit">Edit</button>
            </div>

          </div>
        </div>
        <?php endforeach; ?>
      </div>

      <!-- Channels Pane -->
      <div class="tab-pane" id="channels">
        <h1>Sponsored Channels</h1>

        <form action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="type" value="channels" />
          <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" name="db_title" placeholder="Campaign Title" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon" for="channels-length">Length</label>
                <input type="hidden" name="db_start_date" id="channels_start_date" value="" />
                <input type="hidden" name="db_end_date" id="channels_end_date" value="" />
                <input id="channels-length" type="text" class="form-control campaign-length" />
              </div>
            </div>
            <div class="col-lg-2">
              <div id="channel-thumbnail" class="upload vid-thumbnail">
                <span class="text">Channel Thumbnail</span>
                <input id="channel-thumbnail-input" class="btn-default" type="file" name="image" title="Upload" />
                <input type="hidden" name="b64_image" />
              </div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" name="db_sponsor_name" placeholder="Sponsor Name" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Status</label>
                <div class="btn-group">
                  <select name="db_status" class="selectpicker" data-style="btn-success">
                    <option value="1" class="success">Ready</option>
                    <option value="0" class="primary">Draft</option>
                  </select>
                </div>
              </div>

            </div>

            <div class="col-lg-2 col-lg-offset-2">
              <button type="submit" name="add" class="btn btn-primary btn-block">Add Channel</button>
            </div>

          </div>

          <div id="channel-vidlist" class="form-group row">
            <div class="col-lg-5">
              <ul class="unstyled">
                <li class="video-input">
                  <div class="input-group">
                    <input type="url" class="form-control" name="video_urls[]" placeholder="Video URL" required />
                    <div class="input-group-btn">
                      <div class="btn btn-default">&equiv;</div>
                    </div><!-- /btn-group -->
                  </div><!-- /input-group -->
                </li>
              </ul>
              <div id="channel-vid-delete" class="alert alert-danger">Drop here to delete.</div>
            </div>

            <div class="col-lg-3">
              <button id="add-channel-vid" type="button" class="btn btn-default">Add Another Video</button>
            </div>

            <div class="col-lg-2">
              <div class="input-group">
                <span class="input-group-addon">
                  <input type="hidden" name="db_autoplay" value="0" class="skip" />
                  <input type="checkbox" name="db_autoplay" id="channel-autoplay" value="1" />
                </span>
                <label for="channel-autoplay" class="form-control">Autoplay</label>
              </div><!-- /input-group -->
            </div>

          </div>

        </form>


        <h2>Campaigns</h2>
        <?php 
          $sponsoredchannels = R::find('sponsoredchannel', '
              WHERE status != :deleted
              ORDER BY status, start_date
            ', array(
              ':deleted' => 3
              )
          );

          foreach($sponsoredchannels as $channel):
            $status_code = statusCodeToText($channel->status, $channel->start_date);
            $video_list = json_decode($channel->video_list);
            if (!$video_list) $video_list = Array();
        ?>
          <div class="well item" data-id="<?php echo $channel->id; ?>">
            <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <b>Title:</b> <?php echo $channel->title; ?>
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <b>Length:</b> <?php echo $channel->start_date; ?> - <?php echo $channel->end_date; ?> 
              </div>
            </div>
            <div class="col-lg-3">
              <div class="vid-thumbnail" style="background-image: url(../<?php echo $channel->image_url; ?> );"></div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-6">
                  <b>Sponsor:</b> <?php echo $channel->sponsor_name; ?>
                </div>

                <div class="col-lg-6">
                  <div class="input-group">
                    <label class="input-group-addon">Status</label>
                    <div class="btn-group">
                      <div class="btn status-btn" data-status="<?php echo $status_code; ?>">
                        <span class="pull-left"><?php echo $status_code; ?></span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Autoplay</label>
                <div class="btn-group">
                  <div class="btn status-btn">
                    <span class="pull-left"><?php echo ($channel->autoplay) ? 'On' : 'Off'; ?></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-lg-offset-2">
              <button class="btn btn-default btn-block btn-edit">Edit</button>
            </div>

          </div>

          <div class="form-group row">
            <div class="col-lg-5">
              <button class="btn btn-default col-lg-4 btn-show-videos">
                <span class="badge pull-right"><?php echo count($video_list); ?></span>
                  Videos
              </button>

              <ol class="videos">
              <?php foreach ($video_list as $video_url) : ?>
                <li>
                  <a href="<?php echo $video_url; ?>" target="_blank"><?php echo $video_url; ?></a>
                </li>
              <?php endforeach; ?>
                  
              </ol>

            </div>
          </div>

        </div>
        <?php endforeach; ?>
      </div> <!-- Channels -->

      <!-- Settings Pane -->
      <div class="tab-pane active" id="admin-settings">
        <h1>Settings</h1>
        <hr />
        <form id="general-settings" action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="type" value="settings" />
          <div class="form-group row">
            <div class="col-lg-4">
              <div class="input-group">
                <label class="input-group-addon">Ads: begin as</label>
                <div class="btn-group">
                  <select name="db_ads_start_at" class="selectpicker">
                  <?php for ($i=1; $i <= 10; $i++) : ?>
                    <option value="<?php echo $i; ?>">Video #<?php echo $i; ?></option>
                  <?php endfor; ?>
                  </select>
                </div>
              </div>
            </div>

            <div class="col-lg-4">
              <div class="input-group">
                <label class="input-group-addon">Ads: display every</label>
                <div class="btn-group">
                  <select name="db_ads_show_every" class="selectpicker">
                  <?php for ($i=1; $i <= 10; $i++) : ?>
                    <option value="<?php echo $i; ?>"><?php echo $i; ?> videos</option>
                  <?php endfor; ?>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-lg-10">
            </div>
            <div class="col-lg-2">
              <button type="submit" class="btn btn-primary btn-block">Save</button>
            </div>

            <div class="col-lg-4">
              <div id="general-settings-message"></div>
            </div>
          </div>
        </form>

        <h3>Default Channels</h3>
        <form id="default-channels" action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="type" value="default-channels" />
          <div class="form-group row control-group">
            <div class="col-lg-6">
              <div class="input-group">
                <input id="default-channel-input" type="text" class="form-control" placeholder="&quot;/r/subreddit&quot; or &quot;/domain/site.com&quot;" pattern="^/(r|domain)/[\w.]+$" />
                <div class="input-group-btn">
                  <div id="add-default-channel" class="btn btn-default" disabled="disabled">Add Channel</div>
                </div><!-- /btn-group -->
              </div><!-- /input-group -->
            </div>

            <div class="col-lg-2">
              <button type="submit" class="btn btn-primary btn-block">Save</button>
            </div>

            <div class="col-lg-4">
              <div id="default-channels-message"></div>
            </div>
          </div>

          <div class="channels clearfix">
            <ul class="list-unstyled">
              <?php
                $settings = R::load('settings', 1);
                $default_channels = json_decode($settings->default_channels);
                foreach ($default_channels as $channel) :
                  $thumb_url = '';
                  $thumb = R::findOne('channel',
                    ' feed = ? LIMIT 1 ', array( $channel->feed )
                  );
                  if ($thumb) $thumb_url = $thumb->thumbnail_url;
              ?>
                  <li class="channel col-lg-3" data-feed="<?php echo $channel->feed; ?>">
                    <div class="thumbnail"<?php if ($thumb_url != '') : ?> style="background-image: url(<?php echo $thumb_url; ?>);"<?php endif; ?>></div>
                    <span class="name" spellcheck="false" contenteditable="true"><?php echo $channel->channel; ?></span>
                  </li>
              <?php endforeach; ?>
            </ul>

            <div id="default-vid-delete" class="delete channel col-lg-3">
                <div class="thumbnail"></div>
                <span class="name">Drag here to delete</span>
            </div>
          </div>

        </form>

        <h3>Recommended Channels</h3>
        <form id="recommended-channels" action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="type" value="recommended-channels" />
          <div class="form-group row control-group">
            <div class="col-lg-6">
              <div class="input-group">
                <input id="recommended-channel-input" type="text" class="form-control" placeholder="&quot;/r/subreddit&quot; or &quot;/domain/site.com&quot;" pattern="^/(r|domain)/[\w.]+$" />
                <div class="input-group-btn">
                  <div id="add-recommended-channel" class="btn btn-default" disabled="disabled">Add Channel</div>
                </div><!-- /btn-group -->
              </div><!-- /input-group -->
            </div>

            <div class="col-lg-2">
              <button type="submit" class="btn btn-primary btn-block">Save</button>
            </div>

            <div class="col-lg-4">
              <div id="recommended-channels-message"></div>
            </div>
          </div>

          <div class="channels clearfix">
            <ul class="list-unstyled">
              <?php
                $recommended_channels = json_decode($settings->recommended_channels);
                foreach ($recommended_channels as $channel) :
                  $thumb_url = '';
                  $thumb = R::findOne('channel',
                    ' feed = ? LIMIT 1 ', array( $channel->feed )
                  );
                  if ($thumb) $thumb_url = $thumb->thumbnail_url;
              ?>
                  <li class="channel col-lg-3" data-feed="<?php echo $channel->feed; ?>">
                    <div class="thumbnail"<?php if ($thumb_url != '') : ?> style="background-image: url(<?php echo $thumb_url; ?>);"<?php endif; ?>></div>
                    <span class="name" spellcheck="false" contenteditable="true"><?php echo $channel->channel; ?></span>
                  </li>
              <?php endforeach; ?>
            </ul>

            <div id="recommended-vid-delete" class="delete channel col-lg-3">
                <div class="thumbnail"></div>
                <span class="name">Drag here to delete</span>
            </div>
          </div>

        </form>
      </div> <!-- Settings -->

    </div>
  </div><!-- /.container -->
</body>
</html>