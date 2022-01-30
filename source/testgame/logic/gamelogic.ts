import { Character } from "../characters/Character";

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
        return true;
    }
}

let gamelogic = {
    eventListeners: {
        onkill: new GameEventListener<{character: Character, killer?: Character}>(),
        onmove: new GameEventListener<Character>(),
    }
}

export {gamelogic, GameEventListener}