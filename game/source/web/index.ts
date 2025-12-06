import { Canvas2DScene } from "./Canvas2DScene";
import { Scene } from "../engine/Scene";
import { testgame } from "../testgame/main";
import { Game } from "../engine/Game";
import { loadWebEvents } from "./events";
import { SoundsUtils } from "../engine/Sound";
import { WebAPISoundPlayer } from "./WebAPISoundPlayer";


///////////////////////////////////////
// Legacy full screen
///////////////////////////////////////
var makeFullScreen = (elem:any) => {
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.mozRequestFullscreen) elem.mozRequestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}
(function() {
    var win: any = window;
    var requestAnimationFrame = win.requestAnimationFrame 
      || win.mozRequestAnimationFrame 
      || win.webkitRequestAnimationFrame 
      || win.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
    win = document;
    var closeFullScreen = win.exitFullscreen 
      || win.mozExitFullscreen 
      || win.webkitExitFullscreen 
      || win.msExitFullscreen;
    document.exitFullscreen = closeFullScreen;
    win = window;
})();


///////////////////////////////////////
// Animation Frame
///////////////////////////////////////
let fps;
let requestTime;

function drawStuff(time) {
    // if (requestTime) {
    //   fps = Math.round(1000/((performance.now() - requestTime)));
    // }
    // console.log(fps);
    // requestTime = time;
    window.requestAnimationFrame(time => drawStuff(time));
    try {
      Game.update();
    } catch (e){
      console.log(e);
      alert(e);
    }
}

var scene: Scene;

///////////////////////////////////////
// After load
///////////////////////////////////////
window.onload = () => {
    SoundsUtils.setSoundCreator(new WebAPISoundPlayer());
    window.addEventListener('resize', function(event) {
        Game.eventListeners.callResize(window.innerWidth, window.innerHeight);
    }, true);
    Game.eventListeners.addDone(() => {
        Game.eventListeners.callResize(window.innerWidth, window.innerHeight);
    })

    Game.functions.texturePath = (path) => {
        if (path.includes("gameapi/assets/textures/")) path = path.split("gameapi/assets/textures/")[1];
        return `gameapi/assets/textures/${path}`;
    };
    Game.functions.soundPath = (path) => {
        if (path.includes("gameapi/assets/sounds/")) path = path.split("gameapi/assets/sounds/")[1];
        return `gameapi/assets/sounds/${path}`;
    };
    var canvas = document.querySelector("canvas#game") as HTMLCanvasElement;
    Game.eventListeners.tryFullScreen = () => {
        if (Game.gameinfo.isFullScreen) {
            Game.gameinfo.isFullScreen = false;
            document.exitFullscreen();
        } else {
            makeFullScreen(canvas);
            Game.gameinfo.isFullScreen = true;
        }
    }
    scene = new Canvas2DScene(canvas);
    Game.setScene(scene);
    
    loadWebEvents();

    try {
      testgame.load();
    } catch (e){
      console.log(e);
      alert(e);
    }

    window.requestAnimationFrame(time => drawStuff(time));
}