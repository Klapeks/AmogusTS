import { Color, HexColor } from "../../engine/Color";
import { Character } from "../characters/Character";
import { config } from "../config";
import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { roles_impostors } from "./impostors";
import { roles_neutrals } from "./neutrals";
import { Role } from "./role";

let Roles = {
    Crewmate: new Role('Crewmate').setVisual('00FFFF'),  // Член экипажа
    Impostor: roles_impostors.Impostor,  // Импостер

    Detective: new Role("Detective").setVisual('C0FF00'),  // Детектив
    Altruist: new Role("Altruist").setVisual('E7472F'),  // Альтруист - умирает но возраждает
    Engineer: new Role("Engineer").setVisual('92BAC3'),  // Инженер
    Capitan: new Role("Capitan").setVisual('65B1F9'),  // Капитан
    Swapper: new Role("Swapper").setVisual('C0FF00'),  // Сваппер
    Sheriff: new Role("Sheriff").setVisual('FFA500'),  // Шериф
    Medium: new Role("Medium").setVisual('D09DFF'),  // Ясновидящий
    Angel: new Role('Angel').setVisual('00FFFF'),  // Ангел-Хранитель
    Medic: new Role("Medic").setVisual('C6FFFB'),  // Медик

    Shapeshifter: roles_impostors.Shapeshifter,  // Оборотень
    Camouflager: roles_impostors.Camouflager,  // Камуфляжер
    Vanisher: roles_impostors.Vanisher,  // Невидимка
    Janitor: roles_impostors.Janitor,  // Санитар
    Saran4a: roles_impostors.Saran4a,  // Саранча
    Sniper: roles_impostors.Sniper,  // Снайпер

    Executioner: roles_neutrals.Executioner,  // Палач
    Arsonist: roles_neutrals.Arsonist,  // Спалахуйка
    Shifter: roles_neutrals.Shifter,  // Снитчара - пиздить роли
    Clown: roles_neutrals.Clown,  // Клоун
    Melok: roles_neutrals.Melok,  // Милок
    VIP: roles_neutrals.VIP,  //ВИП
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


export {Roles, RoleFuncs, randomRoles};