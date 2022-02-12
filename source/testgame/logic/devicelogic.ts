import { Game } from "../../engine/Game";
import { Screen } from "../../engine/Screen";
import { StaticSprite } from "../../engine/Sprite"
import { Texture } from "../../engine/Texture";

let pleaseRotateDevice: StaticSprite;

let logic_device = {
    load() {
        Game.eventListeners.addRezise((w,h)=>{
            if (w/h < 1) Game.getScene().LayerGUI.add(pleaseRotateDevice);
            else Game.getScene().LayerGUI.remove(pleaseRotateDevice); 
        });
        pleaseRotateDevice = new StaticSprite(new Texture('warns/devicerot_ru.png')).setSize(Screen.width, Screen.height);
        pleaseRotateDevice.priority = Infinity;
    }
}

export {logic_device};