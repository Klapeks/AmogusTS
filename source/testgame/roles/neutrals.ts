import { HexColor } from "../../engine/Color";
import { Location } from "../../engine/Location";
import { Sound } from "../../engine/Sound";
import { Character } from "../characters/Character";
import { config } from "../config";
import { logic_buttons } from "../logic/buttons";
import { Characters } from "../logic/charslog";
import { GameLogic } from "../logic/gamelogic";
import { logic_kill } from "../logic/kill";
import { killanimation_logic } from "../logic/kill/ka_logic";
import { theend } from "../logic/meeting/theend";
import { roles_impostors } from "./impostors";
import { Role, RoleAction, RoleType } from "./role";
import { Roles } from "./roles";
import { role_arsonist } from "./special/role_arsonist";

class NeutralRole extends Role {
    constructor(id: string){
        super(id);
        this._type = "neutral";
        this.setWinSound('theend/victory_neutral.wav');
        this.countAsCrewmate = true;
    }
}

const createNoKick = (role: Role, win: Role = role) => {
    GameLogic.eventListeners.onkick.addEvent((event) => {
        const character = event.character;
        if (character.getRole() === role) {
            event.doAfterKick.push(() => {
                theend.end(win, character, 0);
                return false;
            })
        }
        return true;
    })
}
const createNoKill = (role: Role, win: Role = role) => {
    GameLogic.eventListeners.onkill.addEvent((characters) => {
        const {character, killer} = characters;
        if (character.getRole() === role) {
            theend.end(win, character);
        }
        return true;
    })
}

let shifterSound: Sound;

let executionerTarget: Character;

const roles_neutrals = {
    Arsonist: new NeutralRole("Arsonist")
        .settings({ color: 'FF9100', name: "Спалахуйка", countAsCrewmate: false })
        .setOnLoad(role_arsonist.load)
        .setAction({
            select: "notinfected",
            cooldown: 1,
            button_texture: [0,4],
            act: role_arsonist.dose
        })
        .addAdditionalAction({
            select: "regulatable",
            cooldown: 5,
            button_texture: [2,3],
            act: role_arsonist.ignite
        })
        .setOnPick(() => {
            logic_buttons.AdditionalButton[0].unselect();
        }),  // Спалахуйка

    Swapper: new NeutralRole("Swapper").settings({ color: 'C0FF00', name: "Стрелочник" }),  // Сваппер

    Executioner: new NeutralRole("Executioner")
        .settings({ color: '1DD579', name: "Палач" })
        .setOnLoad(() => {
            GameLogic.eventListeners.onreset.addEvent(() => {
                executionerTarget = undefined;
            })
            GameLogic.eventListeners.onkick.addEvent((event) => {
                if (!executionerTarget) return;
                if (event.character === executionerTarget) {
                    event.doAfterKick.push(() => {
                        theend.end(roles_neutrals.Executioner, Characters.main, 0);
                        return false;
                    })
                }
            })
        })
        .setOnPick(() => {
            setTimeout(() => {
                const randChar = () => Characters.another[Math.floor(Math.random()*Characters.another.length)];
                do {
                    executionerTarget = randChar();
                } while (executionerTarget.getRole().type !== "crewmate");
                executionerTarget.setNicknameColor(HexColor('1DD579'));
            }, 1);
        }),  // Палач

    VIP: new NeutralRole("VIP")
        .settings({ color: '00FF00', name: "VIP" })
        .setOnLoad(() => {
            createNoKick(roles_neutrals.VIP, roles_impostors.Impostor);
            createNoKill(roles_neutrals.VIP, roles_impostors.Impostor);
        })
        .setOnPick((character) => {
            if (Characters.main.getRole().type === "crewmate") {
                character.showRoleplate();
            }
        }),  //ВИП

    Melok: new NeutralRole("Melok")
        .settings({ color: 'FF9DF0', name: "Милок", winsound: 'theend/role_melok.wav'})
        .setOnLoad(() => {
            createNoKill(roles_neutrals.Melok);
            createNoKick(roles_neutrals.Melok);
        })
        .setOnPick(ch => {
            ch.getSprite().setMargin({x:ch.getSprite().width / 4.5, y:ch.getSprite().height / 2.5})
            ch.getSprite().width /= 2;
            ch.getSprite().height /= 2;
        }), // Милок

    Clown: new NeutralRole("Clown")
        .settings({ color: 'FF0099', name: "Клоун" })
        .setOnLoad(() => {
            createNoKick(roles_neutrals.Clown);
        }),  // Клоун

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
}

export {roles_neutrals}