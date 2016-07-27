// ==UserScript==
// @name         OmegleScript
// @namespace    http://your.homepage/
// @version      0.1
// @description  Various functionality for Omegle. To use with tampermonkey but any javascript addon works, probably.
// @author       You
// @match        http://www.omegle.com/
// @grant        none
// ==/UserScript==

//Instructions:
// ctrl + q - auto disconnect and find new chat
// alt + q - paste specific text in box 
// script automatically disconnects on no interests and a list of phrases by default, can be set below

//set to false if you don't want to auto disconnect on no interest matches
var disconnectOnEmpty = true;
//henceforth referred as 'x'
var messagesChecked = 5;
//set to false if you don't want to auto disconnect on lack of capitalisation and punctuation(within first x messages)
var disconnectOnNoCaps = true;
//set to false if you don't want to disconnect on certain phrases(within first x messages)
var disconnectOnMessage = true;
//list of phrases to auto disconnect on, feel free to add more
var phrasesThatTriggerForth = ['asl','m','m or f',"what's your name?",'what is your name?','asl?','asl.','m?','f?','m.','f.'];
//amount in ms between two checks, set to lower if you dislike timestamp popping, too low values will affect performance
var periodicTime = 300;
//colour for background
var backColor = '#111111';
//colour for all text
var frontColor = '#AAAAAA';
//colour for 'You:' 
var youColor = '#116633';
//colour for 'Stranger:'
var strangerColor = '#880909';
//alt + q message
var greetText = "Hi, I'm a jackass and I forgot to configure my script thing.";

//don't touch
var lastcheck = 0;
var lastStatCheck = 0;
var logBox;
var shit = 'Omegle couldn\'t find anyone who shares interests with you, so this stranger is completely random. Try adding more interests!';
var typingText = 'Stranger is typing...';
var waiting = true;
//or do touch them but it might break everything ¯\_(ツ)_/¯

function getTimeStamp() {
  var d = new Date();
  var str = '';
  if (d.getHours() < 10)
  str += '0';
  str += d.getHours() + ':';
  if (d.getMinutes() < 10)
  str += '0';
  str += d.getMinutes() + ':';
  if (d.getSeconds() < 10)
  str += '0';
  str += d.getSeconds();
  return '[' + str + ']';
}

//used to find HTML element where the chat log is held
function searchBox() {
  logBox = document.getElementsByClassName('logbox') [0];
  if (logBox === undefined) {
    return;
  } else {
    colourMeBlack();
    document.removeEventListener('click', searchBox);
  }
}

function colourMeBlack() {
  var head = document.getElementById('header');
  head.style.backgroundColor = backColor;
  var headimg = document.getElementById('tagline').getElementsByTagName('img') [0];
  document.getElementById('tagline').removeChild(headimg);
  head = document.getElementsByTagName('body') [0];
  head.style.backgroundColor = backColor;
  periodicCheck();
}

function colorChat() {
  var element = document.getElementsByClassName('logwrapper') [0];
  if (element.style.backgroundColor != backColor) {
    colorElement(element, frontColor, backColor);
    element = document.getElementsByClassName('sendbtn') [0]
    colorElement(element, frontColor, backColor);
    element = document.getElementsByClassName('disconnectbtn') [0];
    colorElement(element, frontColor, backColor);
    element = document.getElementsByClassName('chatmsg') [0];
    colorElement(element, frontColor, backColor);
    element = document.getElementsByClassName('chatmsgwrapper') [0];
    colorElement(element, frontColor, backColor);
  }
}

function colorElement(element, front, back) {
  element.style.backgroundColor = back;
  element.style.color = front;
}

function resetThings() {
  lastcheck = 0;
  lastStatCheck = 0;
}

function checkStatusMsg() {
  var stat = document.getElementsByClassName('statuslog');
  if (lastStatCheck != stat.length) {
    for (var i = lastStatCheck; i < stat.length; ++i) {
      if (stat[i] != undefined && stat[i].innerHTML == shit && disconnectOnEmpty)  {
        myDisconnect();
        break;
      } 
      else if (stat[i] != undefined && stat[i].innerHTML.startsWith('<div class="newchatbtnwrapper">')) {
      } 
      else if (stat[i] != undefined && stat[i].innerHTML == typingText) {
      } 
      else {
        stat[i].innerHTML = getTimeStamp() + ' ' + stat[i].innerHTML;
      }
    }
  }
  lastStatCheck = stat.length;
}

//"msgsource"
//"strangermsg"
//"youmsg
function checkMsg() {
  var current = document.getElementsByClassName('msgsource');
  if (lastcheck != current.length) {
    var diff = current.length - lastcheck;
    for (var i = lastcheck; i < current.length; i++) {
      //current[i].color = youColor;
      var curr = current[i].parentNode.parentNode;
      curr.style.color = frontColor;
      var bold = curr.getElementsByClassName('strangermsg') [0];
      if (bold != undefined) {
        bold.getElementsByClassName('msgsource') [0].style.color = strangerColor;
        var strangerMsgNum = document.getElementsByClassName('strangermsg').length;
        if(strangerMsgNum<=messagesChecked && disconnectOnMessage){
          var msg = bold.getElementsByTagName('span');
          var amsg = msg[msg.length-1].innerHTML.trim();
          //console.log(amsg);
          if(disconnectOnNoCaps){
            if(!(amsg[0]>='A' && amsg[0]<='Z')){
              myDisconnect();
              return;
            }
            if(!(amsg[amsg.length-1] in ['.','!','?'])){
              myDisconnect();
              return;
            }
          }
          amsg = amsg.toLowerCase();
          //console.log("["+amsg+"]");
          for(var j=0;j<phrasesThatTriggerForth.length;++j){
            if(amsg == phrasesThatTriggerForth[j]){
              myDisconnect();
              return;
            }
          }
        }
      }
      bold = curr.getElementsByClassName('youmsg') [0];
      if (bold != undefined) {
        bold.getElementsByClassName('msgsource') [0].style.color = youColor;
      }
      var msg = current[i].parentElement;
      msg.innerHTML = '<span>' + getTimeStamp() + ' </span>' + msg.innerHTML;
    }
    lastcheck = current.length;
  }
}

function periodicCheck() {
  colorChat();
  checkStatusMsg();
  checkMsg();
  window.setTimeout(function () {
    periodicCheck()
  }, periodicTime);
}

//triggers when a key is pressed anywhere in the window
function keyDownTextField(e) {
  var keyCode = e.keyCode;
  var evtobj = window.event ? event : e;
  //currently ctrl+q disconnects and finds new chat after leaving a message.
  if (evtobj.keyCode == 81 && evtobj.ctrlKey && waiting) {
    waiting = false;
    sendMessage(dissText);
    window.setTimeout(function () {
      myDisconnect()
    }, 500);
  }
  if (evtobj.keyCode == 81 && evtobj.altKey && waiting) {
    waiting = false;
    sendMessage(greetText);
    window.setTimeout(function () {
      resetWait()
    }, 500);
  }
}
function resetWait() {
  waiting = true;
}

function myDisconnect() {
  var disconnectButton = document.getElementsByClassName('disconnectbtn') [0];
  disconnectButton.click();
  disconnectButton.click();
  disconnectButton.click();
  resetThings();
  waiting = true;
}

document.addEventListener('keydown', keyDownTextField, false);
document.addEventListener('click', searchBox, false);

function sendMessage(message) {
  var t = document.getElementsByClassName('chatmsg') [0].value = message;
  var z = document.getElementsByClassName('sendbtn') [0];
}

//useful stuff
//disconnectbtn 
//logbox
//chatmsg
//sendbtn
