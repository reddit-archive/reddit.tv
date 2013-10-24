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
            <li class="active"><a href="#videos" data-toggle="tab">Videos</a></li>
            <li><a href="#skins" data-toggle="tab">Skins</a></li>
            <li><a href="#channels" data-toggle="tab">Channels</a></li>
          </ul>
        </div>
      </div>
    </div> <!-- /#header -->
  </header>

  <div class="container">
    <div id='content' class="tab-content">
      <div class="tab-pane active" id="videos">
        <h1>Sponsored Videos</h1>

        <form action="" enctype="multipart/form-data" method="post" class="well form-horizontal" role="form">
          <input type="hidden" name="function" value="videoAdd" />
          <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" name="sponsor_name" id="inputSponsor1" placeholder="Sponsor Name" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <input type="hidden" name="start_date" id="video_start_date" value="" />
                <input type="hidden" name="end_date" id="video_end_date" value="" />
                <label class="input-group-addon" for="campaign-length">Length</label>
                <input id="campaign-length" type="text" class="form-control" />
              </div>
                  <!-- <span class="add-on"><i class="icon-calendar"></i></span><input type="text" name="reservation" id="reservation" /> -->
            </div>
            <div class="col-lg-2">
              <div id="video-thumbnail" class="upload thumbnail">
                <span class="text">Video Thumbnail</span>
                <input id="video-thumbnail-input" class="btn-default" type="file" title="Upload" />
              </div>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-lg-5">
              <div class="input-group">
                <input type="text" class="form-control" name="video_url" id="inputVideoURL" placeholder="URL" />
                <div class="input-group-btn">
                  <button type="button" class="btn-embed-code btn btn-default dropdown-toggle">Embed Code&nbsp;&nbsp;&nbsp;<span class="caret"></span></button>
                  <ul class="dropdown-menu pull-right embed-code">
                    <li><textarea name="video_embed_code" id="embed-code" class="form-control" rows="3"></textarea></li>
                  </ul>
                </div><!-- /btn-group -->
              </div><!-- /input-group -->
            </div>

            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Status</label>
                <div class="btn-group">
                  <select name="status" class="selectpicker" data-style="btn-success">
                    <option value="ready" class="success">Ready</option>
                    <option value="draft" class="primary">Draft</option>
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
          $sponsoredvideos = R::find('sponsoredvideo');

          foreach($sponsoredvideos as $video):
        ?>
          <div class="well">
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
                <div class="thumbnail" style="background-image: url(<?php echo $video->thumbnail_url; ?>);"></div>
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
                    <div class="btn status-btn" data-status="<?php echo $video->status; ?>">
                      <span class="pull-left"><?php echo ucfirst($video->status); ?></span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-2 col-lg-offset-2">
                <button  class="btn btn-default btn-block">Edit</button>
              </div>

            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <div class="tab-pane" id="skins">
        <h1>Sponsored Skins</h1>

        <form class="well form-horizontal" role="form">
          <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" id="inputTitle1" placeholder="Campaign Title" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon" for="campaign-length">Length</label>
                <input id="campaign-length" type="text" class="form-control" />
              </div>
                  <!-- <span class="add-on"><i class="icon-calendar"></i></span><input type="text" name="reservation" id="reservation" /> -->
            </div>
            <div class="col-lg-2">
              <div id="skin-thumbnail" class="upload thumbnail">
                <span class="text">Skin Image</span>
                <input id="skin-thumbnail-input" class="btn-default" type="file" title="Upload" />
              </div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-6">
                  <input type="text" class="form-control" id="inputSponsor1" placeholder="Sponsor Name" />
                </div>

                <div class="col-lg-6">
                  <div class="input-group">
                    <label class="input-group-addon">Status</label>
                    <div class="btn-group">
                      <select name="status" class="selectpicker" data-style="btn-success">
                        <option value="ready" class="success">Ready</option>
                        <option value="draft" class="primary">Draft</option>
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
                  <select name="position" class="selectpicker placement">
                    <option value="geader">Header Background</option>
                    <option value="video" selected="selected">Video Background</option>
                    <option value="channel">Channel Background</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-lg-offset-2">
              <button type="submit" class="btn btn-primary btn-block">Add Skin</button>
            </div>

          </div>
        </form>

        <h2>Campaigns</h2>
        <?php 
          $sponsoredskins = R::find('sponsoredskin');

          foreach($sponsoredskins as $skin):
        ?>
          <div class="well">
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
                  <!-- <span class="add-on"><i class="icon-calendar"></i></span><input type="text" name="reservation" id="reservation" /> -->
            </div>
            <div class="col-lg-3">
              <div class="thumbnail" style="background-image: url(<?php echo $skin->creative_url; ?> );"></div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-6">
                  <b>Sponsor:</b><?php echo $skin->sponsorname; ?>
                </div>
                <div class="col-lg-6">
                  <div class="input-group">
                    <label class="input-group-addon">Status</label>
                    <div class="btn-group">
                      <div class="btn status-btn" data-status="<?php echo $skin->status; ?>">
                        <span class="pull-left"><?php echo ucfirst($skin->status); ?></span>
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
                  <button type="button" class="btn btn-default dropdown-toggle status-btn" data-toggle="dropdown">
                    <span class="pull-left"><span><?php echo ucfirst($skin->position); ?></span></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        <?php endforeach; ?>
      </div>
      <div class="tab-pane" id="channels">
        <h1>Sponsored Channels</h1>

        <form class="well form-horizontal" role="form">
          <div class="form-group row">
            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" id="inputTitle1" placeholder="Campaign Title" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon" for="campaign-length">Length</label>
                <input id="campaign-length" type="text" class="form-control" />
              </div>
                  <!-- <span class="add-on"><i class="icon-calendar"></i></span><input type="text" name="reservation" id="reservation" /> -->
            </div>
            <div class="col-lg-2">
              <div id="channel-thumbnail" class="upload thumbnail">
                <span class="text">Channel Thumbnail</span>
                <input id="channel-thumbnail-input" class="btn-default" type="file" title="Upload" />
              </div>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-lg-5">
              <div class="row">
                <div class="col-lg-12">
                  <input type="text" class="form-control" id="inputSponsor1" placeholder="Sponsor Name" />
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="input-group">
                <label class="input-group-addon">Status</label>
                <div class="btn-group">
                  <button type="button" class="btn btn-success dropdown-toggle status-btn" data-toggle="dropdown">
                    <span class="pull-left"><span>Ready</span></span> <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu pull-right" role="menu">
                    <li><a href="#">Ready</a></li>
                    <li><a href="#">Draft</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div><!-- /.container -->
</body>
</html>