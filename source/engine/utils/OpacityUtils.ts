import { Sprite } from "../Sprite";

let OpacityUtils = {
    opacityAnimation(sprite: Sprite, time: number, opacity = 0, reverse = false) {
        const i_part = 1/(1-opacity);
        if (reverse){
            sprite.opacity = 0;
            for (let i = opacity; i < 1; i+=0.1) {
                setTimeout(() => {
                    sprite.opacity = i;
                }, time*(i-opacity)*i_part);
            }
            setTimeout(() => {
                sprite.opacity = 1;
            }, time);
        } else {
            sprite.opacity = 1;
            for (let i = opacity; i < 1; i+=0.1) {
                setTimeout(() => {
                    sprite.opacity = i;
                }, time*(1-(i-opacity)*i_part));
            }
            setTimeout(() => {
                sprite.opacity = opacity;
            }, time);
        }
    }

}

export {OpacityUtils};