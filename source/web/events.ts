import { Game } from "../engine/Game";
import { Touching } from "../engine/Joystick";
import { Screen } from "../engine/Screen";


let loadWebEvents = () => {

    window.addEventListener("keydown", (e) => {
        if (e.code?.toLowerCase()==="tab") e.preventDefault();
        Game.addKey(e.code);
    }, false);
    window.addEventListener("keyup", (e) => Game.removeKey(e.code), false);

    document.addEventListener("mousedown", (e) => {
        Game.eventListeners.callMouseClick(e.clientX*Screen.width/window.innerWidth, e.clientY*Screen.height/window.innerHeight)
        Game.mouseinfo.isClicked = true;
    }, false);
    document.addEventListener("mouseup", (e) => {
        Game.mouseinfo.isClicked = false;
    }, false);
    document.addEventListener("mousemove", (e) => {
        Game.mouseinfo.posX = e.clientX*Screen.width/window.innerWidth;
        Game.mouseinfo.posY = e.clientY*Screen.height/window.innerHeight;
        if (Game.mouseinfo.posX < 0) Game.mouseinfo.posX = 0;
        if (Game.mouseinfo.posX > Screen.width) Game.mouseinfo.posX = Screen.width;
        if (Game.mouseinfo.posY < 0) Game.mouseinfo.posY = 0;
        if (Game.mouseinfo.posY > Screen.height) Game.mouseinfo.posY = Screen.height;
    }, false);

    window.addEventListener("touchstart", (e) => {
      Game.mouseinfo.posX = 0; Game.mouseinfo.posY = 0;
      let t: Touch;
      for (let i = 0; i < e.changedTouches.length; i++){
        t = e.changedTouches.item(i);
        Touching.add({
          id: t.identifier,
          x: t.clientX*Screen.width/window.innerWidth,
          y: t.clientY*Screen.height/window.innerHeight
        })
      }
    }, false)
    window.addEventListener("touchend", (e) => {
      let t: Touch;
      for (let i = 0; i < e.changedTouches.length; i++){
        t = e.changedTouches.item(i);
        Touching.remove(t.identifier);
      }
    }, false)
    window.addEventListener("touchcancel", (e) => {
      let t: Touch;
      for (let i = 0; i < e.changedTouches.length; i++){
        t = e.changedTouches.item(i);
        Touching.remove(t.identifier);
      }
    }, false)
    window.addEventListener("touchmove", (e) => {
      let t: Touch;
      for (let i = 0; i < e.changedTouches.length; i++){
        t = e.changedTouches.item(i);
        Touching.move({
          id: t.identifier,
          x: t.clientX*Screen.width/window.innerWidth,
          y: t.clientY*Screen.height/window.innerHeight
        })
      }
    }, false)
    document.addEventListener('contextmenu', e => e.preventDefault())
}

export {loadWebEvents};