import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { killanimation_logic } from "../logic/kill/ka_logic";
import { role_angel } from "./special/role_angel";
import { Role } from "./role";
import { meeting } from "../logic/meeting/meeting";
import { role_medic } from "./special/role_medic";
import { Sound } from "../../engine/Sound";
import { HexColor } from "../../engine/Color";

let detectiveSound: Sound;

const roles_crew = {
    Crewmate: new Role('Crewmate').setVisual('00FFFF'),  // Член экипажа

    Capitan: new Role("Capitan").setVisual('65B1F9'),  // Капитан
    Medium: new Role("Medium").setVisual('D09DFF'),  // Ясновидящий

    Engineer: new Role("Engineer").settings({ color: '92BAC3', name: "Инженер", usevents: true }),  // Инженер
    Detective: new Role("Detective")
        .settings({ color: 'C0FF00', name: "Детектив" })
        .setAction({
            button_texture: [1,1],
            cooldown: 5,
            select: "any",
            act: (ch) => {
                ch.showRoleplate();
                detectiveSound?.play();
                if (ch.getRole().type === "impostor") {
                    ch.setNicknameColor(HexColor('FF0000'))
                }
            }
        }).setOnLoad(() => {
            detectiveSound = new Sound('roles/detective.wav');
        }),  

    Altruist: new Role("Altruist")
        .settings({ color: 'C0FF00', name: "Детектив" })
        .setVisual('E7472F').setAction({
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

    General: new Role("General")
        .settings({ color: '00B17A', name: "Генерал" })
        .setAction({
            button_texture: [1,0],
            cooldown: 120,
            select: "noone",
            act: (ch) => {
                meeting.call(Characters.main, "meeting");
            }
        }),  // Генерал

    Sheriff: new Role("Sheriff")
        .settings({ color: 'FFA500', name: "Шериф" })
        .setAction({
            button_texture: [0,1],
            cooldown: 5,
            select: "any",
            act: (ch) => {
                logic_kill.kill(ch, Characters.main, ch.getRole().type!=="crewmate");
                if (ch.getRole().type==="crewmate") killanimation_logic.play(Characters.main);
            }
        }),  // Шериф

    Angel: new Role('Angel')
        .settings({ color: '73BAFF', name: "Ангел-Хранитель" })
        .setAction({
            button_texture: [0,0],
            cooldown: 5,
            select: "any",
            act: (ch) => { role_angel.save(ch); }
        }).setOnLoad(role_angel.load),  // Ангел-Хранитель

    Medic: new Role("Medic")
        .settings({ color: 'C6FFFB', name: "Медик" })
        .setAction({
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