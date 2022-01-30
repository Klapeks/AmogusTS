import { logic_buttons } from "./buttons";
import { Characters, logic_character } from "./charslog"
import { ejections } from "./meeting/ejection";
import { logic_kill } from "./kill";
import { voting } from "./meeting/voting";
import { meeting } from "./meeting/meeting";
import { Texture } from "../../engine/Texture";
import { Joystick } from "../../engine/Joystick";
import { logic_device } from "./devicelogic";
import { logic_map } from "./maps/maplogic";
import { Game } from "../../engine/Game";
import { Screen } from "../../engine/Screen";
import { killanimation_logic } from "./kill/ka_logic";
import { role_angel } from "../roles/angel";

let logic = {
    load(){
        logic_character.load();
        logic_buttons.load();
        Joystick.create(new Texture('buttons/joystick.png'),new Texture('buttons/joystickbutton.png'));
        meeting.load();
        voting.load();
        ejections.load();
        killanimation_logic.load();
        role_angel.load();

        logic_device.load();
    },
    update() {
        logic_character.update();
        logic_buttons.update();
        meeting.update();
        voting.update();
        ejections.update();
        killanimation_logic.update();
        
        logic_map.update();
        

        if (Game.hasKey("keyk")){
            const res = Game.getCamera().getResolution();
            let qx = (Game.mouseinfo.posX - Screen.width/2)*Screen.width/res.x + Game.getCamera().getLocation().x;
            let qy = (Game.mouseinfo.posY - Screen.height/2)*Screen.height/res.y + Game.getCamera().getLocation().y;
            console.log(`${Math.round(qx)}, ${Math.round(qy)}  ---   ${Math.round(Game.mouseinfo.posX)}, ${Math.round(Game.mouseinfo.posY)}`);
        }
        if (Game.hasKey("keyv")){
            if (cd) return;
            cd = true;
            setTimeout(() => {
                cd = false;
            }, 2000);
            role_angel.playSave(Characters.main);
        }
    }
}

let cd = false;

export {logic}