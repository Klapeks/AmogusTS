import { Game } from "./Game";
import { BiLocation, Hitbox, Location } from "./Location";
import { Sprite } from "./Sprite";
import { Texture } from "./Texture";
import { Retexturing } from "./utils/Retexturing";

abstract class InteractableItem {
    protected _sprite: Sprite;
    protected _hilightsprite: Sprite;
    private _type: "upper" | "dynamic" | "back" = "dynamic";
    constructor(texture: Texture, location: BiLocation, type: "upper" | "dynamic" | "back" = "dynamic") {
        // this._loc = location;
        this._sprite = new Sprite(texture, new Location(location.x, location.y))// || this.getDeafultTexture()
                .setSize(location.width, location.height);
        this._type = type;
        this._hilightsprite = new Sprite(this.generateSelectedTexture(this._sprite.getTexture()), new Location(location.x, location.y))
                .setSize(location.width, location.height);
    }
    abstract use():void;
    registerSprite() {
        if (this._type === "back") {
            Game.getScene().addBackSprite(this._sprite, this._hilightsprite);
        } else if (this._type === "upper") {
            Game.getScene().addUpperSprite(this._sprite, this._hilightsprite);
        } else {
            Game.getScene().addDynamicSprite(this._sprite, this._hilightsprite);
        }
        return this._sprite;
    }
    userange: number | Hitbox = 100;
    setRange(userange: number | Hitbox){
        this.userange = userange;
        return this;
    }
    getSprite() {
        return this._sprite;
    }
    getLocation(){
        return this._sprite.getLocation();
    }
    getCenter(){
        return this._sprite.getCenter();
    }
    select() {
        this._hilightsprite.hidden = false;
    }
    unselect() {
        this._hilightsprite.hidden = true;
    }
    protected abstract generateSelectedTexture(texture: Texture): Texture;
}

export {InteractableItem}