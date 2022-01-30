import { Character } from "../characters/Character";
import { Map } from "./maps/map";
import { logic_map } from "./maps/maplogic";

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
        // onmapload: new GameEventListener<void>(),
        // addMapLoadEvent(event: () => void) {
        //     if (!logic_map.getMap()) {
        //         gamelogic.eventListeners.onmapload.addEvent(event);
        //     } else event();
        // }
    }
}

export {gamelogic, GameEventListener}