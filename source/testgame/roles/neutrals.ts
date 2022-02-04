import { config } from "../config";
import { Characters } from "../logic/charslog";
import { GameLogic } from "../logic/gamelogic";
import { logic_kill } from "../logic/kill";
import { killanimation_logic } from "../logic/kill/ka_logic";
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
    VIP: new NeutralRole("VIP").settings({ color: '00FF00', name: "VIP" }),  //ВИП

    Melok: new NeutralRole("Melok").settings({ color: 'FF9DF0', name: "Милок" })
            .setOnLoad(() => {
                GameLogic.eventListeners.onkill.addEvent((characters) => {
                    const {character, killer} = characters;
                    if (character.getRole() === roles_neutrals.Melok) {
                        killanimation_logic.play(killer);
                        return false;
                    }
                    return true;
                })
            }),  // Милок
}

export {roles_neutrals}