// ==UserScript==
// @name         OmegleScript
// @namespace    http://your.homepage/
// @version      0.1
// @description  Various functionality for Omegle. To use with tampermonkey but any javascript addon works, probably.
// @author       You
// @match        http://www.omegle.com/
// @grant        none
// ==/UserScript==
//useful stuff
//disconnectbtn 
//logbox
//chatmsg
//sendbtn

var logBox;

//placeholder
function logEvent(e){
    console.log("log changed!");
}
//used to find HTML element where the chat log is held
function searchBox(){
    console.log("searching");
    if(logBox==undefined){
		logBox = document.getElementsByClassName("logbox")[0];
		//logBox.addEventListener("change", logEvent,false); //need to find actual event that triggers when a HTML element changes
        console.log("found it");
        document.removeEventListener("click", searchBox);
    } 
}

var dissText="Nope.";
//triggers when a key is pressed anywhere in the window
function keyDownTextField(e) {
    var keyCode = e.keyCode;
    var evtobj = window.event? event : e
	//currently ctrl+q disconnects and finds new chat after leaving a message.
    if (evtobj.keyCode == 81 && evtobj.ctrlKey){
        var t= document.getElementsByClassName("chatmsg")[0].value=dissText;
        var z = document.getElementsByClassName("sendbtn")[0];
        z.click();
        window.setTimeout(function(){disconnect()}, 500);
        console.log("started waiting");
    }
}
function disconnect(){
    var disconnectButton = document.getElementsByClassName("disconnectbtn")[0];
    disconnectButton.click();
    disconnectButton.click();
    disconnectButton.click();
}
document.addEventListener("keydown", keyDownTextField, false);
document.addEventListener("click",searchBox,false);