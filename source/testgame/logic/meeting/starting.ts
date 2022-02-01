import { RgbColor } from "../../../engine/Color";
import { Game } from "../../../engine/Game";
import { LinkedLocation, Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { NullSprite, Sprite, StaticSprite } from "../../../engine/Sprite";
import { OnecolorTexture, Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { Role } from "../../characters/Role";
import { config } from "../../config";
import { Characters } from "../charslog";
import { gamelogic } from "../gamelogic";

let isStarting = false;

let roundstartSound: Sound;
let blackRect: StaticSprite;
let dark: {
    left: StaticSprite,
    left_sq: StaticSprite
    right: StaticSprite,
    right_sq: StaticSprite
};

let charactersLocation = {
    centerx: Screen.half_width,
    centery: Screen.half_height*4/3,
    dy: 15, dx: 70,
    mainSize: 500,
    size: 400,
}

let createSprite = (character: Character, i: number): StaticSprite => {
    const x = charactersLocation.centerx - i*charactersLocation.dx;
    const y = charactersLocation.centery - Math.abs(i)*charactersLocation.dy;
    const s = i===0 ? charactersLocation.mainSize : charactersLocation.size;
    return new StaticSprite(character.getTextures().static)
            .setSize(s*(i<0?1:-1),s)
            .setLocationByCenter(x,y)
}

let starting = {
    load() {
        roundstartSound = new Sound('roundstart.wav', 'effects');
        blackRect = new StaticSprite(new OnecolorTexture(RgbColor(0,0,0)), new Location(0,0))
                    .setSize(Screen.width, Screen.height);
        gamelogic.eventListeners.onmove.addEvent(t => !isStarting);
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
                .setSize(Screen.half_width,Screen.height);
        dark.left_sq = new StaticSprite(darkT2,
                new LinkedLocation(dark.left.getLocation(), {dx:-Screen.half_width, dy:0}))
                .setSize(Screen.half_width,Screen.height);
    },
    show(role: Role) {
        if (isStarting) return;
        isStarting = true;
        roundstartSound.play();

        dark.right.setLocationByCenter(Screen.half_width-200,Screen.half_height);
        dark.left.setLocationByCenter(Screen.half_width+200,Screen.half_height);

        let characterSprites = new Array<StaticSprite>();
        let mainCharSprite = createSprite(Characters.main, 0).setOpacity(0);

        for (let i = 0; i < Characters.another.length; i+=2){
            characterSprites.push(createSprite(Characters.another[i], i+2))
            if (Characters.another.length > i+1) {
                characterSprites.push(createSprite(Characters.another[i+1], -i-2))
            }
        }

        Game.getScene().addUpperSprite(blackRect, ...characterSprites.reverse(), ...Object.values(dark), mainCharSprite);

        const dap = config.starting_time.apear_iteration_time/config.starting_time.apear;
        for (let i = 0; i < config.starting_time.apear; i+=config.starting_time.apear_iteration_time) {
            setTimeout(() => {
                dark.left.getLocation().x -= Screen.half_width*dap;
                dark.right.getLocation().x += Screen.half_width*dap;
            }, config.starting_time.apear_main+i);
        }
        const dap2 = config.starting_time.apear_main_iteration_time/config.starting_time.apear_main;
        for (let i = 0; i < config.starting_time.apear_main; i+=config.starting_time.apear_main_iteration_time) {
            setTimeout(() => {
                mainCharSprite.opacity += dap2;
            }, i);
        }

        // for (let i = 0; i < config.starting_time.apear_opacity_times; i++) {
        //     setTimeout(() => {
        //         characterSprites.forEach(ch => {
        //             ch.opacity = i*delta_apear;
        //         });
        //     }, i*delta_apear*config.starting_time.apear);
        // }
        // setTimeout(() => {
        //     characterSprites.forEach(ch => {
        //         ch.opacity = 1;
        //     });
        // }, config.starting_time.apear);

        setTimeout(() => {
            // Game.getScene().removeUpperSprite(blackRect, characterSprite);
            // isStarting = false;
            // characterSprite = null;
        }, config.starting_time.apear);


        setTimeout(() => {
            Game.getScene().removeUpperSprite(blackRect, ...characterSprites, ...Object.values(dark), mainCharSprite);
            isStarting = false;
            characterSprites = characterSprites.filter(f=>false);
        }, config.starting_time.sum);
    }
}

export {starting};