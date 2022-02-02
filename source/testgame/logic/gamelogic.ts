import { Character } from "../characters/Character";
import { RoleFuncs, Roles } from "../roles/roles";
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
        let roles = Object.values(Roles);
        starting.show(roles[Math.round(Math.random()*(roles.length-1))]);
    }
}

export {GameLogic, GameEventListener}