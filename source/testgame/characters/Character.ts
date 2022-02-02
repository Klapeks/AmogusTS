import { Color, HexColor } from "../../engine/Color";
import { Game } from "../../engine/Game";
import { Joystick } from "../../engine/Joystick";
import { LinkedLocation, Location } from "../../engine/Location";
import { Screen } from "../../engine/Screen";
import { Sprite } from "../../engine/Sprite";
import { TextTexture, Texture } from "../../engine/Texture";
import { Vents, vent_logic } from "../logic/items/vents";
import { Role, Roles } from "../roles/roles";
import { textures } from "../textures";
import { AmogusTextures, CharacterColor, CharacterFuncs } from "./CharFuncs";

class Character {
    protected _id: number;
    protected _sprite: Sprite;
    protected _textures: AmogusTextures;
    protected _color: CharacterColor = null;
    constructor(id: number, location?: Location) {
        this._id = id;
        this._sprite = new Sprite(textures.amogus.idle, location)
            .setSize(256*textures.character_ratio, 256*textures.character_ratio)
            .setTexture(textures.missingo)
            .setHideInDark(true);
    }
    setColor(foreground: Color | string, background: Color | string, mask: Color = {r:120,g:200,b:220}) {
        if (typeof foreground === "string") foreground = HexColor(foreground);
        if (typeof background === "string") background = HexColor(background);
        this._color = {mask, foreground, background};
        this._textures = {
            idle: CharacterFuncs.cloneFiltering(textures.amogus.idle, this._color),
            static: CharacterFuncs.cloneFiltering(textures.amogus.static, this._color),
            eject: CharacterFuncs.cloneFiltering(textures.amogus.eject, this._color),
            walk: CharacterFuncs.cloneFilteringS(textures.amogus.walk, this._color),
            dead: CharacterFuncs.cloneFilteringS(textures.amogus.dead, this._color),
            vent: CharacterFuncs.cloneTexture(textures.amogus.vent, this._color),
            meeting: CharacterFuncs.cloneFilteringS(textures.amogus.meeting, this._color),
            killanimations: {
                alien: textures.amogus.killanimations.alien,
            }
        }
        setTimeout(() => {
            this._textures.killanimations.alien = CharacterFuncs.cloneFiltering(textures.amogus.killanimations.alien, this._color);
        }, 50);
        this.idle();
        return this;
    }
    getColor() {
        return this._color;
    }

    getTextures() { return this._textures; }
    getId() { return this._id; }
    getSprite() { return this._sprite; }
    getLocation() { return this._sprite.getLocation(); }
    getCenter() { return this._sprite.getCenter(); }
    distanceSquared(character: Character) {
        return this.getLocation().distanceSquared(character.getLocation());
    }

    idle() {
        this.isVentedAnim = false;
        this._walkanimation = 0;
        this._sprite.splitting = null;
        this._sprite.setTexture(this._textures.idle);
    }
    
    protected _walkanimation: number;
    playWalkAnimation(frame: number = 1) {
        this._sprite.setTexture(this._textures.walk.texture);
        this._walkanimation += frame;
        if (this._walkanimation >= this._textures.walk.amount) this._walkanimation %= this._textures.walk.amount;
        this._sprite.setSplitting(
            Math.floor(this._walkanimation)%this._textures.walk.amount_per_line*this._textures.walk.width,
            Math.floor(Math.floor(this._walkanimation)/this._textures.walk.amount_per_line)*this._textures.walk.height,
            this._textures.walk.width, this._textures.walk.height
        );
    }
    get walkAnimationFrame() {
        return this._walkanimation;
    }

    ventilation: Vents;
    jumpVent(vent: Vents) {
        const cloc = vent.getCenter();
        this._sprite.setLocationByCenter(cloc.x, cloc.y-50);
        if (!this.isVentedAnim) {
            vent.playVenting();
            this.playVentAnimation();
            setTimeout(() => {
                this.ventilation = vent;
            }, vent_logic.impostorVentAnimTime);
        } else {
            vent_logic.playMoveSound();
            this.ventilation = vent;
        }
        vent_logic.showArrows(vent);
    }
    outVent(isAnimation: boolean = true){
        vent_logic.hideArrows();
        if (isAnimation && this.isVentedAnim && this.ventilation) {
            this.ventilation.playVenting();
            this.playUnVentAnimation();
        } else {
            this.hidden = false;
            this.idle();
            Joystick.isDisabled = false;
        }
        this.ventilation = null;
    }

    isVentedAnim = false;
    playVentAnimation() {
        this._sprite.splitting = null;
        this._sprite.setTexture(this._textures.vent[0]);
        Joystick.isDisabled = true;
        this.isVentedAnim = true;
        for (let i = 1; i < this._textures.vent.length; i++) {
            setTimeout(() => {
                this._sprite.setTexture(this._textures.vent[i]);
            }, i*vent_logic.impostorVentAnimTime/this._textures.vent.length);
        }
        setTimeout(() => {
            this.hidden = true;
        }, vent_logic.impostorVentAnimTime);
    }
    playUnVentAnimation() {
        this.hidden = false;
        for (let i = 0; i < this._textures.vent.length; i++) {
            setTimeout(() => {
                this._sprite.setTexture(this._textures.vent[this._textures.vent.length-i-1]);
            }, i*vent_logic.impostorVentAnimTime/this._textures.vent.length);
        }
        setTimeout(() => {
            this.idle();
            Joystick.isDisabled = false;
        }, vent_logic.impostorVentAnimTime);
    }
    set hidden(b: boolean){
        this._sprite.hidden = b;
        if (this._nicknameSprite) this._nicknameSprite.hidden = b;
    }
    get hidden() {
        return this._sprite.hidden;
    }

    private _nickname: string;
    private _nicknameSprite: Sprite;
    setNickname(nickname: string | undefined) {
        this._nickname = nickname;
        if (this._nicknameSprite) {
            Game.getScene().removeUpperSprite(this._nicknameSprite);
            this._nicknameSprite = null;
            if (!nickname) return this;
        }

        this._nicknameSprite = new Sprite(Character.generateNicknameTexture(nickname),
                    new LinkedLocation(this.getLocation(), {dx:256*textures.character_ratio/2,dy:10}))
                    .setSize(Screen.width/2,50)
                    .setHideInDark(this._sprite.isHideInDark());
        Game.getScene().addUpperSprite(this._nicknameSprite);
        return this;
    }
    getNickname() {
        return this._nickname;
    }
    
    protected _role: Role = Roles.Crewmate;
    private _roleplateSprite: Sprite;
    getRole() {
        return this._role;
    }
    setRole(role: Role) {
        this._role = role;
        if (this._isShowedRoleplate) this.showRoleplate();
        return this;
    }
    protected _isShowedRoleplate = false;
    showRoleplate() {
        this._isShowedRoleplate = true;
        if (!this._role) return;
        if (!this._roleplateSprite){
            this._roleplateSprite = new Sprite(Character.generateNicknameTexture('none', 25),
                new LinkedLocation(this.getLocation(), {dx:256*textures.character_ratio/2,dy:-30}))
                .setSize(Screen.width/2,50)
                .setHideInDark(this._sprite.isHideInDark());
            this._roleplateSprite.hidden = true;
        }
        (this._roleplateSprite.getTexture() as TextTexture).setColor(this._role.toCSS()).setText(this._role.name);
        if (this._roleplateSprite.hidden) {
            this._roleplateSprite.hidden = false;
            Game.getScene().addUpperSprite(this._roleplateSprite);
        }
    }
    hideRoleplate() {
        this._isShowedRoleplate = false;
        this._roleplateSprite.hidden = true;
        Game.getScene().removeUpperSprite(this._roleplateSprite);
        return this;
    }

    isAlive: boolean = true;

    static generateNicknameTexture(nickname: string, fontsize = 32, align = "center") {
        return new TextTexture(nickname, 'Comic Sans MS, Comic Sans')
                    .setFontSize(fontsize)
                    .setColor("white")
                    .setAlign(align)
                    .setOutline('black', 5);
    }
}

export {Character}