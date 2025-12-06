import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { textures } from "../../textures";
import { KillAnimation } from "./killanimations";

const _originalSize = {width: 512, height: 256}
const _locationCenter = {x: Screen.width/2-_originalSize.width/2, y: Screen.height/2-_originalSize.height/2}
class KA_Alien extends KillAnimation {
    constructor(){
        super({
            amount: 20,
            impostor: {x: _locationCenter.x, y: _locationCenter.y, width:336, height: 256},
            crewmate: {x: _locationCenter.x + 512-332, y: _locationCenter.y, width:332, height: 256},
            additional: {x: _locationCenter.x + 120, y: _locationCenter.y, width:174, height: 256},
            additionalTexture: new Texture('amogus/killanimations/alien_add.png'),
            crewmateTexture: textures.crewkillanimation.alien,
            killSound: new Sound('kill/alien.wav')
        });
    }
    getImpostorTexture(impostor: Character): Texture {
        return impostor.getTextures().killanimations.alien;
    }
}

export {KA_Alien};