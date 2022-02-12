import { HexColor } from "../../../engine/Color";
import { Game } from "../../../engine/Game";
import { FullscreenSprite, StaticSprite } from "../../../engine/Sprite";
import { OpacityUtils } from "../../../engine/utils/OpacityUtils";
import { Character } from "../../characters/Character";
import { logic_buttons } from "../../logic/buttons";
import { Characters } from "../../logic/charslog";
import { GameLogic } from "../../logic/gamelogic";
import { theend } from "../../logic/meeting/theend";
import { Roles } from "../roles";

let fire: StaticSprite;

let role_arsonist = {
    checkFire() {
        if (Characters.main.getRole() !== Roles.Arsonist) return false;
        let b = true;
        Characters.another.forEach((ch) => {
            if (ch.isAlive && !ch.isInfected) b = false;
        });
        if (b) {
            logic_buttons.AdditionalButton[0].select();
        }
        return b;
    },
    load() {
        GameLogic.eventListeners.onkick.addEvent(() => {
            setTimeout(() => {
                role_arsonist.checkFire()
            }, 100);
        });
        fire = FullscreenSprite('roles/arsonist_end.png').setPriority(500);
    },
    dose(character: Character) { // Залив
        character.isInfected = true;
        character.setNicknameColor(HexColor('FF8500'));
        role_arsonist.checkFire();
    },
    ignite() { // жжечь
        if (!role_arsonist.checkFire()) return;

        OpacityUtils.opacityAnimation(fire, {time: 500, from: 0, to: 1});
        Game.getScene().addUpperSprite(fire);
        setTimeout(() => {
            theend.end(Roles.Arsonist, Characters.main);
        }, 250);
        setTimeout(() => {
            OpacityUtils.opacityAnimation(fire, {time: 500, from: 1, to: 0});
        }, 750);
        setTimeout(() => {
            Game.getScene().removeUpperSprite(fire);
        }, 1500);
    }
} 

export {role_arsonist};