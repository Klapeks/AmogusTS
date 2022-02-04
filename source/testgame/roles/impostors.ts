import { config } from "../config";
import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { Role, RoleAction, RoleType } from "./role";

const ImpostorAction: RoleAction = {
    select: "notimpostor",
    act: (ch) => {
        logic_kill.kill(ch, Characters.main, true);
    },
    cooldown: config.killcooldown,
    button_texture: 'buttons/kill.png'
}

class ImpostorRole extends Role {
    constructor(id: string){
        super(id);
        this._type = "impostor";
        this.setAction(ImpostorAction);
    }
}

const roles_impostors = {
    Impostor: new ImpostorRole('Impostor').settings({ color: 'FF0000', name: "Импостер" }),
    Shapeshifter: new ImpostorRole("Shapeshifter").settings({ color: '9A1F27', name: "Оборотень" }),  // Оборотень
    Camouflager: new ImpostorRole("Camouflager").settings({ color: '029717', name: "Камуфляжер" }),  // Камуфляжер
    Vanisher: new ImpostorRole("Vanisher").settings({ color: 'FFFFFF', name: "Невидимка" }),  // Невидимка
    Janitor: new ImpostorRole("Janitor").settings({ color: 'FF0000', name: "Санитар" }),  // Санитар
    Saran4a: new ImpostorRole("Saran4a").settings({ color: '737373', name: "Саранча" }),  // Саранча
    Sniper: new ImpostorRole("Sniper").settings({ color: 'FF4822', name: "Снайпер" }),  // Снайпер
}

export {roles_impostors}