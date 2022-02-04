import { Game } from "../../engine/Game";
import { Location } from "../../engine/Location";
import { Character } from "../characters/Character";
import { DeadCharacter } from "../characters/DeadCharacter";
import { config } from "../config";
import { GameLogic } from "./gamelogic";
import { killanimation_logic } from "./kill/ka_logic";

let deadChars: Array<DeadCharacter> = new Array();

let logic_kill = {
    kill(character: Character, killer?: Character, movekiller: boolean = true) {
        if (!GameLogic.eventListeners.onkill.check({character, killer})) return;
        killanimation_logic.playKillSound();
        if (killer) {
            if (movekiller) {
                killer.getSprite().width = Math.abs(killer.getSprite().width)
                if (character.getSprite().width < 0) killer.getSprite().width = -killer.getSprite().width;
                killer.getLocation().set(character.getLocation().x,character.getLocation().y);
            }
        }
        character.isAlive = false;
        character.hidden = true;
        deadChars.push(new DeadCharacter(character));
    },
    getDeadNear(location: Location): DeadCharacter {
        for (let dead of deadChars) {
            if (dead.getSprite().getLocation().distanceSquared(location) <= config.deadrange*config.deadrange) return dead;
        }
        return null;
    },
    removeDead(dead: DeadCharacter){
        deadChars = deadChars.filter(d=>d!=dead);
    }
}

export { logic_kill };