import { RgbColor } from "../../../engine/Color";
import { Game } from "../../../engine/Game";
import { LinkedLocation, Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { StaticSprite } from "../../../engine/Sprite";
import { OnecolorTexture, TextTexture, Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { config } from "../../config";
import { darking } from "../../gui/darking";
import { Role, Roles } from "../../roles/roles";
import { Characters } from "../charslog";
import { GameLogic } from "../gamelogic";

let roundstartSound: Sound;
let backcolor: Texture;
let dark: {
    left: StaticSprite,
    left_sq: StaticSprite
    right: StaticSprite,
    right_sq: StaticSprite
};

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
}

let starting = {
    isShowed: false,
    load() {
        roundstartSound = new Sound('roundstart.wav', 'effects');
        GameLogic.eventListeners.onmove.addEvent(t => !starting.isShowed);
        backcolor = new Texture('starting/crewmate.png');
        const darkT = new Texture('starting/dark.png');
        const darkT2 = new OnecolorTexture(RgbColor(0,0,0));
        dark = {
            right: new StaticSprite(darkT).setSize(200, Screen.height),
            left: new StaticSprite(darkT).setSize(-200, Screen.height),
            left_sq: null,
            right_sq: null
        }
        dark.right_sq = new StaticSprite(darkT2,
                new LinkedLocation(dark.right.getLocation(), {dx:dark.right.width, dy:0}))
                .setSize(Screen.half_width+200,Screen.height);
        dark.left_sq = new StaticSprite(darkT2,
                new LinkedLocation(dark.left.getLocation(), {dx:-Screen.half_width-200, dy:0}))
                .setSize(Screen.half_width+200,Screen.height);
    },
    show(role: Role) {
        if (starting.isShowed) return;
        starting.isShowed = true;
        roundstartSound.play();

        dark.right.setLocationByCenter(Screen.half_width-200,Screen.half_height);
        dark.left.setLocationByCenter(Screen.half_width+200,Screen.half_height);

        const backColorTT = new Texture(backcolor.getPath(), null, () => {
            backColorTT.setImage(Game.getScene().filterImage(backColorTT.getImage(), (imgdata: any) => {
                const data = imgdata.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i+3]===0) continue;
                    if (role.type === "impostor") {
                        data[i]=255;
                        data[i+1] = 0;
                        data[i+2] = 0;
                    } else if (role.type === "neutral") {
                        data[i] = role.color.r;
                        data[i+1] = role.color.g;
                        data[i+2] = role.color.b;
                    } else {
                        data[i] = 0;
                        data[i+1] = 255;
                        data[i+2] = 255;
                    }
                }
                return imgdata;
            }));
        });
        const backcolorSprite = new StaticSprite(backColorTT).setSize(512*3, 256*3)
                    .setLocationByCenter(Screen.half_width, Screen.height*2/3);
        const blackRect = new StaticSprite(new OnecolorTexture(RgbColor(0,0,0)), new Location(0,0))
                .setSize(Screen.width, Screen.height);

        const roleText = new StaticSprite(new TextTexture(role.name, 'arial')
                    .setColor(`rgb(${role.color.r},${role.color.g},${role.color.b})`)
                    .setFontSize(200).setAlign('center'))
                    .setSize(Screen.width, 0)
                    .setLocation(Screen.half_width, 275)
                    .setOpacity(0);

        const characterSprites = new Array<StaticSprite>();
        const mainCharSprite = createSprite(Characters.main, 0).setOpacity(0);

        switch (role.type) {
            case "impostor": {
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
                if (role === Roles.Melok) {
                    mainCharSprite.setSize(mainCharSprite.width/2, mainCharSprite.height/2)
                            .setLocationByCenter(charactersLocation.centerx,  charactersLocation.centery)
                }
                break;
            }
            default: {
                for (let i = 0; i < Characters.another.length; i+=2){
                    characterSprites.push(createSprite(Characters.another[i], i+2))
                    if (Characters.another.length > i+1) {
                        characterSprites.push(createSprite(Characters.another[i+1], -i-2))
                    }
                }
                break;
            }
        }

        Game.getScene().addUpperSprite(blackRect, backcolorSprite, 
                ...characterSprites.reverse(), ...Object.values(dark),
                mainCharSprite, roleText);

        const dap = config.starting_time.apear_iteration_time/config.starting_time.apear;
        for (let i = 0; i < config.starting_time.apear; i+=config.starting_time.apear_iteration_time) {
            setTimeout(() => {
                dark.left.getLocation().x -= Screen.half_width*dap;
                dark.right.getLocation().x += Screen.half_width*dap;
            }, config.starting_time.apear_main/2 + i);
        }
        const dap2 = config.starting_time.apear_main_iteration_time/config.starting_time.apear_main;
        for (let i = 0; i < config.starting_time.apear_main; i+=config.starting_time.apear_main_iteration_time) {
            setTimeout(() => {
                mainCharSprite.opacity += dap2;
                roleText.opacity += dap2;
                roleText.getLocation().y += dap*25;
            }, i);
        }

        setTimeout(() => {
            // Game.getScene().removeUpperSprite(blackRect, characterSprite);
            // isStarting = false;
            // characterSprite = null;
        }, config.starting_time.apear);


        setTimeout(() => {
            darking.show(0);
            setTimeout(() => {
                darking.hide();
                Game.getScene().removeUpperSprite(blackRect, backcolorSprite, 
                        ...characterSprites, ...Object.values(dark),
                        mainCharSprite, roleText);
                starting.isShowed = false;
            }, 1);
        }, config.starting_time.sum);
    }
}

export {starting};