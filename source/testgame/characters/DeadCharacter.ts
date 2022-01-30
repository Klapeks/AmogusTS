import { Game } from "../../engine/Game";
import { Location } from "../../engine/Location";
import { Sprite } from "../../engine/Sprite";
import { Character } from "./Character";

let timeOfDeath = 1000; //in Milis

class DeadCharacter {
    private _character: Character;
    private _sprite: Sprite;
    constructor(character: Character) {
        this._character = character;
        this._sprite = new Sprite(character.getTextures().dead.texture,
            new Location(character.getLocation().x,character.getLocation().y))
            .setSize(Math.abs(character.getSprite().width), character.getSprite().height)
            .setSplitting(0, 0, character.getTextures().dead.width, character.getTextures().dead.height)
            .setHideInDark(true);

        Game.getScene().addDynamicSprite(this._sprite);
        this.playDeath();
        // this._animation = character.getTextures().dead.length;
    }
    // private _animation = 0;
    // updateDeath() {
    //     if (this._animation==0) return;
    //     this._animation-=0.4;
    //     if (this._animation<0) this._animation = 0;
    //     this._sprite.setTexture(this._character.getTextures().dead[this._character.getTextures().dead.length - Math.floor(this._animation) - 1])
    // }
    playDeath() {
        const dead = this._character.getTextures().dead;
        for (let i = 0; i < this._character.getTextures().dead.amount; i++){
            setTimeout(() => {
                this._sprite.setSplitting(
                    i%dead.amount_per_line*dead.width,
                    Math.floor(i/dead.amount_per_line)*dead.height,
                    dead.width, dead.height
                );
            }, timeOfDeath * i / (this._character.getTextures().dead.amount-1));
        }
    }
    getCharacter(){
        return this._character;
    }
    getSprite(){
        return this._sprite;
    }
}

export {DeadCharacter};