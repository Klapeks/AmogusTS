import { Game } from "../../../../engine/Game";
import { LinkedLocation, Location } from "../../../../engine/Location";
import { NullSprite, StaticSprite } from "../../../../engine/Sprite";
import { TextTexture, Texture } from "../../../../engine/Texture";
import { Character } from "../../../characters/Character";
import { Role } from "../../../roles/role";
import { Roles } from "../../../roles/roles";

let arrowTexture: Texture;

class GuessRole {
    private _location: Location;
    private _left_arrow: StaticSprite;
    private _right_arrow: StaticSprite;
    private _roletext: StaticSprite;
    
    constructor(center: Location, length = 512, arrow_size = 128) {
        this._location = center;
        if(!arrowTexture) {
            arrowTexture = new Texture('roles/arrow.png');
        }
        this._left_arrow = new StaticSprite(arrowTexture,
                new LinkedLocation(center, {dx: -length/2, dy: 0}))
                .setSize(-arrow_size/2, arrow_size);
        this._right_arrow = new StaticSprite(arrowTexture,
                new LinkedLocation(center, {dx: (length-arrow_size)/2, dy: 0}))
                .setSize(arrow_size/2, arrow_size);
        this._roletext = new StaticSprite(Character.generateNicknameTexture('Угадай роль', 50), 
                new LinkedLocation(center, {dx: 0, dy: arrow_size/2+13}))
                .setSize(length-arrow_size, 50);
        Game.eventListeners.addMouseClick((x,y) => {
            if (this._left_arrow && !this._left_arrow.hidden) {
                if (Location.isInHitbox(x,y,{
                    location: this._left_arrow.getLocation(),
                    size: this._right_arrow
                })) this.nextRole(-1);
            }
            if (this._right_arrow && !this._right_arrow.hidden) {
                if (Location.isInHitbox(x,y,{
                    location: this._right_arrow.getLocation(),
                    size: this._right_arrow
                })) this.nextRole(1);
            }
        })
    }

    nowRole: number = undefined;
    nextRole(go = 1) {
        if (this.nowRole === undefined) this.nowRole = 0;
        else {
            const role_length = Object.keys(Roles).length;
            this.nowRole += go;
            if (this.nowRole < 0) this.nowRole += role_length;
            else if (this.nowRole >= role_length) this.nowRole -= role_length;
        }
        this.setSelectedRole(this.getSelectedRole());
    }

    getSelectedRole(): Role {
        if (this.nowRole===undefined) {
            return undefined;
        }
        return Roles[Object.keys(Roles)[this.nowRole]];
    }

    protected setSelectedRole(role: Role) {
        const tt = (this._roletext.getTexture() as TextTexture);
        tt.text = role.name;
        tt.color = role.toCSS();
    }

    getLocation() {
        return this._location;
    }

    getSprites() {
        return [this._left_arrow, this._right_arrow, this._roletext];
    }

    setPriority(priority: number) {
        this._left_arrow.priority 
            = this._right_arrow.priority 
            = this._roletext.priority = priority;
        return this;
    }
    
    get hidden() {
        return this._left_arrow.hidden 
            || this._right_arrow.hidden 
            || this._roletext.hidden;
    }
    set hidden(b: boolean) {
        this._left_arrow.hidden 
            = this._right_arrow.hidden 
            = this._roletext.hidden = b;
    }
}


export {GuessRole};
