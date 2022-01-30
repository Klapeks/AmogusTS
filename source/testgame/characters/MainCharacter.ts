import { Location } from "../../engine/Location";
import { Character } from "./Character";

const defaultHitboxes = [
    127, 221,
    164, 223,
    193, 237,
    164, 252,
    128, 254,
    92, 252,
    63, 238,
    92, 223
];
class MainCharacter extends Character {
    private _role: string = "none";
    private _hitboxpoints:number[] = [];
    
    constructor(id: number, location?: Location) {
        super(id, location)
        this.updateHitboxPoints();
    }

    getHitboxPoints() {
        return this._hitboxpoints;
    }
    updateHitboxPoints() {
        for (let i = 0; i < defaultHitboxes.length; i+=2) {
            this._hitboxpoints[i] = defaultHitboxes[i]*this._sprite.width/256;
            this._hitboxpoints[i+1] = defaultHitboxes[i+1]*this._sprite.height/256;
        }
    }
    get role() {
        return this._role;
    }
    set role(role: string) {
        this._role = role;
    }
}

export {MainCharacter}