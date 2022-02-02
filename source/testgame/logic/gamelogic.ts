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
        GameLogic.isGameStarted = true;
        console.log('game go brrrrrrrrrrrrrrrrrrrrrr');
        const roles = Object.values(Roles);
        const role = roles[Math.round(Math.random()*(roles.length-1))];
        Characters.main.setRole(role);
        starting.show(role);
    }
}

export {GameLogic, GameEventListener}