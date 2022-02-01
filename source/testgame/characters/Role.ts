import { Color } from "../../engine/Color";

type RoleType = "crewmate" | "impostor" | "neutral"
class Role {
    readonly name: string;
    description: string;
    color: Color = {r:255, g:255, b:255};
    readonly type: RoleType = "crewmate";
    
    constructor(name: string, type:RoleType = "crewmate") {
        this.name = name;
        this.type = type;
    }
    setColor(color: Color){
        this.color = color;
        return this;
    }
    setDescription(desc: string) {
        this.description = desc;
        return this;
    }
}

export {Role, RoleType}