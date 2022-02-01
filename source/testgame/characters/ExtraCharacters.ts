import { Color } from "../../engine/Color";
import { Location } from "../../engine/Location";
import { Texture } from "../../engine/Texture";
import { Retexturing } from "../../engine/utils/Retexturing";
import { textures } from "../textures";
import { Character } from "./Character";

class SelectedCharacter extends Character {
    constructor(location?:Location) {
        super(-128, location);
        this.setColor(null, null, null);
    }
    
    protected cloneFiltering(texture: Texture): Texture {
        texture = new Texture(texture.getPath(),null,() => {
            texture.setImage(Retexturing.oneColor(texture.getImage(), {r:255, g:150, b:0}, 50));
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