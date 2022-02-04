import { Color, HexColor } from "../../engine/Color";
import { Character } from "../characters/Character";

type RoleType = "crewmate" | "impostor" | "neutral"
interface RoleAction {
    select: "any" | "notimpostor",
    act: (ch: Character) => void,
    cooldown: number,
    button_texture: string
}
interface RoleSettings {
    name: string;
    color: Color;
    type: RoleType;
    description?: string;
    action?: RoleAction
};

class Role {
    private id: string;
    private settings: RoleSettings;
    
    constructor(id: string, type:RoleType = "crewmate") {
        this.id = id.toLowerCase();
        this.settings = {
            name: id,
            color: {r:255, g:255, b:255},
            type: type,
        }
    }
    get name() {
        return this.settings.name;
    }
    get color() {
        return this.settings.color;
    }
    get type() {
        return this.settings.type;
    }
    setColor(color: Color){
        this.settings.color = color;
        return this;
    }
    setSettings(settings: RoleSettings){
        this.settings = settings;
        return this;
    }
    setVisual(hexcolor: string, titlePath?: string) {
        this.settings.color = HexColor(hexcolor);
        return this;
    }
    setDescription(desc: string) {
        this.settings.description = desc;
        return this;
    }
    toCSS(): string {
        const {r,g,b} = this.settings.color;
        return `rgb(${r},${g},${b})`
    }
}

export {Role, RoleSettings, RoleAction, RoleType}