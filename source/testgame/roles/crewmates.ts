import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { killanimation_logic } from "../logic/kill/ka_logic";
import { role_angel } from "./special/role_angel";
import { Role } from "./role";
import { meeting } from "../logic/meeting/meeting";
import { SplittedTexture } from "../../engine/Texture";
import { MainCharacter } from "../characters/MainCharacter";
import { GameLogic } from "../logic/gamelogic";
import { Game } from "../../engine/Game";
import { role_medic } from "./special/role_medic";
import { Sound } from "../../engine/Sound";

let detectiveSound: Sound;

const roles_crew = {
    Crewmate: new Role('Crewmate').setVisual('00FFFF'),  // Член экипажа

    Detective: new Role("Detective").setVisual('C0FF00').setAction({
        button_texture: [0,0],
        cooldown: 5,
        select: "any",
        act: (ch) => {
            ch.showRoleplate();
            detectiveSound?.play();
        }
    }).setOnLoad(() => {
        detectiveSound = new Sound('roles/detective.wav');
    }),  // Детектив

    Altruist: new Role("Altruist").setVisual('E7472F').setAction({
        button_texture: [2,0],
        cooldown: 1,
        select: "deadbody",
        act: (ch) => {
            const {x, y} = ch.deadbody.getSprite().getLocation();
            ch.getLocation().set(x,y);
            ch.deadbody.delete();
            ch.isAlive = true;
            ch.hidden = false;
            killanimation_logic.play(Characters.main);
        }
    }),  // Альтруист - умирает но возраждает

    Engineer: new Role("Engineer").setVisual('92BAC3'),  // Инженер

    Capitan: new Role("Capitan").setVisual('65B1F9'),  // Капитан

    General: new Role("General").setVisual('00B17A').setAction({
        button_texture: [1,0],
        cooldown: 120,
        select: "noone",
        act: (ch) => {
            meeting.call(Characters.main, "meeting");
        }
    }),  // Генерал

    Swapper: new Role("Swapper").setVisual('C0FF00'),  // Сваппер

    Sheriff: new Role("Sheriff").setVisual('FFA500').setAction({
        button_texture: [0,1],
        cooldown: 5,
        select: "any",
        act: (ch) => {
            logic_kill.kill(ch, Characters.main, ch.getRole().type!=="crewmate");
            if (ch.getRole().type==="crewmate") killanimation_logic.play(Characters.main);
        }
    }),  // Шериф

    Medium: new Role("Medium").setVisual('D09DFF'),  // Ясновидящий

    Angel: new Role('Angel').setVisual('73BAFF').setAction({
        button_texture: [0,0],
        cooldown: 5,
        select: "any",
        act: (ch) => { role_angel.save(ch); }
    }).setOnLoad(role_angel.load),  // Ангел-Хранитель

    Medic: new Role("Medic").setVisual('C6FFFB').setAction({
        button_texture: [2,0],
        cooldown: 1,
        select: "deadbody",
        act: (character) => {
            if (!character?.deadbody) return;
            if (role_medic.getDragging()) {
                role_medic.setDragging(null);
            } else {
                role_medic.setDragging(character.deadbody);
            }
        }
    }),  // Медик
}

export {roles_crew}