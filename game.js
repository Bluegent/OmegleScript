var gameCanvas = document.createElement("canvas");
var myGame;
var last;
class Game{
	constructor(fps, tickrate, canvas){
		this.fps = fps;
		this.tickrate=tickrate;
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.objects = new Array();	
		this.inter1 = setInterval(this.update.bind(this), 1000/this.tickrate);
		requestAnimationFrame(this.render.bind(this))
	}
	update(){	
		var dt = unit();
		for(var i=0;i<this.objects.length;++i)
			this.objects[i].update(dt);
	}
	render(){
		var func = this.render.bind(this);
		setTimeout(function(){requestAnimationFrame(func)},1000/this.fps);	
		this.clear();
		for(var i=0;i<this.objects.length;++i){
			this.objects[i].render();
		}	
	}
	clear(){
		this.context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	}
}
class GameObject{
	constructor(x,y,width, height,canvas){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height=height;
		this.dir=1;
		this.context = canvas.getContext("2d");
	}
	render(){
		this.context.fillStyle = "black";
		this.context.fillRect(this.x,this.y,this.width,this.height);
	}
	update(dt){
		if(this.x>gameCanvas.width-this.width)
			this.dir=-1;
		if(this.x<0)
			this.dir=1;
		this.x+=500*dt*this.dir;
	}
}

function init(){
	gameCanvas.width = 800;
	gameCanvas.height = 1000;
	document.body.insertBefore(gameCanvas, document.body.childNodes[0]);
	last = new Date().getTime();
	myGame = new Game(60,60,gameCanvas);
	var num = 1000;
	var hei = gameCanvas.height/num;
	var prevWid=gameCanvas.width;
	var tamp = 0;
	for(var i =0;i<num;++i){
		var wid = Math.random() * gameCanvas.width * 0.7;
		console.log(wid+" "+prevWid);
		if(prevWid+wid-tamp<gameCanvas.width)
			wid=gameCanvas.width-prevWid+tamp;
		prevWid=wid;
		myGame.objects.push(new GameObject(0,i*hei,wid,hei,gameCanvas));
	}
	//myGame.objects.push(new grid(100,gameCanvas));
}

function grid(distance,canvas){
	this.context = canvas.getContext("2d");
	this.distance = distance;
	this.update = function(){
	}
	this.render = function(){
		this.context.fillStyle = "black";
		for(var i =0; i<gameCanvas.width/this.distance+1;++i){
			this.context.fillRect(i*this.distance-0.5,0,1,gameCanvas.height);
		}
		for(var i =0; i<gameCanvas.height/this.distance+1;++i){
			this.context.fillRect(0,i*this.distance-0.5,gameCanvas.width,1);
		}
	}
}

function unit(){
    var now = new Date().getTime();
	var dt = now - last;
	last= now;	
	return dt/1000;
}
window.onload = init;