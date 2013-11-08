function videoListCloseTimeout(){
	// console.log('[videoListMouse] '+videoListMouse);
	if(videoListMouse == false) {
		closeVideoList();
	}
}

function videoListOpenTimeout(){
	// console.log('[videoListMouse] '+videoListMouse);
	if(videoListMouse == true) {
		openVideoList();
	}
}

$(document).ready(function(){
	$('header').mouseenter(function(){
		// consoleLog('enter header');
		videoListMouse = true;
		setTimeout('videoListOpenTimeout();', 500);
	});
	$('#video-list').mouseenter(function(){
		// consoleLog('enter video list');
		videoListMouse = true;
		openVideoList();
	});
	$('#settings').mouseenter(function(){
		// console.log('enter settings')
		videoListMouse = false;
	});
	$('header').mouseleave(function(){
		// console.log('exit header')
		videoListMouse = false;
		setTimeout('videoListCloseTimeout()', 1000);
	});
	$('#video-list').mouseleave(function(){
		// console.log('exit video list')
		videoListMouse = false;
		setTimeout('videoListCloseTimeout()', 1000);
	});
});
