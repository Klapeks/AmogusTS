import { logic_buttons } from "./buttons";
import { Characters, logic_character } from "./charslog"
import { ejections } from "./meeting/ejection";
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
import { starting } from "./meeting/starting";
import { randomRoles, RoleFuncs, Roles } from "../roles/roles";
import { MainMenu } from "../gui/mainmenu";

let logic = {
    load(){
        starting.load();
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
        MainMenu.update();
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
        if (Game.hasKey("digit1")) {
            if (starting.isShowed) return;
            
            RoleFuncs.random(Characters.another.length+1).forEach((role, i) => {
                if (i===0){
                    Characters.main.setRole(role);
                    return;
                }
                Characters.another[i-1].setRole(role);
                Characters.another[i-1].showRoleplate();
            });
            starting.show(Characters.main.getRole());
        }
        if (Game.hasKey("digit0")) {
            if (cd) return;
            cd = true;
            setTimeout(() => {
                cd = false;
            }, 2000);
            randomRoles();
        }
    }
}

let cd = false;

export {logic}