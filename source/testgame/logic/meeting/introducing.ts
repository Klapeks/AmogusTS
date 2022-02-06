import { Color, RgbColor } from "../../../engine/Color"
import { Game } from "../../../engine/Game";
import { LinkedLocation } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { StaticSprite } from "../../../engine/Sprite"
import { OnecolorTexture, TextTexture, Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { darking } from "../../gui/darking";
import { GameLogic } from "../gamelogic";

let backcolor: Texture;

let charactersLocation = {
    centerx: Screen.half_width,
    centery: Screen.half_height*4/3,
    dy: 30, dx: 70,
    mainSize: 500,
    size: 400,
    dsize: 10
}

let dark: {
    left: StaticSprite,
    left_sq: StaticSprite
    right: StaticSprite,
    right_sq: StaticSprite
};

type IntroducingTime = {
    apear_iteration_time: number,
    apear: number,
    wait_dark_diffusion: number,
    sum: number // in ms
}

type IntroduceSettings = {
    text: string,
    color: Color,
    sprites: StaticSprite[],
    background: Color,
    sound: Sound,
    timings: IntroducingTime
};

let introducing = {
    isIntroducing: false,
    load() {
        GameLogic.eventListeners.onmove.addEvent(t => !introducing.isIntroducing);
        backcolor = new Texture('starting/introduce.png');
        const darkT = new Texture('starting/dark.png');
        const darkT2 = new OnecolorTexture(RgbColor(0,0,0));
        dark = {
            right: new StaticSprite(darkT)
                .setSize(200, Screen.height)
                .setPriority(75),
            left: new StaticSprite(darkT)
                .setSize(-200, Screen.height)
                .setPriority(75),
            left_sq: null,
            right_sq: null
        }
        dark.right_sq = new StaticSprite(darkT2,
                new LinkedLocation(dark.right.getLocation(), {dx:dark.right.width, dy:0}))
                .setSize(Screen.half_width+200,Screen.height)
                .setPriority(75);
        dark.left_sq = new StaticSprite(darkT2,
                new LinkedLocation(dark.left.getLocation(), {dx:-Screen.half_width-200, dy:0}))
                .setSize(Screen.half_width+200,Screen.height)
                .setPriority(75);
    },
    introduce(settings: IntroduceSettings) {
        if (introducing.isIntroducing) return;
        introducing.isIntroducing = true;
        settings.sound.play();

        dark.right.setLocationByCenter(Screen.half_width-200,Screen.half_height);
        dark.left.setLocationByCenter(Screen.half_width+200,Screen.half_height);

        const backColorTT = new Texture(backcolor.getPath(), null, () => {
            backColorTT.setImage(Game.getScene().filterImage(backColorTT.getImage(), (imgdata: any) => {
                const data = imgdata.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i+3]===0) continue;
                    data[i] = settings.background.r;
                    data[i+1] = settings.background.g;
                    data[i+2] = settings.background.b;
                }
                return imgdata;
            }));
        });
        const backcolorSprite = new StaticSprite(backColorTT).setSize(512*3, 256*3)
                    .setLocationByCenter(Screen.half_width, Screen.height*2/3)
                    .setPriority(75);
        const blackRect = new StaticSprite(new OnecolorTexture(RgbColor(0,0,0)))
                .setSize(Screen.width, Screen.height)
                .setPriority(75);
                
        const introduceText = new StaticSprite(new TextTexture(settings.text, 'arial')
                    .setColor(`rgb(${settings.color.r},${settings.color.g},${settings.color.b})`)
                    .setFontSize(200).setAlign('center'))
                    .setSize(Screen.width, 0)
                    .setLocation(Screen.half_width, 275)
                    .setOpacity(0)
                    .setPriority(75);

        Game.getScene().addUpperSprite(blackRect, backcolorSprite, 
                ...settings.sprites, ...Object.values(dark), introduceText);

        const dap = settings.timings.apear_iteration_time/settings.timings.apear;
        for (let i = 0; i < settings.timings.apear; i+=settings.timings.apear_iteration_time) {
            setTimeout(() => {
                dark.left.getLocation().x -= Screen.half_width*dap;
                dark.right.getLocation().x += Screen.half_width*dap;
            }, settings.timings.wait_dark_diffusion + i);
        }

        setTimeout(() => {
            darking.show(0);
            setTimeout(() => {
                darking.hide();
                Game.getScene().removeUpperSprite(blackRect, backcolorSprite, 
                        ...settings.sprites, ...Object.values(dark), introduceText);
                introducing.isIntroducing = false;
            }, 1);
        }, settings.timings.sum);
        return {introduceText, dap}
    },
    createCharacterSprite(character: Character, i: number): StaticSprite {
        const x = charactersLocation.centerx - i*charactersLocation.dx + i*charactersLocation.dsize - (i?i/Math.abs(i)*charactersLocation.dx/2:0);
        const y = charactersLocation.centery - Math.abs(i)*charactersLocation.dy - (i===0?charactersLocation.dy/2:0);
        const s = i===0 ? charactersLocation.mainSize : (charactersLocation.size - Math.abs(i)*charactersLocation.dsize);
        return new StaticSprite(character.getTextures().static)
                .setSize(s*(i<0?1:-1),s)
                .setLocationByCenter(x,y)
                .setPriority(75);
    },
    get charactersLocation() {
        return charactersLocation;
    }
}

export {introducing, IntroduceSettings}