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
        colourMeBlack();
        document.removeEventListener("click", searchBox);
    } 
}
var backColor="#111111";
var frontColor="#999999";
var strongColor="#116633";
var strangerColor="#880909";
function colourMeBlack(){
    var head = document.getElementById("header");
    head.style.backgroundColor=backColor;
    var headimg = document.getElementById("tagline").getElementsByTagName("img")[0];
    document.getElementById("tagline").removeChild(headimg);
    head=document.getElementsByTagName("body")[0];
    head.style.backgroundColor=backColor;
    periodicCheck();
}
function colorChat(){
    var element = document.getElementsByClassName("logwrapper")[0];
    if(element.style.backgroundColor!=backColor){
        colorElement(element,frontColor,backColor);
        element = document.getElementsByClassName("sendbtn")[0]
        colorElement(element,frontColor,backColor);
        element= document.getElementsByClassName("disconnectbtn")[0];
        colorElement(element,frontColor,backColor);
        element= document.getElementsByClassName("chatmsg")[0];
        colorElement(element,frontColor,backColor);
        element= document.getElementsByClassName("chatmsgwrapper")[0];
        colorElement(element,frontColor,backColor);
    }
}
function colorElement(element,front,back){
    element.style.backgroundColor=back;
    element.style.color=front;
}
var lastcheck=0;
var periodicTime=300;
function periodicCheck(){
    colorChat();
    var current=document.getElementsByClassName("msgsource");
    if(lastcheck!=current.length){
        var diff=current.length-lastcheck;
        console.log("found change "+lastcheck);
        for(var i=lastcheck;i<current.length;i++){
            current[i].color=strongColor;
            var curr=current[i].parentNode.parentNode;
            curr.style.color=frontColor;
            var bold=curr.getElementsByClassName("strangermsg")[0];
            if(bold!=undefined){
                bold.getElementsByClassName("msgsource")[0].style.color=strangerColor;
            }
            bold=curr.getElementsByClassName("youmsg")[0];
            if(bold!=undefined){
                bold.getElementsByClassName("msgsource")[0].style.color=strongColor;
            }
            var newChat=curr.getElementsByClassName("newchatbtnwrapper")[0];
            if(newChat!=undefined){
                newChat.parentNode.removeChild(newChat);
            }
            //"msgsource"
            //"strangermsg"
            //"youmsg"
        }
        lastcheck=current.length;
    }
    window.setTimeout(function(){periodicCheck()}, periodicTime);
}
var dissText="Goodbye.";
//triggers when a key is pressed anywhere in the window
var waiting=true;
function keyDownTextField(e) {
    var keyCode = e.keyCode;
    var evtobj = window.event? event : e;
    //currently ctrl+q disconnects and finds new chat after leaving a message.
    if (evtobj.keyCode == 81 && evtobj.ctrlKey&&waiting){
        waiting=false; 
        console.log("made it false "+waiting);
        var t= document.getElementsByClassName("chatmsg")[0].value=dissText;
        var z = document.getElementsByClassName("sendbtn")[0];
        z.click();
        window.setTimeout(function(){myDisconnect()}, 500);
        console.log("started waiting");
    }
}
function myDisconnect(){
    var disconnectButton = document.getElementsByClassName("disconnectbtn")[0];
    disconnectButton.click();
    disconnectButton.click();
    disconnectButton.click();
    waiting=true;
    console.log("made it true "+waiting);
}
document.addEventListener("keydown", keyDownTextField, false);
document.addEventListener("click",searchBox,false);
//console.log("poo");