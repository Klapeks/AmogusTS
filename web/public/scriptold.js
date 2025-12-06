var x = -1280/2;
var y = -720/2;
var scale = 100;
var dx=dy=10;
var ctx, img;

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  })();

function update() {
    ctx.drawImage(img,-1280/2+x,-720/2+y, 1280*2, 720*2);
}

function onKeyDown(event){
    var code = event.code.toLowerCase();
    if (code=="keyw") keyW = true;
    if (code=="keya") keyA = true;
    if (code=="keys") keyS = true;
    if (code=="keyd") keyD = true;
    if (code=="keye") keyE = true;
    if (code=="keyq") keyQ = true;
  }
function onKeyUp(event){
    var code = event.code.toLowerCase();
    if (code=="keyw") keyW = false;
    if (code=="keya") keyA = false;
    if (code=="keys") keyS = false;
    if (code=="keyd") keyD = false;
    if (code=="keye") keyE = false;
    if (code=="keyq") keyQ = false;
}
var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
var keyE = false;
var keyQ = false;
var isLoaded = false;

function drawStuff() {
    window.requestAnimationFrame(drawStuff);
  
    if (keyD == true) x-=dx*100/scale;
    if (keyS == true) y-=dy*100/scale;
    if (keyA == true) x+=dx*100/scale;
    if (keyW == true) y+=dy*100/scale;
    if (keyE) scale += 10;
    if (keyQ) scale -= 10;
    if (scale < 50) scale = 50;
    if (scale > 500) scale = 500;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1280, 720);
    if (isLoaded) {
        ctx.drawImage(img,
            (-1280/2+x)*scale/100+1280/2,
            (-720/2+y)*scale/100+720/2,
            1280*2*scale/100,
            720*2*scale/100);
    }
}



window.onload = () => {
    var canvas = document.querySelector("canvas#game");
    ctx = canvas.getContext("2d");

    img = new Image;
    img.onload = () => {
        isLoaded = true;
    };
    img.src = "gameapi/textures/skeld.png";

    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);
    window.requestAnimationFrame(drawStuff);
}