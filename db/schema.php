<?php 
/* Defines the schema for the admin interface */

include_once('config.php');

/* 	Sponsored videos
	Individual videos that appear between normal playing videos */
$sponsored_video = R::dispense('sponsoredvideo');
	$sponsored_video->created_on = '0000-00-00 00:00:00';		// datetime created in database
	$sponsored_video->updated_on = '0000-00-00 00:00:00';		// datetime updated in database
	$sponsored_video->start_date = '0000-00-00 00:00:00';		// datetime campaign begins
	$sponsored_video->end_date = '0000-00-00 00:00:00';			// datetime campaign ends
	$sponsored_video->status = 0;							    // integer 0 = 'draft' | 1 = 'ready' / 'active' | 2 = 'ended' | 3 = 'deleted'
	$sponsored_video->video_url = null;							// string location of video
	$sponsored_video->video_embed_code = null;					// string video embed code
	$sponsored_video->thumbnail_url = null;						// string thumbnail URL
	$sponsored_video->sponsor_name = null;						// string sponsor name
	$sponsored_video->title = null;								// string title (optional)
	$sponsored_video->view_count = null;						// integer number of times viewed
	$sponsored_video->view_target = null;						// integer goal for final view count
	$sponsored_video->skip_count = null;						// integer number of times skipped
	$sponsored_video->cpm = null;								// float dollar value for CPM (optional)

$sponsored_video_id = R::store($sponsored_video);


/* 	Sponsored skins
	Images that can replace UI areas on the site */
$sponsored_skin = R::dispense('sponsoredskin');
	$sponsored_skin->created_on = '0000-00-00 00:00:00';		// datetime created in database
	$sponsored_skin->updated_on = '0000-00-00 00:00:00';		// datetime updated in database
	$sponsored_skin->start_date = '0000-00-00 00:00:00';		// datetime campaign begins
	$sponsored_skin->end_date = '0000-00-00 00:00:00';			// datetime campaign ends
	$sponsored_skin->status = 0;							    // integer 0 = 'draft' | 1 = 'ready' / 'active' | 2 = 'ended' | 3 = 'deleted'
	$sponsored_skin->position = null;							// string location of placement TODO: name placements ''
	$sponsored_skin->creative_url = null;						// string image URL for creative
	$sponsored_skin->sponsor_name = null;						// string sponsor name
	$sponsored_skin->title = null;								// string title (optional)
	$sponsored_skin->view_count = null;							// integer number of times viewed
	$sponsored_skin->view_target = null;						// integer goal for final view count
	$sponsored_skin->cpm = null;								// float dollar value for CPM (optional)

$sponsored_skin_id = R::store($sponsored_skin);


/* 	Sponsored channels
	Channels of videos to be shown on the site */
$sponsored_channel = R::dispense('sponsoredchannel');
	$sponsored_channel->created_on = '0000-00-00 00:00:00';		// datetime created in database
	$sponsored_channel->updated_on = '0000-00-00 00:00:00';		// datetime updated in database
	$sponsored_channel->start_date = '0000-00-00 00:00:00';		// datetime campaign begins
	$sponsored_channel->end_date = '0000-00-00 00:00:00';		// datetime campaign ends
	$sponsored_channel->status = 0;							    // integer 0 = 'draft' | 1 = 'ready' / 'active' | 2 = 'ended' | 3 = 'deleted'
	$sponsored_channel->sponsor_name = null;					// string sponsor name
	$sponsored_channel->title = null;							// string title (optional)
	$sponsored_channel->autoplay = null;						// boolean autoplay videos
	$sponsored_channel->video_list = null;						// string JSON representation of videos in channel
	$sponsored_channel->view_count = null;						// integer total count of views
	$sponsored_channel->view_target = null;						// integer number of times viewed
	$sponsored_channel->skip_count = null;						// integer number of times skipped

$sponsored_channel_id = R::store($sponsored_channel);


/* 	Channels 
	Statistics and meta information for normal Reddit.tv channels */
$channel = R::dispense('channel');
	$channel->created_on = '0000-00-00 00:00:00';				// datetime created in database
	$channel->updated_on = '0000-00-00 00:00:00';				// datetime updated in database
	$channel->title = null;										// string title of channel
	$channel->feed = null;										// string feed for channel
	$channel->thumbnail_url = null;								// string thumbnail URL
	$channel->view_count = null;								// integer total count of videos viewed
	$channel->skip_count = null;								// integer total count of videos skipped

$channel_id = R::store($channel);


// Wipe all tables from null data
$tables = Array(
	'sponsoredvideo',
	'sponsoredskin',
	'sponsoredchannel',
	'channel',
);

foreach ($tables as $table) {
	$sql = 'DELETE FROM ' . $table;
	R::exec($sql);
}

?>