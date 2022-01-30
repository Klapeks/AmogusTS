import { Game } from "../../engine/Game";
import { Screen } from "../../engine/Screen";
import { StaticSprite } from "../../engine/Sprite"
import { Texture } from "../../engine/Texture";

let pleaseRotateDevice: StaticSprite;

let logic_device = {
    load() {
        Game.eventListeners.addRezise((w,h)=>{
            if (w/h < 1) pleaseRotateDevice.hidden=false;
            else pleaseRotateDevice.hidden=true; 
        });
        pleaseRotateDevice = new StaticSprite(new Texture('warns/devicerot_ru.png')).setSize(Screen.width, Screen.height);
        pleaseRotateDevice.hidden = true;
        Game.getScene().addUpperSprite(pleaseRotateDevice);
    }
}

export {logic_device};