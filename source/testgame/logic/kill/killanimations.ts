import { Game } from "../../../engine/Game";
import { BiLocation, Size } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { Sprite, StaticSprite } from "../../../engine/Sprite";
import { Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { CharacterFuncs } from "../../characters/CharFuncs";
import { Characters } from "../charslog";
import { caller } from "../meeting/caller";
import { killanimation_logic } from "./ka_logic";

type FramesInfo = {
    multiply?: number,
    impostor: BiLocation,
    crewmate: BiLocation,
    crewmateTexture: Texture,
    additional?: BiLocation,
    additionalTexture?: Texture,
    time?: number,
    waiting?: number,
    amount: number,
    killSound?: Sound
}

let _killerSprite: StaticSprite, _crewmateSprite: StaticSprite, _additionalSprite: Sprite;

abstract class KillAnimation {
    protected _frameInfo: FramesInfo;
    constructor(framesInfo: FramesInfo) {
        this._frameInfo = framesInfo;
        this._frameInfo.multiply = this._frameInfo.multiply || 1;
        this._frameInfo.time = this._frameInfo.time || 1200;
        this._frameInfo.waiting = this._frameInfo.waiting || 200;
    }
    abstract getImpostorTexture(impostor: Character): Texture;
    onGameStarted() {
        this._frameInfo.crewmateTexture = CharacterFuncs.cloneFiltering(this._frameInfo.crewmateTexture, Characters.main.getColor());
    }
    play(killer: Character) {
        if (killanimation_logic.isAnimationPlaying) return;
        killanimation_logic.isAnimationPlaying = true;
        killanimation_logic.playKillMusic();
        
        
        const {crewmate, impostor, multiply, additional} = this._frameInfo;
        
        _crewmateSprite = new StaticSprite(this._frameInfo.crewmateTexture)
                        .setSize(crewmate.width*multiply, crewmate.height*multiply)
                        .setLocation(crewmate.x, crewmate.y)
                        .setSplitting(0, 0, crewmate.width, crewmate.height)
                        .setPriority(55);

        _killerSprite = new StaticSprite(this.getImpostorTexture(killer))
                        .setSize(impostor.width*multiply, impostor.height*multiply)
                        .setLocation(impostor.x, impostor.y)
                        .setSplitting(0, 0, impostor.width, impostor.height)
                        .setPriority(55);

        if (this._frameInfo.additionalTexture && additional) 
                _additionalSprite = new StaticSprite(this._frameInfo.additionalTexture)
                        .setSize(additional.width*multiply, additional.height*multiply)
                        .setLocation(additional.x, additional.y)
                        .setSplitting(0, 0, additional.width, additional.height)
                        .setPriority(55);

        caller.call(() => {
            Game.getScene().addUpperSprite(_killerSprite, _additionalSprite, _crewmateSprite);
            for (let i = 0; i < this._frameInfo.amount; i++) {
                setTimeout(() => {
                    if (i===0 && this._frameInfo.killSound) this._frameInfo.killSound.play();
                    _crewmateSprite.setSplitting(0, crewmate.height*i, crewmate.width, crewmate.height);
                    _killerSprite.setSplitting(0, impostor.height*i, impostor.width, impostor.height);
                    _additionalSprite?.setSplitting(0, additional.height*i, additional.width, additional.height);
                }, this._frameInfo.waiting+this._frameInfo.time * i / (this._frameInfo.amount-1));
            }
        }, this._frameInfo.time+this._frameInfo.waiting*2, () => {
            Game.getScene().removeUpperSprite(_killerSprite, _additionalSprite, _crewmateSprite);
            killanimation_logic.isAnimationPlaying = false;
            _killerSprite = null;
            _crewmateSprite = null;
            _additionalSprite = null;
        })
    }
}

export {KillAnimation, FramesInfo};