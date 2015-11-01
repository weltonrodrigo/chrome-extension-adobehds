window.addEventListener ("load", myMain, false);


var disciplina;
var aula;
var nextAula;

function myMain (evt) {
    var disciplina = $('.titulo_aula h3').text().trim();
    var aula = $('.titulo_aula h2').text().trim();
    var nextAula = getNextAula();

    // Give background script a hint that we are here.
    chrome.runtime.sendMessage(
    	{ 
    		command: "register",
    		aula: aula,
    		disciplina: disciplina,
    		nextAula: nextAula
    	},
    	function(response){
    		console.log(response);
    	});

}

function getNextAula(){
	if( $(".avancar_aula").length ){
		return $(".avancar_aula a")[0].href;
	}else{
		return undefined;
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    switch(request.command){
        case "get_details":
    		sendResponse({'disciplina': disciplina, "aula": aula, "nextAula": nextAula});
    		break;
		case "change_url":
			console.log("Going to " + request.url);
			document.location.url = request.url;
			break;
		case "log":
			console.log(request.message);
    }

  });