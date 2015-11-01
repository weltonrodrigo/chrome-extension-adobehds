window.addEventListener ("load", myMain, false);

function myMain (evt) {


	console.log('Starting play');

	setTimeout(
		function(){
			document.getElementById("playButton").click();
		}
		, 5000);
}


var playerURL = "http://player.sambatech.com.br/v3/swf/samba.player.akamai.swf"