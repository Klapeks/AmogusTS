import { Location } from "../../engine/Location";
import { Sound } from "../../engine/Sound";
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

let shifterSound: Sound;

const roles_neutrals = {
    Executioner: new NeutralRole("Executioner").settings({ color: '1DD579', name: "Палач" }),  // Палач
    Arsonist: new NeutralRole("Arsonist").settings({ color: 'FF9100', name: "Спалахуйка" }),  // Спалахуйка

    Swapper: new NeutralRole("Swapper").settings({ color: 'C0FF00', name: "Сваппер" }),  // Сваппер
    Clown: new NeutralRole("Clown").settings({ color: 'FF0099', name: "Клоун" }),  // Клоун
    VIP: new NeutralRole("VIP").settings({ color: '00FF00', name: "VIP" }),  //ВИП

    Shifter: new NeutralRole("Shifter")
        .settings({ color: 'CC874D', name: "Снитчара" })
        .setAction({
            select: "any",
            cooldown: 10,
            button_texture: [0,2],
            act: (ch) => {
                const role = ch.getRole();
                if (role.type !== "crewmate"){
                    killanimation_logic.play(Characters.main);
                    return;
                }
                shifterSound.play();
                const myrole = Characters.main.getRole();

                ch.setRole(myrole);
                Characters.main.setRole(role);

                myrole.onPick(ch)
                role.onPick(Characters.main)
            }
        }).setOnLoad(() => {
            shifterSound = new Sound('roles/shifter.wav');
        }),  // Снитчара - пиздить роли

    Melok: new NeutralRole("Melok")
        .settings({ color: 'FF9DF0', name: "Милок" })
        .setOnLoad(() => {
            GameLogic.eventListeners.onkill.addEvent((characters) => {
                const {character, killer} = characters;
                if (character.getRole() === roles_neutrals.Melok) {
                    killanimation_logic.play(killer);
                    return false;
                }
                return true;
            })
        })
        .setOnPick(ch => {
            ch.getSprite().setMargin({x:ch.getSprite().width / 4.5, y:ch.getSprite().height / 2.5})
            ch.getSprite().width /= 2;
            ch.getSprite().height /= 2;
        }), // Милок
}

export {roles_neutrals}