import { HexColor } from "../../engine/Color";
import { Character } from "../characters/Character";
import { RoleFuncs, Roles } from "../roles/roles";
import { logic_buttons } from "./buttons";
import { Characters } from "./charslog";
import { starting } from "./meeting/starting";

class GameEventListener<T> {
    events: Array<(t: T) => boolean | void> = new Array();
    private _checkable: boolean = true;
    private _defaultReturn: boolean = undefined;
    constructor(checkable = true, defaultReturn: boolean = undefined) {
        this._checkable = checkable;
        this._defaultReturn = defaultReturn;
    }
    addEvent(event: (t: T) => boolean | void) {
        this.events.push(event);
    }
    check(t: T): boolean {
        if (this._defaultReturn == undefined) this._defaultReturn = GameLogic.isGameStarted;
        let answer: boolean | void;
        for (let event of this.events) {
            answer = event(t);
            if (!this._checkable) continue;
            if (typeof answer === "boolean" && answer === false) return false;
        }
        return this._defaultReturn;
    }
}

let GameLogic = {
    isGameStarted: false,
    eventListeners: {
        onkill: new GameEventListener<{character: Character, killer?: Character}>(),
        onmove: new GameEventListener<Character>(),
        onreset: new GameEventListener<void>(false),
        character_canidle: new GameEventListener<Character>(true, true),
    },
    startGame() {
        logic_buttons.ActionButton.cooldown(0);
        logic_buttons.InteractButton.cooldown(0);
        GameLogic.eventListeners.onreset.check();
        RoleFuncs.random(Characters.another.length+1).forEach((role, i) => {
            const ch = i===0 ? Characters.main : Characters.another[i-1]
            ch.setNicknameColor(HexColor('FFFFFF'));
            ch.hideRoleplate();
            // if (i===0) {
            //     ch.setRole(Roles.Engineer);
            // } else
            // if (i===1) {
            //     // ch.setRole(Roles.Melok);
            // } else 
            ch.setRole(role);
            ch.getRole().onPick(ch);

            ch.isAlive = true;
            ch.hidden = false;
            if (ch.deadbody) {
                ch.deadbody.delete();
                ch.deadbody = null;
            }
            ch.showRoleplate();
        });
        starting.show(Characters.main.getRole());
        Characters.main.showRoleplate();

        GameLogic.isGameStarted = true;
    }
}

export {GameLogic, GameEventListener}