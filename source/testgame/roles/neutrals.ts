import { config } from "../config";
import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { Role, RoleAction, RoleType } from "./role";

class NeutralRole extends Role {
    constructor(id: string){
        super(id);
        this._type = "neutral";
    }
}

const roles_neutrals = {
    Executioner: new NeutralRole("Executioner").settings({ color: '1DD579', name: "Палач" }),  // Палач
    Arsonist: new NeutralRole("Arsonist").settings({ color: 'FF9100', name: "Спалахуйка" }),  // Спалахуйка
    Shifter: new NeutralRole("Shifter").settings({ color: 'CC874D', name: "Снитчара" }),  // Снитчара - пиздить роли
    Clown: new NeutralRole("Clown").settings({ color: 'FF0099', name: "Клоун" }),  // Клоун
    Melok: new NeutralRole("Melok").settings({ color: 'FF9DF0', name: "Милок" }),  // Милок
    VIP: new NeutralRole("VIP").settings({ color: '00FF00', name: "VIP" }),  //ВИП
}

export {roles_neutrals}