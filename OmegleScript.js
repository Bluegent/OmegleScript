// ==UserScript==
// @name         OmegleScript
// @namespace    http://your.homepage/
// @version      0.1
// @description  Various functionality for Omegle. To use with tampermonkey but any javascript addon works, probably.
// @author       You
// @match        http://www.omegle.com/
// @grant        none
// ==/UserScript==

// Features: white text on black background theme for late night use, one button disconnect(ctrl+Q), clickable links, possibility to disconnect automatically on: completetly random strangers(no interests), bad typing (no capitals and punctuation), filter matches( currently messages that contain 'asl' and text similar to '16 f cali' are filtered) and exact matches of a phrase(like those people that always start with 'm' or bots with a specific start phrase), all within a configurable number of lines.
// The auto disconnects have small checkboxes on the main site(no persistence) but should be configured by setting the attributes below to true/false.
// Other variables can also be configured like the first x messages to be checked for disconnection etc.
//Instructions:
// ctrl + q - auto disconnect and find new chat
// alt + q - paste specific text in box
// script automatically disconnects on no interests and a list of phrases by default, can be set below
//set to false if you don't want to auto disconnect on no interest matches
var disconnectOnEmpty = true;
//henceforth referred as 'x'
var messagesChecked = 5;
//
var autoGreet = true;
//
var greetings = ['Hey.','Hey there.','Hello there.','Hello.','Howdy.','Hi.','Hi there.','Ahoy.','Aye.','Greetings.'];
//set to false if you don't want to auto disconnect on lack of capitalisation and punctuation(within first x messages)
var disconnectOnNoCaps = true;
//set to false if you don't want to disconnect on certain phrases(within first x messages)
var disconnectOnMessage = true;
//set to false if you don't want to disconnect on regex filters
var disconnectOnFilter = true;
//set to true if you want to search for a new conversation after a stranger disconnects within the first x lines
var reconnectAfter = true;
//list of phrases to auto disconnect on, feel free to add more
var phrasesThatTriggerForth = [
    'whats your name?',
    'whats your name',
    'm r f?',
    'm r f',
    'm',
    'm or f',
    'what\'s your name?',
    'what is your name?',
    'asl?',
    'asl.',
    'm?',
    'f?',
    'm.',
    'f.',
    'what\'s your name, stranger?',
    'how large is your penis?'
];
//amount in ms between two checks, set to lower if you dislike timestamp popping, too low values will affect performance
var periodicTime = 300;
//amount of delay in ms before a timed disconnect
var disconnectDelay = 3000;
//colour for background
var backColor = '#111111';
//colour for all text
var frontColor = '#AAAAAA';
//colour for 'You:'
var youColor = '#116633';
//colour for 'Stranger:'
var strangerColor = '#880909';
//alt + q message
var greetText = 'Hi, I\'m a jackass and I forgot to configure my script thing.';
//patterns for filtering, edit them if you know regex or remove an entry if you don't wish to use it
var filterPats = [
    /([^a-z]|^)asl([^a-z]|$)/i, //filters away messages containing the phrase 'asl' if it's not surrounded by " or '
    /([^a-z]|^)[0-9]{1,3}[\s\/]?(m|f|male|female)([^a-z]|$)/i, //filters away messages of the '20 m' / '12 f cali' type
    /([^a-z]|^)(m|f|male|female)[\s\/]?[0-9]{1,3}([^a-z]|$)/i, // same as above but m 20
];
//don't touch
var inConvo = false;
var lastcheck = 0;
var lastStatCheck = 0;
var logBox;
var debug = true;
var shit = 'Omegle couldn\'t find anyone who shares interests with you, so this stranger is completely random. Try adding more interests!';
var typingText = 'Stranger is typing...';
var waiting = true;
var timed = true;
var time;
var properGPats = [
    /[\*\-].*[\*\-]/,
    /[A-Z].*[~.;,!?:]/g
];
//or do touch them but it might break everything ¯\_(ツ)_/¯
//here be functions, ye of little programming knowledge steer away
function resetThings() {
    lastcheck = 0;
    lastStatCheck = 0;
    timed = true;
    waiting = true;
}
function log(str) {
    if (debug)
        console.log(str);
}
function myDisconnect() {
    window.clearTimeout(time);
    var disconnectButton = document.getElementsByClassName('disconnectbtn') [0];
    disconnectButton.click();
    disconnectButton.click();
    disconnectButton.click();
    resetThings();
    waiting = true;
}
function timedDisconnect() {
    log('timed disconnect');
    inConvo=false;
    if (timed) {
        timed = false;
        time = window.setTimeout(function () {
            myDisconnect();
        }, disconnectDelay);
    }
}
function setControl(num) {
    switch (num) {
        case 0:
            disconnectOnEmpty = !disconnectOnEmpty;
            break;
        case 1:
            disconnectOnNoCaps = !disconnectOnNoCaps;
            break;
        case 2:
            disconnectOnMessage = !disconnectOnMessage;
            break;
        case 3:
            disconnectOnFilter = !disconnectOnFilter;
            break;
        case 4:
            reconnectAfter = !reconnectAfter;
            break;
        default:
            break;
    }
}
var controls = [
    'donnointerests',
    'donbadtyping',
    'donmessage',
    'donfilter',
    'ronleave'
];
function insertControls() {
    var header = document.getElementById('header');
    var someHTML = '<div style="color:white;float:left;font-size:65%;">';
    someHTML += '<input type="checkbox" id="' + controls[0] + '"' + (disconnectOnEmpty ? ' checked' : '') + '>DOnNoInterests';
    someHTML += '<input type="checkbox" id="' + controls[1] + '"' + (disconnectOnNoCaps ? ' checked' : '') + '>DOnBadTyping';
    someHTML += '<input type="checkbox" id="' + controls[2] + '"' + (disconnectOnMessage ? ' checked' : '') + '>DOnMessage';
    someHTML += '<input type="checkbox" id="' + controls[3] + '"' + (disconnectOnFilter ? ' checked' : '') + '>DOnFilter';
    someHTML += '<input type="checkbox" id="' + controls[4] + '"' + (reconnectAfter ? ' checked' : '') + '>ROnLeave';
    someHTML += '</div>';
    header.innerHTML += someHTML;
    document.getElementById(controls[0]).addEventListener('click', function () {
        setControl(0);
    });
    document.getElementById(controls[1]).addEventListener('click', function () {
        setControl(1);
    });
    document.getElementById(controls[2]).addEventListener('click', function () {
        setControl(2);
    });
    document.getElementById(controls[3]).addEventListener('click', function () {
        setControl(3);
    });
    document.getElementById(controls[4]).addEventListener('click', function () {
        setControl(4);
    });
    var logo = document.getElementById('logo');
    logo.style = 'z-index:-1;position:relative;';
}
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
} //used to find HTML element where the chat log is held

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
    var css = 'a:link{color:#DDDDDD} a:visited{color:#777777}';
    style = document.createElement('style');
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head') [0].appendChild(style);
    insertControls();
    periodicCheck();
}
function colorChat() {
    var element = document.getElementsByClassName('logwrapper') [0];
    if (element.style.backgroundColor != backColor) {
        colorElement(element, frontColor, backColor);
        element = document.getElementsByClassName('sendbtn') [0];
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
function autoGreetMsg(){
    var num = Math.floor(Math.random()*greetings.length);
    sendMessage(greetings[num]);
}
function checkStatusMsg() {
    var stat = document.getElementsByClassName('statuslog');
    if (lastStatCheck != stat.length) {
        for (var i = lastStatCheck; i < stat.length; ++i) {
            if (stat[i] !== undefined) {
                if(stat[i].innerHTML.startsWith("You both like") || stat[i].innerHTML.startsWith("Omegle couldn't find anyone")){
                    inConvo = true;
                    if(autoGreet)
                        autoGreetMsg();
                }
                if(stat[i].innerHTML.endsWith("disconnected.")){
                    inConvo=false;
                }
                if (stat[i] !== undefined && stat[i].innerHTML == shit && disconnectOnEmpty) {
                    log('Disconnected due to no matching interests.');
                    myDisconnect();
                    break;
                } else if (stat[i].innerHTML.startsWith('<div class="newchatbtnwrapper">')) {
                } else if (stat[i].innerHTML == typingText) {
                } else if (reconnectAfter && stat[i].innerHTML == 'Stranger has disconnected.') {
                    var strangerMsgNum = document.getElementsByClassName('strangermsg').length;
                    if (strangerMsgNum <= messagesChecked) {
                        log('Reconnecting due to leave.');
                        timedDisconnect();
                    }
                } else {
                    stat[i].innerHTML = getTimeStamp() + ' ' + stat[i].innerHTML;
                }
            }
        }
    }
    lastStatCheck = stat.length;
} //"msgsource"
//"strangermsg"
//"youmsg

function appendPrefix(str) {
    return (str.startsWith('http://') | str.startsWith('https://') ? str : 'http://' + str);
}
function urlizeUrls(str) {
    var urlPatt = /([A-Za-z]+:\/\/|www\.)[a-z0-9-_]+\.[a-z0-9-_:%&;\?#/.=]+/gi;
    if (!urlPatt.test(str))
        return str;
    urlPatt.lastIndex = 0;
    var urlS = '<a href="';
    var match;
    var res = '';
    var lastPos = 0;
    while ((match = urlPatt.exec(str)) !== null) {
        res += str.substring(lastPos, match.index) + urlS + appendPrefix(match[0]) + '" target="_blank">' + match[0] + '</a>';
        lastPos = match.index + match[0].length;
    }
    res += str.substring(lastPos);
    return res;
}
function matchedFilter(str) {
    for (var i = 0; i < filterPats.length; ++i) {
        filterPats[i].lastIndex = 0;
        if (filterPats[i].test(str))
            return true;
    }
    return false;
}
function grammarIsValid(str) {
    for (var i = 0; i < properGPats.length; ++i) {
        properGPats[i].lastIndex=0;
        if (properGPats[i].test(str)) {
            return true;
        }
    }
    return false;
}
function checkMsg() {
    var current = document.getElementsByClassName('msgsource');
    if (lastcheck != current.length) {
        var diff = current.length - lastcheck;
        for (var i = lastcheck; i < current.length; i++) {
            //current[i].color = youColor;
            var curr = current[i].parentNode.parentNode;
            curr.style.color = frontColor;
            var bold = curr.getElementsByClassName('strangermsg') [0];
            if (bold !== undefined) {
                bold.getElementsByClassName('msgsource') [0].style.color = strangerColor;
                var strangerMsgNum = document.getElementsByClassName('strangermsg').length;
                if (strangerMsgNum <= messagesChecked) {
                    var msg = bold.getElementsByTagName('span');
                    var amsg = msg[msg.length - 1].innerHTML.trim();
                    if (disconnectOnNoCaps) {
                        if (!grammarIsValid(amsg)) {
                            log('Disconnected on message "' + amsg + '" due to bad grammar.');
                            timedDisconnect();
                        }
                    }
                    if (disconnectOnFilter) {
                        if (matchedFilter(amsg)) {
                            log('Disconnected on message "' + amsg + ' "due to matching a filtered pattern.');
                            timedDisconnect();
                        }
                    }
                    if (disconnectOnMessage) {
                        amsg = amsg.toLowerCase();
                        for (var j = 0; j < phrasesThatTriggerForth.length; ++j) {
                            if (amsg == phrasesThatTriggerForth[j]) {
                                log('Disconnected on message "' + amsg + ' "due to matching a phrase.');
                                timedDisconnect();
                            }
                        }
                    }
                }
            }
            bold = curr.getElementsByClassName('youmsg') [0];
            if (bold !== undefined) {
                bold.getElementsByClassName('msgsource') [0].style.color = youColor;
            }
            var msg2 = current[i].parentElement;
            msg2.innerHTML = '<span>' + getTimeStamp() + ' </span>' + urlizeUrls(msg2.innerHTML);
        }
        lastcheck = current.length;
    }
}
function periodicCheck() {
    colorChat();
    checkStatusMsg();
    checkMsg();
    window.setTimeout(function () {
        periodicCheck();
    }, periodicTime);
} //triggers when a key is pressed anywhere in the window

function keyDownTextField(e) {
    var keyCode = e.keyCode;
    var evtobj = window.event ? event : e;
    //currently ctrl+q disconnects and finds new chat after leaving a message.
    if (evtobj.keyCode == 81 && evtobj.ctrlKey && waiting) {
        window.setTimeout(function () {
            myDisconnect();
        }, 500);
        waiting = false;
        return;
    }
    if (evtobj.keyCode == 81 && evtobj.altKey && waiting) {
        setMessage(greetText);
        window.setTimeout(function () {
            resetWait();
        }, 500);
        waiting = false;
        return;
    }
}
function resetWait() {
    waiting = true;
}
function disconnect() {
    var disconnectButton = document.getElementsByClassName('disconnectbtn') [0];
    disconnectButton.click();
    disconnectButton.click();
    resetThings();
    waiting = true;
}
document.addEventListener('keydown', keyDownTextField, false);
document.addEventListener('click', searchBox, false);
function setMessage(message) {
    var t = document.getElementsByClassName('chatmsg') [0].value = message;
}
function sendMessage(message) {
    setMessage(message);
    var z = document.getElementsByClassName('sendbtn') [0];
    z.click();
} //useful stuff
//disconnectbtn
//logbox
//chatmsg
//sendbtn
