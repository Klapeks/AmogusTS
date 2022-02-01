import { Color, HexColor } from "../../engine/Color";
import { Character } from "../characters/Character";
import { Characters } from "../logic/charslog";

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

let Roles = {
    Crewmate: new Role('Экипажник', "crewmate").setColor(HexColor('00FFFF')),
    Angel: new Role('Ангел-Хранитель', "crewmate").setColor(HexColor('00FFFF')),
    Medium: new Role("Ясновидящий", "crewmate").setColor(HexColor('D09DFF')),
    Detective: new Role("Детектив", "crewmate").setColor(HexColor('C0FF00')),
    Engineer: new Role("Инженер", "crewmate").setColor(HexColor('92BAC3')),
    Capitan: new Role("Капитан", "crewmate").setColor(HexColor('65B1F9')),
    Swapper: new Role("Сваппер", "crewmate").setColor(HexColor('C0FF00')),
    Sheriff: new Role("Шериф", "crewmate").setColor(HexColor('FFA500')),
    Medic: new Role("Медик", "crewmate").setColor(HexColor('C6FFFB')),

    Shapeshifter: new Role("Оборотень", "impostor").setColor(HexColor('9A1F27')),
    Impostor: new Role("Импостер", "impostor").setColor(HexColor('FF0000')),
    Janitor: new Role("Санитар", "impostor").setColor(HexColor('FF0000')),
    Saran4a: new Role("Саранча", "impostor").setColor(HexColor('737373')),
    Sniper: new Role("Снайпер", "impostor").setColor(HexColor('FF4822')),

    Arsonist: new Role("Спалахуйка", "neutral").setColor(HexColor('FF9100')),
    Clown: new Role("Клоун (Егор)", "neutral").setColor(HexColor('FF0099')),
    Melok: new Role("Милок", "neutral").setColor(HexColor('FF9DF0')),
}

let RoleFuncs = {
    getImpostors(onlyAlive = false) {
        let imps = Characters.another.filter(ch => (!onlyAlive || ch.isAlive) && ch.getRole().type==="impostor");
        if (Characters.main.getRole().type==="impostor") imps.push(Characters.main);
        return imps;
    }
}


export {Roles, RoleFuncs, Role, RoleType};