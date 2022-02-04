import { Color, HexColor } from "../../engine/Color";
import { Texture } from "../../engine/Texture";
import { Character } from "../characters/Character";

type RoleType = "crewmate" | "impostor" | "neutral"
interface RoleAction {
    select: "any" | "notimpostor" | "noone",
    act: (ch: Character) => void,
    cooldown: number,
    button_texture?: string | Texture,
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
        description?:string
        action?: RoleAction
    }) {
        if (set.name) this.name = set.name;
        if (set.color) this.setColor(set.color);
        if (set.description) this.description = set.description;
        if (set.action) this.setAction(set.action);
        return this;
    }

    action: RoleAction;
    setAction(act: RoleAction){
        this.action = act;
        return this;
    }
    canSelectSomeone() {
        return this.action && this.action.select !== "noone";
    }

    onload: () => void;
    setOnLoad(f: () => void) {
        this.onload = f;
        return this;
    }
}

export {Role, RoleAction, RoleType}