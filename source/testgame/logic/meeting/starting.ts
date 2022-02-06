import { Color, HexColor, RgbColor } from "../../../engine/Color";
import { Game } from "../../../engine/Game";
import { LinkedLocation, Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { StaticSprite } from "../../../engine/Sprite";
import { OnecolorTexture, TextTexture, Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { config } from "../../config";
import { darking } from "../../gui/darking";
import { Role } from "../../roles/role";
import { Roles } from "../../roles/roles";
import { Characters } from "../charslog";
import { GameLogic } from "../gamelogic";
import { introducing } from "./introducing";

let roundstartSound: Sound;

let charactersLocation = {
    centerx: Screen.half_width,
    centery: Screen.half_height*4/3,
    dy: 30, dx: 70,
    mainSize: 500,
    size: 400,
    dsize: 10
}

let createSprite = (character: Character, i: number): StaticSprite => {
    const x = charactersLocation.centerx - i*charactersLocation.dx + i*charactersLocation.dsize - (i?i/Math.abs(i)*charactersLocation.dx/2:0);
    const y = charactersLocation.centery - Math.abs(i)*charactersLocation.dy - (i===0?charactersLocation.dy/2:0);
    const s = i===0 ? charactersLocation.mainSize : (charactersLocation.size - Math.abs(i)*charactersLocation.dsize);
    return new StaticSprite(character.getTextures().static)
            .setSize(s*(i<0?1:-1),s)
            .setLocationByCenter(x,y)
            .setPriority(75);
}

let starting = {
    load() {
        roundstartSound = new Sound('roundstart.wav', 'effects');
    },
    show(role: Role) {
        if (introducing.isIntroducing) return;
        const characterSprites = new Array<StaticSprite>();
        const mainCharSprite = createSprite(Characters.main, 0).setOpacity(0).setPriority(80);
        characterSprites.push(mainCharSprite);

        let background: Color;
        switch (role.type) {
            case "impostor": {
                background = HexColor('FF0000');
                let k = -3;
                for (let ch of Characters.another) {
                    if (ch.getRole().type !== "impostor") continue;
                    if (k > 0) {
                        characterSprites.push(createSprite(ch, k))
                        k=-k-3
                    }else if (k < 0) {
                        characterSprites.push(createSprite(ch, k))
                        k=-k;
                    }
                }
                break;
            }
            case "neutral": {
                background = role.color;
                if (role === Roles.Melok) {
                    mainCharSprite.setSize(mainCharSprite.width/2, mainCharSprite.height/2)
                            .setLocationByCenter(charactersLocation.centerx,  charactersLocation.centery)
                }
                break;
            }
            default: {
                background = HexColor('00FFFF');
                for (let i = 0; i < Characters.another.length; i+=2){
                    characterSprites.push(createSprite(Characters.another[i], i+2))
                    if (Characters.another.length > i+1) {
                        characterSprites.push(createSprite(Characters.another[i+1], -i-2))
                    }
                }
                break;
            }
        }
        const opt = introducing.introduce({
            background,
            color: role.color,
            sound: roundstartSound,
            sprites: characterSprites.reverse(),
            text: role.name,
            timings: { ...config.starting_time,
                wait_dark_diffusion: config.starting_time.apear_main/2
            }
        })

        const dap2 = config.starting_time.apear_main_iteration_time/config.starting_time.apear_main;
        for (let i = 0; i < config.starting_time.apear_main; i+=config.starting_time.apear_main_iteration_time) {
            setTimeout(() => {
                mainCharSprite.opacity += dap2;
                opt.introduceText.opacity += dap2;
                opt.introduceText.getLocation().y += opt.dap*25;
            }, i);
        }

        // setTimeout(() => {
        //     // Game.getScene().removeUpperSprite(blackRect, characterSprite);
        //     // isStarting = false;
        //     // characterSprite = null;
        // }, config.starting_time.apear);
    }
}

export {starting};