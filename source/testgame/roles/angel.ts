import { Game } from "../../engine/Game";
import { Sound } from "../../engine/Sound";
import { Sprite } from "../../engine/Sprite";
import { Texture } from "../../engine/Texture";
import { Character } from "../characters/Character";
import { Characters } from "../logic/charslog";
import { gamelogic } from "../logic/gamelogic";
import { logic_kill } from "../logic/kill";

let saveTexture: Texture, saveBlowTexture: Texture;
let saveTextureInfo = { width: 512, height: 288, amount: 19 }
let saveBlowTextureInfo = { width: 544, height: 544, amount: 8 }
let time = 1350; // in ms

let saveSound: Sound;

let role_angel = {
    isSaveAnimation: false,
    load() {
        saveSound = new Sound('roles/angel/killsave.wav');
        saveTexture = new Texture('roles/angel/killsave.png');
        saveBlowTexture = new Texture('roles/angel/killsave_blow.png');
        gamelogic.eventListeners.onkill.addEvent(({character, killer}) => {
            if (character === Characters.another[1]) {
                const kiloc = killer.getLocation();
                const crloc = character.getLocation();
                role_angel.playSave(character,
                    killer ? (kiloc.x < crloc.x) : false, 
                    Math.atan((kiloc.y - crloc.y)/Math.abs(kiloc.x - crloc.x)),
                );
                return false;
            }
            return true;
        })
        gamelogic.eventListeners.onmove.addEvent(character => {
            if (character === Characters.main) return !role_angel.isSaveAnimation;
            return true;
        })
    },
    playSave(character: Character, reverse: boolean = false, degrees: number = 0) {
        const sumamount = saveTextureInfo.amount + saveBlowTextureInfo.amount;
        character.idle();
        if (character===Characters.main) {
            role_angel.isSaveAnimation = true;
            setTimeout(() => {
                role_angel.isSaveAnimation = false;
            }, time*saveTextureInfo.amount/sumamount);
        }
        const loc = character.getCenter();
        const shield = new Sprite(saveTexture)
                    .setSize(saveTextureInfo.width*(reverse?-1:1), saveTextureInfo.height)
                    .setLocationByCenter(loc.x, loc.y)
                    .setLocationYaw(degrees*(reverse?-1:1))
                    .setSplitting(0, 0, saveTextureInfo.width, saveTextureInfo.height);
        const blowshield = new Sprite(saveBlowTexture)
                    .setSize(saveBlowTextureInfo.width*(reverse?-1:1), saveBlowTextureInfo.height)
                    .setLocationByCenter(loc.x, loc.y)
                    .setLocationYaw(degrees*(reverse?-1:1))
                    .setSplitting(0, 0, saveBlowTextureInfo.width, saveBlowTextureInfo.height);
        blowshield.hidden = true;
        Game.getScene().addDynamicSprite(shield, blowshield);
        
        
        for (let i = 0; i < saveTextureInfo.amount; i++) {
            setTimeout(() => {
                if (i==0) saveSound.play();
                shield.setSplitting(0, i*saveTextureInfo.height, saveTextureInfo.width, saveTextureInfo.height);
            }, time*i/sumamount);
        }

        setTimeout(() => {
            shield.hidden = true;
            blowshield.hidden = false;
        }, time*saveTextureInfo.amount/sumamount);

        for (let i = 0; i < saveBlowTextureInfo.amount; i++) {
            setTimeout(() => {
                blowshield.setSplitting(0, i*saveBlowTextureInfo.height, saveBlowTextureInfo.width, saveBlowTextureInfo.height);
            }, time*(saveTextureInfo.amount+i)/sumamount);
        }

        setTimeout(() => {
            blowshield.hidden = true;
            Game.getScene().removeDynamicSprite(shield, blowshield);
        }, time);
    }
}

export {role_angel};