import { Color } from "../../engine/Color";
import { Location } from "../../engine/Location";
import { Texture } from "../../engine/Texture";
import { Retexturing } from "../../engine/utils/Retexturing";
import { textures } from "../textures";
import { Character } from "./Character";

class SelectedCharacter extends Character {
    selcolor: Color;
    constructor(location?:Location, color: Color = {r:255, g:150, b:0}) {
        super(-128, location);
        this.setColor(null, null, null);
        this.selcolor = color;
    }

    selectedCharacter: Character;
    select(character: Character){
        this.selectedCharacter = character;
        if (character) {
            this.getSprite().setLocation(character.getLocation().x, character.getLocation().y);
            this.getSprite().setSize(character.getSprite().width,character.getSprite().height);
            this.walkAnimationFrame = character.walkAnimationFrame;
            this.getSprite().width = character.getSprite().width;
            this.getSprite().margin = character.getSprite().margin;
            this.hidden = false;
        } else {
            this.hidden = true;
        }
    }
    
    protected cloneFiltering(texture: Texture): Texture {
        texture = new Texture(texture.getPath(),null,() => {
            texture.setImage(Retexturing.oneColor(texture.getImage(), this.selcolor, 50));
        });
        return texture;
    }
    setColor(foreground: Color, background: Color, mask: Color = {r:120,g:200,b:220}) {
        let newwalk = textures.amogus.walk;
        newwalk.texture = this.cloneFiltering(newwalk.texture);
        this._textures = {
            idle: this.cloneFiltering(textures.amogus.idle),
            walk: newwalk,
            static: null,
            dead: null, vent: null,
            meeting: null, eject: null,
            killanimations: null
        }
        this.idle();
        return this;
    }
    set walkAnimationFrame(frame: number){
        if (frame === 0) this.idle();
        else {
            this._walkanimation = frame;
            this.playWalkAnimation(0);
        }
    }
}

export {SelectedCharacter}