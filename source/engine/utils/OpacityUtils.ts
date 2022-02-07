import { Sprite } from "../Sprite";

let OpacityUtils = {
    opacityAnimation(sprite: Sprite, settings: {time: number, from?: number, to?: number, func?: (i: number) => void}) {
        if (Number.isNaN(settings.from)) settings.from = 0;
        if (Number.isNaN(settings.to)) settings.to = 1;
        if (!settings.func) settings.func = (i) => sprite.opacity = i;
        const {time, from, to} = settings;
        
        if (from < to){
            const i_part = 1/(to-from);
            settings.func(from);
            for (let i = from; i < to; i+=0.1) {
                setTimeout(() => settings.func(i), time*(i-from)*i_part);
            }
            setTimeout(() => settings.func(to), time);
        } else {
            const i_part = 1/(from-to);
            settings.func(from);
            for (let i = to; i < from; i+=0.1) {
                setTimeout(() => settings.func(i), time*(1-(i-to)*i_part));
            }
            setTimeout(() => settings.func(to), time);
        }
    }

}

export {OpacityUtils};