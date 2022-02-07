import { Sprite } from "../Sprite";

let OpacityUtils = {
    opacityAnimation(sprite: Sprite, settings: {time: number, from?: number, to?: number}) {
        if (Number.isNaN(settings.from)) settings.from = 0;
        if (Number.isNaN(settings.to)) settings.to = 1;
        const {time, from, to} = settings;
        
        if (from < to){
            const i_part = 1/(to-from);
            sprite.opacity = from;
            for (let i = from; i < to; i+=0.1) {
                setTimeout(() => {
                    sprite.opacity = i;
                }, time*(i-from)*i_part);
            }
            setTimeout(() => {
                sprite.opacity = to;
            }, time);
        } else {
            const i_part = 1/(from-to);
            sprite.opacity = from;
            for (let i = to; i < from; i+=0.1) {
                setTimeout(() => {
                    sprite.opacity = i;
                }, time*(1-(i-to)*i_part));
            }
            setTimeout(() => {
                sprite.opacity = to;
            }, time);
        }
    }

}

export {OpacityUtils};