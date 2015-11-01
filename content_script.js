window.addEventListener ("load", myMain, false);

function myMain (evt) {
    var disciplina = $('.titulo_aula h3').text().trim();
    var aula = $('.titulo_aula h2').text().trim();

    chrome.runtime.sendMessage({'disciplina': disciplina, "aula": aula})
}