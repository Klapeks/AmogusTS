import { OpacityUtils } from "../../../engine/utils/OpacityUtils";
import { Character } from "../../characters/Character";
import { config } from "../../config";
import { logic_buttons } from "../../logic/buttons";
import { Characters } from "../../logic/charslog";


let role_vanisher = {
    vanish(character: Character) {

        const opacity = Characters.main.getRole().type==="impostor"
            ? config.roles.vanisher.vanish_opacity : 0;

        OpacityUtils.opacityAnimation(character.getSprite(), {
                time: config.roles.vanisher.vanish_time,
                from: 1,
                to: opacity
            });

        const b = logic_buttons.AdditionalButton[0];
        b.resetModifiedCooldown({
            color: "#00FF00",
            afterEnd: () => {
                OpacityUtils.opacityAnimation(character.getSprite(), {
                        time: config.roles.vanisher.vanish_time,
                        from: opacity,
                        to: 1
                    });
                b.resetModifiedCooldown();
                b.cooldown(5);
            },
            vibing: 3
        })
    }
}

export {role_vanisher}