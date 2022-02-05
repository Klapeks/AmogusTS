import { HexColor } from "../../engine/Color";
import { config } from "../config";
import { logic_buttons } from "../logic/buttons";
import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { Role, RoleAction, RoleType } from "./role";

const ImpostorAction: RoleAction = {
    select: "notimpostor",
    act: (ch) => {
        logic_kill.kill(ch, Characters.main, true);
    },
    cooldown: config.killcooldown,
    button_state: 0
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

    Freezer: new ImpostorRole("Freezer").settings({ color: 'C9CAFF', name: "Холодильник" }),  // Холодильник

    Vanisher: new ImpostorRole("Vanisher")
        .settings({ color: 'FFFFFF', name: "Невидимка" })
        .addAdditionalAction({
            cooldown: 10,
            button_texture: [2,1],
            act: () => {
                Characters.main.getSprite().opacity = 0.3;
                const b = logic_buttons.AdditionalButton[0];
                b.setModifiedCooldown('#00FF00', () => {
                    Characters.main.getSprite().opacity = 1;
                    b.resetModifiedCooldown();
                    b.cooldown(5);
                })
            }
        }),  // Невидимка

    Janitor: new ImpostorRole("Janitor").settings({ color: 'FF0000', name: "Санитар" }),  // Санитар

    Saran4a: new ImpostorRole("Saran4a").settings({ color: '737373', name: "Саранча" }),  // Саранча

    Sniper: new ImpostorRole("Sniper").settings({ color: 'FF4822', name: "Снайпер" }),  // Снайпер
}

export {roles_impostors}