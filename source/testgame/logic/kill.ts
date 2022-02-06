import { Game } from "../../engine/Game";
import { Location } from "../../engine/Location";
import { Character } from "../characters/Character";
import { DeadCharacter } from "../characters/DeadCharacter";
import { config } from "../config";
import { Roles } from "../roles/roles";
import { Characters } from "./charslog";
import { GameLogic } from "./gamelogic";
import { killanimation_logic } from "./kill/ka_logic";
import { theend } from "./meeting/theend";


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
        logic_kill.checkAlive();
    },
    getDeadNear(location: Location): DeadCharacter {
        for (let dead of DeadCharacter.allDeadBodies) {
            if (dead.getSprite().getLocation().distanceSquared(location) <= config.deadrange*config.deadrange) return dead;
        }
        return null;
    },
    checkAlive(darkness_time = 500) {
        let imps = 0;
        let crew = 0;
        let neutral_character: Array<Character>;
        let checkChar = (ch: Character) => {
            if (!ch.isAlive) return;
            const role = ch.getRole();
            switch(role.type) {
                case "neutral": {
                    if (role.countAsCrewmate) crew += 1;
                    else {
                        if (!neutral_character) neutral_character = new Array();
                        neutral_character.push(ch);
                    }
                    break;
                }
                case "impostor": { imps+=1; break; }
                default: { crew+=1; break; }
            }
        }
        checkChar(Characters.main);
        Characters.another.forEach(checkChar);
        if (neutral_character) {
            if (imps === 0 && crew === 0) {
                if (neutral_character.length === 1) {
                    theend.end(neutral_character[0].getRole(), neutral_character[0], darkness_time);
                }
            }
            return;
        }
        if (imps >= crew) {
            theend.end(Roles.Impostor, null, darkness_time);
            return;
        } else if (imps === 0) {
            theend.end(Roles.Crewmate, null, darkness_time);
            return;
        }
    }
}

export { logic_kill };