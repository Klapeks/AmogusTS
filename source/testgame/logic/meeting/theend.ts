import { ClickingButton } from "../../../engine/Button";
import { Color, HexColor } from "../../../engine/Color";
import { Game } from "../../../engine/Game";
import { Screen } from "../../../engine/Screen";
import { StaticSprite } from "../../../engine/Sprite";
import { Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { config } from "../../config";
import { gui_sounds } from "../../gui/gui_sounds";
import { Role } from "../../roles/role";
import { Roles } from "../../roles/roles";
import { Characters } from "../charslog";
import { introducing } from "./introducing";

let resetButton: ClickingButton;

let reset: () => void;

let theend = {
    load() {
        resetButton = new ClickingButton(new Texture('gui/mainmenu/button.png'))
                .setHoverTexture(new Texture('gui/mainmenu/button2.png'));
        resetButton.getSprite().setSize(300,150)
                .setLocationByCenter(Screen.half_width*0.5, Screen.half_height*1.75)
                .setPriority(80);
        resetButton.hidden = true;
        resetButton.setOnClick(() => {
            gui_sounds.select.play();
            reset(); reset = undefined;
            resetButton.hidden = true;
            Game.getScene().removeUpperSprite(resetButton.getSprite());
        }).setOnHover(() => {
            gui_sounds.hover.play();
        });
        Game.eventListeners.addMouseClick((x,y) => {
            if (!introducing.isIntroducing) return;
            if (resetButton.hidden) return;
            resetButton.doClick({posX: x, posY: y});
        })
    },
    update() {
        if (!introducing.isIntroducing) return;
        if (resetButton.hidden) return;
        resetButton.update(Game.mouseinfo);
    },
    end(role: Role, neutral_character?: Character) {
        if (introducing.isIntroducing) return;
        reset = undefined;
        const characterSprites = new Array<StaticSprite>();
        let background: Color;

        let title = "Победа!"
        let color = HexColor("00FFFF");
        let fontsize = 200;

        switch(role.type) {
            case "neutral": {
                if (!neutral_character) {
                    if (Characters.main.getRole().type==="neutral")
                        neutral_character = Characters.main
                    neutral_character = Characters.another
                        .filter(ch => ch.getRole().type==="neutral")[0];
                }
                background = color = neutral_character.getRole().color;
                title = `${neutral_character.getNickname()} победил!`;
                fontsize = 175;

                characterSprites.push(introducing.createCharacterSprite(neutral_character, 0));
                if (role === Roles.Melok) {
                    characterSprites[0].setSize(characterSprites[0].width/2, characterSprites[0].height/2)
                            .setLocationByCenter(
                                introducing.charactersLocation.centerx,
                                introducing.charactersLocation.centery
                            );
                }
                break;
            }
            case "impostor": {
                background = HexColor('FF0000');
                color = HexColor("FF0000");
                title = "Победа импосетров!";
                fontsize = 175;

                let k = 0;
                if (Characters.main.getRole().type==="impostor") {
                    characterSprites.push(introducing.createCharacterSprite(Characters.main, 0))
                    k = -3
                }
                for (let ch of Characters.another) {
                    if (ch.getRole().type !== "impostor") continue;
                    characterSprites.push(introducing.createCharacterSprite(ch, k))
                    if (k > 0) k=-k-3
                    else if (k < 0) k=-k;
                    else k = -3;
                }
                break;
            }
            default: {
                background = HexColor('00FFFF');
                let i = 0;
                if (Characters.main.getRole().type==="crewmate") {
                    characterSprites.push(introducing.createCharacterSprite(Characters.main, 0))
                    i++;
                } else {
                    color = HexColor("FF0000");
                    title = "Поражение :(";
                }
                Characters.another.forEach(ch => {
                    if (ch.getRole().type !== "crewmate") return;
                    if (i%2===1) {
                        characterSprites.push(introducing.createCharacterSprite(ch, i+1))
                    } else {
                        characterSprites.push(introducing.createCharacterSprite(ch, -i))
                    }
                    i++;
                })
            }
            break;
        }
        const opt = introducing.introduce({
            background, color,
            sound: role.getWinSound(),
            sprites: characterSprites.reverse(),
            text: title, fontsize,
            timings: {
                ...config.starting_time,
                wait_dark_diffusion: 0
            }
        });
        reset = opt.remove;
        opt.introduceText.setOpacity(1);

        setTimeout(() => {
            resetButton.hidden = false;
            Game.getScene().addUpperSprite(resetButton.getSprite());
        }, config.starting_time.apear_main);
    }
}


export {theend};