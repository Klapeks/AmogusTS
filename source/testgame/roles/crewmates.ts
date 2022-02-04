import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { killanimation_logic } from "../logic/kill/ka_logic";
import { role_angel } from "./special/role_angel";
import { Role } from "./role";
import { meeting } from "../logic/meeting/meeting";
import { SplittedTexture } from "../../engine/Texture";


const roles_crew = {
    Crewmate: new Role('Crewmate').setVisual('00FFFF'),  // Член экипажа

    Detective: new Role("Detective").setVisual('C0FF00'),  // Детектив

    Altruist: new Role("Altruist").setVisual('E7472F'),  // Альтруист - умирает но возраждает

    Engineer: new Role("Engineer").setVisual('92BAC3'),  // Инженер

    Capitan: new Role("Capitan").setVisual('65B1F9'),  // Капитан

    General: new Role("General").setVisual('00B17A').setAction({
        button_texture: [1,0],
        cooldown: 5,
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

    Medic: new Role("Medic").setVisual('C6FFFB'),  // Медик
}

export {roles_crew}