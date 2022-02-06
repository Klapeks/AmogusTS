import { Color, HexColor, RgbColor } from "../../../engine/Color";
import { Sound } from "../../../engine/Sound";
import { StaticSprite } from "../../../engine/Sprite";
import { config } from "../../config";
import { darking } from "../../gui/darking";
import { Role } from "../../roles/role";
import { Roles } from "../../roles/roles";
import { Characters } from "../charslog";
import { introducing } from "./introducing";

let roundstartSound: Sound;

let starting = {
    load() {
        roundstartSound = new Sound('roundstart.wav', 'effects');
    },
    show(role: Role) {
        if (introducing.isIntroducing) return;
        const characterSprites = new Array<StaticSprite>();
        const mainCharSprite = introducing.createCharacterSprite(Characters.main, 0)
                .setOpacity(0).setPriority(80);
        characterSprites.push(mainCharSprite);

        let background: Color;
        switch (role.type) {
            case "impostor": {
                background = HexColor('FF0000');
                let k = -3;
                for (let ch of Characters.another) {
                    if (ch.getRole().type !== "impostor") continue;
                    if (k > 0) {
                        characterSprites.push(introducing.createCharacterSprite(ch, k))
                        k=-k-3
                    }else if (k < 0) {
                        characterSprites.push(introducing.createCharacterSprite(ch, k))
                        k=-k;
                    }
                }
                break;
            }
            case "neutral": {
                background = role.color;
                if (role === Roles.Melok) {
                    mainCharSprite.setSize(mainCharSprite.width/2, mainCharSprite.height/2)
                            .setLocationByCenter(
                                introducing.charactersLocation.centerx,
                                introducing.charactersLocation.centery
                            );
                }
                break;
            }
            default: {
                background = HexColor('00FFFF');
                for (let i = 0; i < Characters.another.length; i+=2){
                    characterSprites.push(introducing.createCharacterSprite(Characters.another[i], i+2))
                    if (Characters.another.length > i+1) {
                        characterSprites.push(introducing.createCharacterSprite(Characters.another[i+1], -i-2))
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

        setTimeout(() => {
            darking.show(0);
            setTimeout(() => {
                darking.hide();
                opt.remove();
            }, 1);
        }, config.starting_time.sum);
    }
}

export {starting};