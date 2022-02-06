import { HexColor } from "../../engine/Color";
import { Game } from "../../engine/Game";
import { Screen } from "../../engine/Screen";
import { Sound } from "../../engine/Sound";
import { StaticSprite } from "../../engine/Sprite";
import { OnecolorTexture } from "../../engine/Texture";
import { Character } from "../characters/Character";
import { config } from "../config";
import { logic_buttons } from "../logic/buttons";
import { Characters } from "../logic/charslog";
import { GameLogic } from "../logic/gamelogic";
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
        this.setUseVents(true);
    }
}

let isFreeze = false;
let freezeSprite: StaticSprite;
let freezeSound: Sound;

const roles_impostors = {
    Impostor: new ImpostorRole('Impostor').settings({ color: 'FF0000', name: "Импостер" }),

    Shapeshifter: new ImpostorRole("Shapeshifter").settings({ color: '9A1F27', name: "Оборотень" }),  // Оборотень


    Sniper: new ImpostorRole("Sniper").settings({ color: 'FF4822', name: "Снайпер"}),  // Снайпер
    
    Saran4a: new ImpostorRole("Saran4a").settings({ color: '737373', name: "Саранча", usevents: "all"}),  // Саранча

    Camouflager: new ImpostorRole("Camouflager")
        .settings({ color: '029717', name: "Камуфляжер" })
        .addAdditionalAction({
            select: "noone",
            cooldown: 15,
            button_texture: [2,2],
            act: () => {
                const f = (character: Character, o:number) => {character.getSprite().setFilter('brightness', o);} 
                f(Characters.main, 0);
                Characters.another.forEach(ch => f(ch, 0));
                const b = logic_buttons.AdditionalButton[0];
                b.setModifiedCooldown('#555555', () => {
                    f(Characters.main, undefined);
                    Characters.another.forEach(ch => f(ch, undefined));
                    b.resetModifiedCooldown();
                    b.cooldown(30);
                })
            }
        }),  // Камуфляжер

    Freezer: new ImpostorRole("Freezer")
        .settings({ color: 'C9CAFF', name: "Холодильник" })
        .addAdditionalAction({
            select: "noone",
            cooldown: 10,
            button_texture: [2,2],
            act: () => {
                isFreeze = true;
                const b = logic_buttons.AdditionalButton[0];
                Game.getScene().addUpperSprite(freezeSprite);
                freezeSound.play();
                b.setModifiedCooldown('#00FFFF', () => {
                    isFreeze = false;
                    Game.getScene().removeUpperSprite(freezeSprite);
                    Characters.main.getSprite().opacity = 1;
                    b.resetModifiedCooldown();
                    b.cooldown(30);
                })
            }
        }).setOnLoad(()=>{
            freezeSound = new Sound('roles/freezer.mp3')
            freezeSprite = new StaticSprite(new OnecolorTexture(HexColor('00CDFF')))
                    .setSize(Screen.width, Screen.height)
                    .setOpacity(0.3).setPriority(10);
            GameLogic.eventListeners.onmove.addEvent(ch => {
                if (ch.getRole().type === "impostor") return true;
                return !isFreeze;
            })
            GameLogic.eventListeners.character_canidle.addEvent(ch => { return !isFreeze; })
        }),  // Холодильник

    Vanisher: new ImpostorRole("Vanisher")
        .settings({ color: 'FFFFFF', name: "Невидимка" })
        .addAdditionalAction({
            select: "noone",
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

    Janitor: new ImpostorRole("Janitor")
        .settings({ color: 'DB006D', name: "Санитар" })
        .addAdditionalAction({
            select: "deadbody",
            cooldown: 25,
            button_texture: [1, 2],
            act: (ch) => {
                ch.deadbody?.delete();
            }
        }),  // Санитар
}

export {roles_impostors}