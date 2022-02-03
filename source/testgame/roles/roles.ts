import { Color, HexColor } from "../../engine/Color";
import { Character } from "../characters/Character";
import { config } from "../config";
import { Characters } from "../logic/charslog";

type RoleType = "crewmate" | "impostor" | "neutral"
interface RoleSettings {
    name: string;
    color: Color;
    type: RoleType;
    select?: "any" | "crewmate";
    description?: string;
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

let Roles = {
    Crewmate: new Role('Crewmate', "crewmate").setVisual('00FFFF'),  // Член экипажа
    Impostor: new Role("Impostor", "impostor").setVisual('FF0000'),  // Импостер

    Angel: new Role('Angel', "crewmate").setVisual('00FFFF'),  // Ангел-Хранитель
    Medium: new Role("Medium", "crewmate").setVisual('D09DFF'),  // Ясновидящий
    Detective: new Role("Detective", "crewmate").setVisual('C0FF00'),  // Детектив
    Engineer: new Role("Engineer", "crewmate").setVisual('92BAC3'),  // Инженер
    Capitan: new Role("Capitan", "crewmate").setVisual('65B1F9'),  // Капитан
    Swapper: new Role("Swapper", "crewmate").setVisual('C0FF00'),  // Сваппер
    Sheriff: new Role("Sheriff", "crewmate").setVisual('FFA500'),  // Шериф
    Medic: new Role("Medic", "crewmate").setVisual('C6FFFB'),  // Медик
    Altruist: new Role("Altruist", "crewmate").setVisual('E7472F'),  // Альтруист - умирает но возраждает

    Shapeshifter: new Role("Shapeshifter", "impostor").setVisual('9A1F27'),  // Оборотень
    Camouflager: new Role("Camouflager", "impostor").setVisual('029717'),  // Камуфляжер
    Vanisher: new Role("Vanisher", "impostor").setVisual('FFFFFF'),  // Невидимка
    Janitor: new Role("Janitor", "impostor").setVisual('FF0000'),  // Санитар
    Saran4a: new Role("Saran4a", "impostor").setVisual('737373'),  // Саранча
    Sniper: new Role("Sniper", "impostor").setVisual('FF4822'),  // Снайпер

    Executioner: new Role("Executioner", "neutral").setVisual('1DD579'),  // Палач
    Arsonist: new Role("Arsonist", "neutral").setVisual('FF9100'),  // Спалахуйка
    Shifter: new Role("Shifter", "neutral").setVisual('CC874D'),  // Снитчара - пиздить роли
    Clown: new Role("Clown", "neutral").setVisual('FF0099'),  // Клоун
    Melok: new Role("Melok", "neutral").setVisual('FF9DF0'),  // Милок
    VIP: new Role("VIP", "neutral").setVisual('00FF00'),  //ВИП
}

let RoleFuncs = {
    getImpostors(onlyAlive = false) {
        let imps = Characters.another.filter(ch => (!onlyAlive || ch.isAlive) && ch.getRole().type==="impostor");
        if (Characters.main.getRole().type==="impostor") imps.push(Characters.main);
        return imps;
    },
    random(amount: number, impostors = config.roles.imposters, neutral = config.roles.neutral): Role[] {
        let roles = new Array<Role>();
        let f = (arr: Role[]) => arr.splice(Math.round(Math.random()*(arr.length-1)), 1)[0];
        
        let suproles = Object.values(Roles).filter(r=>r.type==="impostor");
        for (let i = 0; i < impostors; i++) {
            roles.push(f(suproles));
        }
        suproles = Object.values(Roles).filter(r=>r.type==="neutral");
        for (let i = 0; i < neutral; i++) {
            if (Math.random() < config.roles.neutral_chance) roles.push(f(suproles));
        }
        suproles = Object.values(Roles).filter(r=>r.type==="crewmate");
        while(roles.length < amount) {
            roles.push(f(suproles));
        }
    
        for (let i = roles.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }
        return roles;
    }
}

var randomRoles = (amount = 10, impostors = config.roles.imposters, neutral = config.roles.neutral): void => {
    const roles = RoleFuncs.random(amount, impostors, neutral);
    let a = '';
    roles.forEach((r, i)=>{
        a+=`${i+1}. `
        if (r.type==="impostor") a+="!";
        if (r.type==="neutral") a+="~";
        a+=r.name;
        a+='\n';
    })
    console.log(a);
}


export {Roles, RoleFuncs, Role, RoleType, randomRoles};