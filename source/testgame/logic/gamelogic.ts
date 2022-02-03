import { Character } from "../characters/Character";
import { RoleFuncs, Roles } from "../roles/roles";
import { Characters } from "./charslog";
import { starting } from "./meeting/starting";

class GameEventListener<T> {
    events: Array<(t: T) => boolean | void> = new Array();
    constructor() {}
    addEvent(event: (t: T) => boolean | void) {
        this.events.push(event);
    }
    check(t: T): boolean {
        let answer: boolean | void;
        for (let event of this.events) {
            answer = event(t);
            if (typeof answer === "boolean" && answer === false) return false;
        }
        return GameLogic.isGameStarted;
    }
}

let GameLogic = {
    eventListeners: {
        onkill: new GameEventListener<{character: Character, killer?: Character}>(),
        onmove: new GameEventListener<Character>(),
    },
    isGameStarted: false,
    startGame() {
        RoleFuncs.random(Characters.another.length+1).forEach((role, i) => {
            const ch = i===0 ? Characters.main : Characters.another[i-1]
            ch.hideRoleplate();
            ch.setRole(role);
        });
        const role = Characters.main.getRole();
        starting.show(role);
        Characters.main.showRoleplate();
        if (role.type === "impostor") {
            for (let ch of Characters.another) {
                if (ch.getRole().type==="impostor") ch.showRoleplate();
            }
        }

        GameLogic.isGameStarted = true;
    }
}

export {GameLogic, GameEventListener}