import { SplittedTexture } from "../../engine/Texture";
import { config } from "../config";
import { logic_buttons } from "../logic/buttons";
import { Characters } from "../logic/charslog";
import { roles_crew } from "./crewmates";
import { roles_impostors } from "./impostors";
import { roles_neutrals } from "./neutrals";
import { Role } from "./role";
import { role_medic } from "./special/role_medic";

let Roles = { ...roles_crew, ...roles_impostors, ...roles_neutrals };

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
    },
    load() {
        for (let role of Object.values(Roles)) {
            if (role.onload) role.onload()
            if (!role.action?.button_texture) continue;
            if (Array.isArray(role.action.button_texture)) {
                const a = genSplit(...role.action.button_texture,() => {
                    role.action.button_state = logic_buttons.ActionButton.addState(a, null);
                });
            } else {
                role.action.button_state = logic_buttons.ActionButton
                    .addState(role.action.button_texture, null);
            }
        }
    },
    update() {
        role_medic.update();
    }
}
function genSplit(x: number, y: number, onload?: () => void) {
    return new SplittedTexture('roles/buttons_ru.png', {x:x*112, y:y*112, width:112,height:112}, null, onload);
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