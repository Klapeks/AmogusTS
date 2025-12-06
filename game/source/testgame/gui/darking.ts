import { HexColor } from "../../engine/Color";
import { Game } from "../../engine/Game";
import { FullscreenSprite, StaticSprite } from "../../engine/Sprite"
import { OnecolorTexture } from "../../engine/Texture";

let darkness: StaticSprite;

let darking = {
    show(time_ms = 500, parts = 30) {
        if (!darkness) {
            darkness = FullscreenSprite(new OnecolorTexture(HexColor('000000')));
        }
        darkness.opacity = time_ms===0 ? 1 : 0;
        Game.getScene().LayerGUI.add(darkness);
        if (time_ms > 0) {
            for (let i = 1; i <= parts; i++) {
                setTimeout(() => {
                    darkness.opacity = i/parts;
                }, time_ms*i/parts);
            }
        }
        setTimeout(() => {
            darkness.opacity = 1;
        }, time_ms);
        return time_ms;
    },
    hide(time_ms = 500, parts = 30) {
        if (time_ms > 0) {
            for (let i = 1; i <= parts; i++) {
                setTimeout(() => {
                    darkness.opacity = 1-i/parts;
                }, time_ms*i/parts);
            }
        }
        setTimeout(() => {
            Game.getScene().LayerGUI.remove(darkness);
        }, time_ms);
        return time_ms;
    }
}

export {darking}