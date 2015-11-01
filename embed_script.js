window.addEventListener ("load", myMain, false);

function myMain (evt) {
	console.log('Starting play');

	setTimeout(
		function(){
			document.getElementById("playButton").click()
		}
		, 5000);
}
