import { Character } from "../../../characters/Character";
import { StaticSprite } from "../../../../engine/Sprite";
import { LinkedLocation, Location } from "../../../../engine/Location";
import { Game } from "../../../../engine/Game";
import { textures } from "../../../textures";
import { Texture } from "../../../../engine/Texture";
import { tablet_settings } from "./tablet_settings";

const tabset = tablet_settings;

class Nameplate {
    private _character: Character;
    private _id: number;
    constructor(character: Character) {
        this._id = Nameplate.last_number++;
        this._character = character;
    }
    updateLocation(tabletLocation: Location) {
        if (this.nameplate) {
            this.nameplate.getLocation().x = (this._id%3)*(tabset.plateSize.width+25) + 210;
            this.nameplate.getLocation().y = Math.floor(this._id/3)*(tabset.plateSize.height+25) + tabletLocation.y + 180;
        }
    }
    
    checkMouseMove(posX: number = Game.mouseinfo.posX, posY: number = Game.mouseinfo.posY): boolean {
        if (!this.nameplate) return false;
        if (!this._character?.isAlive) return false;
        const loc = this.nameplate.getLocation();
        const secloc = {x: loc.x+this.nameplate.width, y:loc.y+this.nameplate.height};
        return loc.x <= posX && posX <= secloc.x && loc.y <= posY && posY <= secloc.y;
    }

    charplate: Map<string, StaticSprite>;
    get nameplate() { return this.charplate.get('nameplate'); }
    createSprite() {
        if (this.charplate) return this;
        this.charplate = new Map();
        const nloc = new Location(-500,-500);
        this.charplate.set('nameplate', 
            new StaticSprite(tabset.nameplatesT, nloc)
            .setSize(tabset.plateSize.width, tabset.plateSize.height)
            .setSplitting(2, 10, 272, 64)
            .setPriority(55));
        
        this.charplate.set('icon', 
            new StaticSprite(this._character.getTextures().idle,
            new LinkedLocation(nloc, {dx:-20, dy:-28}))
            .setSize(1.75*128*textures.character_ratio, 1.75*190/2*textures.character_ratio)
            .setSplitting(0,0,256,190)
            .setPriority(55));

        const nick = this._character.getNickname();
        if (nick) {
            const nickplate = Character.generateNicknameTexture(nick, 40, 'left');
            nickplate.setColor(this._character.getNicknameColor());
            this.charplate.set('nickname', new StaticSprite(nickplate,
                new LinkedLocation(nloc, {dx: 130, dy: 50}))
                .setSize(tabset.plateSize.width,0)
                .setPriority(55));
            
        }
        if (this._character.isRoleplateShows()) {
            const npt = Character.generateNicknameTexture(this._character.getRole().name, 30, 'left');
            npt.color = this._character.getRole().toCSS();
            this.charplate.set('role', new StaticSprite(npt,
                new LinkedLocation(nloc, {dx: 130, dy: 90}))
                .setSize(tabset.plateSize.width,0)
                .setPriority(55));
        }
        this.charplate.forEach((sprite) => Game.getScene().addUpperSprite(sprite));
        if (!this._character.isAlive) this.makeDead();
        return this;
    }
    makeDead() {
        const nloc = this.charplate.get('nameplate').getLocation();
        this.nameplate.opacity = 0.7;
        let _i = this.charplate.get('icon');
        if (_i) _i.opacity = 0.9;
        _i = this.charplate.get('nickname');
        if (_i) _i.opacity = 0.9;
        _i = this.charplate.get('role');
        if (_i) _i.opacity = 0.9;
        this.charplate.set('deadmark', 
            new StaticSprite(tabset.deadmarkTexture,
            new LinkedLocation(nloc, {dx: 20, dy: 20}))
            .setSize(tabset.plateSize.height-25, tabset.plateSize.height-25)
            .setPriority(55));
            
        Game.getScene().addUpperSprite(this.charplate.get('deadmark'));
        return this;
    }
    removeSpirte() {
        this.charplate.forEach((sprite) => Game.getScene().removeUpperSprite(sprite));
        this.charplate = null;
    }
    getCharacter(){
        return this._character;
    }
    getId() {
        return this._character.getId();
    }
    getLocation(){
        return this.nameplate.getLocation();
    }

    static last_number = 0;
}

export {Nameplate}