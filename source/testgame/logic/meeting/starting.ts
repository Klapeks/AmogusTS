import { RgbColor } from "../../../engine/Color";
import { Game } from "../../../engine/Game";
import { Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { Sprite, StaticSprite } from "../../../engine/Sprite";
import { OnecolorTexture, Texture } from "../../../engine/Texture";
import { Role } from "../../characters/Role";
import { config } from "../../config";
import { Characters } from "../charslog";
import { gamelogic } from "../gamelogic";

let isStarting = false;

let roundstartSound: Sound;
let blackRect: StaticSprite;
let characterSprite: StaticSprite;

let charactersLocation = {
    dy: 50,
    dx: 50,
    dsize: 20
}

let starting = {
    load() {
        roundstartSound = new Sound('roundstart.wav', 'effects');
        blackRect = new StaticSprite(new OnecolorTexture(RgbColor(0,0,0)), new Location(0,0))
                    .setSize(Screen.width, Screen.height);
        gamelogic.eventListeners.onmove.addEvent(t => !isStarting);
    },
    show(role: Role) {
        if (isStarting) return;
        isStarting = true;
        roundstartSound.play();

        characterSprite = new StaticSprite(Characters.main.getTextures().static)
                .setSize(400, 400)
                .setLocationByCenter(Screen.half_width, Screen.half_height*4/3)
                .setOpacity(0);

        Game.getScene().addUpperSprite(blackRect, characterSprite);

        const delta_apear = 1/config.starting_time.apear_opacity_times;
        for (let i = 0; i < config.starting_time.apear_opacity_times; i++) {
            setTimeout(() => {
                characterSprite.opacity = i*delta_apear;
            }, i*delta_apear*config.starting_time.apear);
        }
        setTimeout(() => {
            characterSprite.opacity = 1;
        }, config.starting_time.apear);

        setTimeout(() => {
            // Game.getScene().removeUpperSprite(blackRect, characterSprite);
            // isStarting = false;
            // characterSprite = null;
        }, config.starting_time.apear);


        setTimeout(() => {
            Game.getScene().removeUpperSprite(blackRect, characterSprite);
            isStarting = false;
            characterSprite = null;
        }, config.starting_time.sum);
    }
}

export {starting};