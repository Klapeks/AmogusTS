import { Color, HexColor } from "../../engine/Color";
import { SplitingTexture, Texture } from "../../engine/Texture";
import { Character } from "../characters/Character";
import { logic_buttons } from "../logic/buttons";
import { Characters, logic_character } from "../logic/charslog";

type RoleType = "crewmate" | "impostor" | "neutral"
type RoleSelection = "any" | "notimpostor" | "noone" | "deadbody";
interface RoleAction {
    select: RoleSelection,
    act: (ch: Character) => void,
    cooldown: number,
    button_texture?: string | Texture | [number, number],
    button_state?: number
}

class Role {
    protected id: string;
    
    constructor(id: string) {
        this.id = id.toLowerCase();
        this.name = id;
    }
    protected _type: RoleType = "crewmate";
    get type() { return this._type; }

    name: string;
    setName(name: string) {
        this.name = name;
        return this;
    } 
    description: string;
    setDescription(desc: string) {
        this.description = desc;
        return this;
    }
    usevents: boolean;
    setUseVents(b: boolean) {
        this.usevents = b;
        return this;
    }

    color: Color = HexColor('FFFFFF');
    setColor(color: Color | string) {
        this.color = typeof color === "string" ? HexColor(color) : color;
        return this;
    } 
    toCSS(): string {
        const {r,g,b} = this.color;
        return `rgb(${r},${g},${b})`
    }
    setVisual(color: Color | string, titlePath?: string) {
        this.setColor(color);
        return this;
    }

    settings(set: {
        color?: Color|string,
        name?:string,
        description?:string,
        action?: RoleAction,
        usevents?: boolean
    }) {
        if (set.name) this.name = set.name;
        if (set.color) this.setColor(set.color);
        if (set.description) this.description = set.description;
        if (set.action) this.setAction(set.action);
        if (set.usevents) this.setUseVents(set.usevents);
        return this;
    }

    onload: () => void;
    setOnLoad(f: () => void) {
        this.onload = f;
        return this;
    }
    private _onpick: (character: Character) => void;
    setOnPick(f: (character: Character) => void) {
        this._onpick = f;
        return this;
    }
    onPick(character: Character) {
        if (this._onpick) this._onpick(character);

        if (character !== Characters.main) return;
        if (this.type === "impostor") {
            character.setNicknameColor(HexColor('FF0000'));
            for (let ch of Characters.another) {
                if (ch.getRole().type==="impostor") {
                    ch.showRoleplate();
                    ch.setNicknameColor(HexColor('FF0000'));
                }
            }
        }
        
        logic_character.unSelectCharacter();
        
        if (this.action) {
            logic_buttons.ActionButton.hidden = false;
            logic_buttons.ActionButton.setState(this.action.button_state || 0);
        } else {
            logic_buttons.ActionButton.hidden = true;
        }

        logic_buttons.AdditionalButton.forEach(a => {a.hidden = true;});
        if (this.additionalActions && this.additionalActions.length > 0) {
            this.additionalActions.forEach((addact, i) => {
                logic_buttons.AdditionalButton[i].setState(addact.button_state || 0);
                logic_buttons.AdditionalButton[i].hidden = false;
            });
        }

        if (this.type === "impostor") {
            logic_buttons.InteractButton.defaultState = 1;
            logic_buttons.InteractButton.setState(1);
            logic_buttons.InteractButton.select();
        } else {
            logic_buttons.InteractButton.defaultState = 0;
            logic_buttons.InteractButton.setState(0);
            logic_buttons.InteractButton.unselect();
        }
    }

    action: RoleAction;
    setAction(act: RoleAction){
        this.action = act;
        return this;
    }
    canSelectSomeone(onlyalive = false, type: number | true | false = false): RoleSelection | false {
        if (type===false || type===true) 
            if (this.action) {
                if (this.action.select === "any") return "any";
                if (this.action.select === "notimpostor") return "notimpostor";
                if (!onlyalive && this.action.select === "deadbody") return "deadbody";
            }
        if (this.additionalActions) {
            if (type===false) {
                for (let act of this.additionalActions) {
                    if (act.select === "any") return "any";
                    if (act.select === "notimpostor") return "notimpostor";
                    if (!onlyalive && act.select === "deadbody") return "deadbody";
                }
            } else if (type!==true) {
                if (type < 0 || type >= this.additionalActions.length) return false;
                const act = this.additionalActions[type];
                if (act.select === "any") return "any";
                if (act.select === "notimpostor") return "notimpostor";
                if (!onlyalive && act.select === "deadbody") return "deadbody";
            }
        }
        return false;
    }

    additionalActions: Array<RoleAction>;
    addAdditionalAction(action: RoleAction) {
        if (!this.additionalActions) this.additionalActions = new Array();
        this.additionalActions.push(action);
        return this;
    }
}

export {Role, RoleAction, RoleType}