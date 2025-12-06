import { Character } from "../../characters/Character";
import { logic_buttons } from "../../logic/buttons";
import { Characters } from "../../logic/charslog";
import { AmogusTextures } from "../../textures";


let shapeshifterCharacter: Character;
let shapeshifterDefaultTexture: AmogusTextures;
let shapeshifterDefaultNickname: string;

let role_shapeshifter = {
    setTarget(ch: Character) {
        shapeshifterCharacter = ch;
    },
    shift(character: Character) {
        shapeshifterDefaultTexture = character.getTextures();
        shapeshifterDefaultNickname = character.getNickname();
        character.setAmogusTextures(shapeshifterCharacter.getTextures());
        character.setNickname(shapeshifterCharacter.getNickname());
    },
    unshift(character: Character) {
        character.setAmogusTextures(shapeshifterDefaultTexture);
        character.setNickname(shapeshifterDefaultNickname);
        shapeshifterDefaultTexture = null;
        shapeshifterDefaultNickname = null;
    },
    clickShiftButton() {
        if (!shapeshifterCharacter) return;
        role_shapeshifter.shift(Characters.main);

        const b = logic_buttons.AdditionalButton[1];
        logic_buttons.AdditionalButton[1].unselect();
        b.resetModifiedCooldown({
            color: '#9A1F27',
            afterEnd: role_shapeshifter.clickUnshiftButton,
            noopacity: true,
            cd_action: role_shapeshifter.clickUnshiftButton,
            vibing: 3
        });
        setTimeout(() => {
            logic_buttons.AdditionalButton[1].select();
        }, 1000);
    },
    clickUnshiftButton() {
        role_shapeshifter.unshift(Characters.main);

        const b = logic_buttons.AdditionalButton[1];
        b.setModifiedCooldown('white', () => {
            b.resetModifiedCooldown();
            if (shapeshifterCharacter) {
                logic_buttons.AdditionalButton[1].select();
            }
        })
        b.cooldown(5);
    }
};

export {role_shapeshifter};