// if(window.location.host.match('reddit.tv')){
  consoleLog('Loading analytics ..');
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-12131688-3']);
  _gaq.push(['_trackPageview']);

  (function() {
    consoleLog('Injecting GA ..');
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
// }else{
//   consoleLog('Analytics not loaded.');
// }