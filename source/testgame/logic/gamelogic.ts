import { HexColor } from "../../engine/Color";
import { Character } from "../characters/Character";
import { RoleFuncs, Roles } from "../roles/roles";
import { logic_buttons } from "./buttons";
import { Characters } from "./charslog";
import { starting } from "./meeting/starting";

class GameEventListener<T> {
    events: Array<(t: T) => boolean | void> = new Array();
    private _checkable: boolean = true;
    constructor(checkable = true) {
        this._checkable = checkable;
    }
    addEvent(event: (t: T) => boolean | void) {
        this.events.push(event);
    }
    check(t: T): boolean {
        let answer: boolean | void;
        for (let event of this.events) {
            answer = event(t);
            if (this._checkable && typeof answer === "boolean" 
                    && answer === false) return false;
        }
        return GameLogic.isGameStarted;
    }
}

let GameLogic = {
    eventListeners: {
        onkill: new GameEventListener<{character: Character, killer?: Character}>(),
        onmove: new GameEventListener<Character>(),
        onreset: new GameEventListener<void>(false),
    },
    isGameStarted: false,
    startGame() {
        logic_buttons.ActionButton.cooldown(0);
        logic_buttons.InteractButton.cooldown(0);
        GameLogic.eventListeners.onreset.check();
        RoleFuncs.random(Characters.another.length+1).forEach((role, i) => {
            const ch = i===0 ? Characters.main : Characters.another[i-1]
            ch.setNicknameColor(HexColor('FFFFFF'));
            ch.hideRoleplate();
            // ch.setRole(i===0 ? Roles.Impostor : role)
            ch.setRole(role);

            ch.isAlive = true;
            ch.hidden = false;
            if (ch.deadbody) {
                ch.deadbody.delete();
                ch.deadbody = null;
            }
            // ch.showRoleplate();
        });
        const role = Characters.main.getRole();
        starting.show(role);
        Characters.main.showRoleplate();
        if (role.type === "impostor") {
            Characters.main.setNicknameColor(HexColor('FF0000'));
            for (let ch of Characters.another) {
                if (ch.getRole().type==="impostor") {
                    ch.showRoleplate();
                    ch.setNicknameColor(HexColor('FF0000'));
                }
            }
        }
        
        if (role.action) {
            logic_buttons.ActionButton.hidden = false;
            logic_buttons.ActionButton.setState(role.action.button_state || 0);
        } else {
            logic_buttons.ActionButton.hidden = true;
        }
        if (role.type === "impostor") {
            logic_buttons.InteractButton.defaultState = 1;
            logic_buttons.InteractButton.setState(1);
            logic_buttons.InteractButton.select();
        } else {
            logic_buttons.InteractButton.defaultState = 0;
            logic_buttons.InteractButton.setState(0);
            logic_buttons.InteractButton.unselect();
        }

        GameLogic.isGameStarted = true;
    }
}

export {GameLogic, GameEventListener}