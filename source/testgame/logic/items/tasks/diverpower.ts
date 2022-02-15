import { Game } from "../../../../engine/Game";
import { BiLocation, Location } from "../../../../engine/Location";
import { Screen } from "../../../../engine/Screen";
import { Texture } from "../../../../engine/Texture";
import { voting } from "../../meeting/voting";
import { TaskMenu } from "../TaskMenu";
import { Task } from "./task";

let menu: TaskMenu;

let defaultTaskTexture: Texture;
function texture(): Texture {
    if (!defaultTaskTexture) defaultTaskTexture = new Texture('tasks/divert_power/task.png');
    return defaultTaskTexture;
}

class DiverPowerTask extends Task {
    constructor(location: BiLocation) {
        super("diverpowertask", texture(), location, "back");
        if (!menu) {
            menu = new TaskMenu(new Texture('tasks/divert_power/base.png'), Screen.box)
            menu.addClick({x:0,y:0,dx:1920,dy:1080,fromto:true}, () => {
                if (voting.isVoting) return;
                console.log("aboba");
            });
            menu.setApearTime(100);
        }
    }
    getMenu = () => menu;
    update(): void {
        if (Game.mouseinfo.isClicked) {
            console.log('vladus');
        }
    }
}

export {DiverPowerTask};