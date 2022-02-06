import { Character } from "../../characters/Character";
import { config } from "../../config";
import { logic_buttons } from "../../logic/buttons";
import { Characters } from "../../logic/charslog";


let role_vanisher = {
    vanish(character: Character) {

        const opacity = Characters.main.getRole().type==="impostor"
            ? config.roles.vanisher.vanish_opacity : 0;

        const i_part = 1/(1-opacity);
        for (let i = opacity; i < 1; i+=0.1) {
            setTimeout(() => {
                character.getSprite().opacity = i;
            }, config.roles.vanisher.vanish_time*(1-(i-opacity)*i_part));
        }
        setTimeout(() => {
            character.getSprite().opacity = opacity;
        }, config.roles.vanisher.vanish_time);

        const b = logic_buttons.AdditionalButton[0];
        b.setModifiedCooldown('#00FF00', () => {
            for (let i = opacity; i < 1; i+=0.1) {
                setTimeout(() => {
                    character.getSprite().opacity = i;
                }, config.roles.vanisher.vanish_time*(i-opacity)*i_part);
            }
            setTimeout(() => {
                character.getSprite().opacity = 1;
            }, config.roles.vanisher.vanish_time);
            b.resetModifiedCooldown();
            b.cooldown(5);
        })
    }
}

export {role_vanisher}