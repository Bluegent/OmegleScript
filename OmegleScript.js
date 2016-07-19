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
function getTimeStamp(){
    var d = new Date();
    var str = "";
    if(d.getHours()<10)
        str+="0";
    str+=d.getHours()+":";
    if(d.getMinutes()<10)
        str+="0";
    str+=d.getMinutes()+":";
    if(d.getSeconds()<10)
        str+="0";
    str+=d.getSeconds();
    return "["+str+"]";
}
var shit = "Omegle couldn't find anyone who shares interests with you, so this stranger is completely random. Try adding more interests!"
var logBox;
//placeholder
//used to find HTML element where the chat log is held
function searchBox(){
    logBox = document.getElementsByClassName("logbox")[0];
    if(logBox==undefined){
        return;
    }else{
        colourMeBlack();
        document.removeEventListener("click", searchBox);
    } 
}
var backColor="#111111";
var frontColor="#AAAAAA";
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
    var stat = document.getElementsByClassName("statuslog");
    for(var i=0;i<stat.length;++i){
        if(stat[i]!=undefined && stat[i].innerHTML==shit)
            myDisconnect();
    }
    if(lastcheck!=current.length){
        var diff=current.length-lastcheck;
        for(var i=lastcheck;i<current.length;i++){
            current[i].color=strongColor;
            //current[i].innerHTML = getTimeStamp()+" "+current[i].innerHTML;
            var msg = current[i].parentElement;
            msg.innerHTML ="<span>"+getTimeStamp()+" </span>"+ msg.innerHTML;
            var curr=current[i].parentNode.parentNode;
            curr.style.color=frontColor;
           // console.log("Current inner:"+curr.innerHTML);
            var bold=curr.getElementsByClassName("strangermsg")[0];
            if(bold!=undefined){
                //console.log("bold inner for stranger= "+bold.innerHTML);
                bold.getElementsByClassName("msgsource")[0].style.color=strangerColor;
            }
            bold=curr.getElementsByClassName("youmsg")[0];
            if(bold!=undefined){
                // console.log("bold inner for youmsg= "+bold.innerHTML);
                bold.getElementsByClassName("msgsource")[0].style.color=strongColor;
            }
            //"msgsource"
            //"strangermsg"
            //"youmsg"
        }
        lastcheck=current.length;
    }
    window.setTimeout(function(){periodicCheck()}, periodicTime);
}
var dissText="";
//triggers when a key is pressed anywhere in the window
var waiting=true;
function keyDownTextField(e) {
    var keyCode = e.keyCode;
    var evtobj = window.event? event : e;
    //currently ctrl+q disconnects and finds new chat after leaving a message.
    if (evtobj.keyCode == 81 && evtobj.ctrlKey&&waiting){
        waiting=false; 
        sendMessage(dissText);
        window.setTimeout(function(){myDisconnect()}, 500);
    }
    if (evtobj.keyCode == 81 && evtobj.altKey&&waiting){
        waiting=false; 
        sendMessage(greetText);
        window.setTimeout(function(){resetWait()}, 500);
    }
}
function resetWait(){
    waiting=true;
}
function myDisconnect(){
    var disconnectButton = document.getElementsByClassName("disconnectbtn")[0];
    disconnectButton.click();
    disconnectButton.click();
    disconnectButton.click();
    waiting=true;
}
document.addEventListener("keydown", keyDownTextField, false);
document.addEventListener("click",searchBox,false);
var greetText="If you're going to ask \"How are you?\", \"Where are you from\", \"What's your name?\" or \"What do you do?\" you might as well disconnect right now.";
function sendMessage(message){
    var t= document.getElementsByClassName("chatmsg")[0].value=message;
    var z = document.getElementsByClassName("sendbtn")[0];
    //z.click();
}
