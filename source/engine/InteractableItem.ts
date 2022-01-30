import { Game } from "./Game";
import { BiLocation, Hitbox, Location } from "./Location";
import { Sprite } from "./Sprite";
import { Texture } from "./Texture";
import { Retexturing } from "./utils/Retexturing";

abstract class InteractableItem {
    protected _sprite: Sprite;
    protected _hilightsprite: Sprite;
    private _isBack = false;
    constructor(texture: Texture, location: BiLocation, isBack: boolean = false) {
        // this._loc = location;
        this._sprite = new Sprite(texture || this.getDeafultTexture(), new Location(location.x, location.y))
                .setSize(location.width, location.height);
        this._isBack = isBack;
        this._hilightsprite = new Sprite(this.generateSelectedTexture(this._sprite.getTexture()), new Location(location.x, location.y))
                .setSize(location.width, location.height);
    }
    abstract getDeafultTexture():Texture;
    abstract use():void;
    registerSprite() {
        if (this._isBack) {
            Game.getScene().addBackSprite(this._sprite, this._hilightsprite);
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