import { Game } from "../../engine/Game";
import { Location } from "../../engine/Location";
import { Character } from "../characters/Character";
import { DeadCharacter } from "../characters/DeadCharacter";
import { config } from "../config";
import { GameLogic } from "./gamelogic";
import { killanimation_logic } from "./kill/ka_logic";


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
        DeadCharacter.allDeadBodies.push(new DeadCharacter(character));
    },
    getDeadNear(location: Location): DeadCharacter {
        for (let dead of DeadCharacter.allDeadBodies) {
            if (dead.getSprite().getLocation().distanceSquared(location) <= config.deadrange*config.deadrange) return dead;
        }
        return null;
    }
}

export { logic_kill };