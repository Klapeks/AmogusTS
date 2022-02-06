import { Game } from "./Game";
import { Joystick } from "./Joystick";
import { Location } from "./Location";
import { MenusUtils } from "./Menu";
import { Screen } from "./Screen";
import { Sprite, StaticSprite } from "./Sprite";
import { Texture } from "./Texture";


class Button {
    protected _sprite: StaticSprite;
    private _texture: Texture;
    private _seltexture: Texture;
    constructor(texture: Texture, location: Location = new Location(0,0)) {
        this._texture = texture;
        this._sprite = new StaticSprite(texture, location).setPriority(50);
    }
    setMargin(margin: {x:number, y:number}){
        this._sprite.setMargin(margin)
        return this;
    }
    get margin() {
        return this._sprite.margin;
    }
    private _altkey: string;
    setAltKey(key: string) {
        this._altkey = key;
        return this;
    }
    getAltKey() {
        return this._altkey;
    }
    set hidden(b: boolean){
        this._sprite.hidden = b;
    }
    get hidden(){
        return this._sprite.hidden;
    }
    getSprite(){
        return this._sprite;
    }
    setSize(x: number, y: number){
        this._sprite.setSize(x, y);
        return this;
    }
    click() {
        this._onclick();
    }
    protected _onclick: () => void = () => {};
    setClick(f:()=>void){
        this._onclick = f;
        return this;
    }
    protected _isselected = false;
    setSelected(texture: Texture) {
        this._seltexture = texture;
        return this;
    }
    select(){
        if (!this._isselected && this._seltexture) this._sprite.setTexture(this._seltexture);
        this._isselected = true;
    }
    unselect(){
        if (this._isselected) this._sprite.setTexture(this._texture);
        this._isselected = false;
    }
}
let allButtons: Array<Button> = new Array(); 

let _nx: number, _ny: number;

let ButtonFuncs = {
    doclick(x: number, y: number) {
        if (!MenusUtils.isNoMenu()) return;
        allButtons.forEach(b => {
            if (b.getSprite().hidden) return;
            _nx = b.getSprite().getLocation().x; _ny = b.getSprite().getLocation().y;
            if (b.margin.x < 0) _nx = Screen.width - _nx + b.margin.x;
            else _nx += b.margin.x;
            if (b.margin.y < 0) _ny = Screen.height - _ny + b.margin.y;
            else _ny += b.margin.y;
            if (x >= _nx && y >= _ny && x <= _nx + b.getSprite().width
                && y <= _ny + b.getSprite().height) b.click();
        });
    },
    load() {
        Game.eventListeners.addMouseClick((x,y) => {
            if (MenusUtils.isNoMenu()) {
                Joystick.onclick(x, y, "mouse");
                ButtonFuncs.doclick(x, y);
            } else {
                MenusUtils.click(x, y);
            }
        })
    },
    update() {
        if (MenusUtils.isNoMenu()) {
            allButtons.forEach(b => {
                if (Game.hasKey(b.getAltKey())) b.click()
            });
            Joystick.update();
        }
    },
    addButton(...button: Button[]) {
        button.forEach(b => {
            allButtons.push(b);
            Game.getScene().addUpperSprite(b.getSprite());
        });
    }
}

class ClickingButton {
    protected _sprite: StaticSprite;
    private _texture: Texture;
    private _hoverT: Texture;
    constructor(texture: Texture, location: Location = new Location(0,0)) {
        this._texture = texture;
        this._sprite = new StaticSprite(texture, location);
    }

    isHovering = false;
    setHoverTexture(texture: Texture) {
        this._hoverT = texture;
        return this;
    }

    set hidden(b: boolean){
        this._sprite.hidden = b;
    }
    get hidden(){
        return this._sprite.hidden;
    }
    getSprite(){
        return this._sprite;
    }
    update(mouse: {posX: number, posY: number} = Game.mouseinfo) {
        if (!this._hoverT) return;
        if (Location.isInHitbox(mouse.posX, mouse.posY, this._sprite.getHitboxPos())) {
            if (this.isHovering) return;
            this.isHovering = true;
            this._sprite.setTexture(this._hoverT);
            if (this.onhover) this.onhover();
        } else {
            if (!this.isHovering) return;
            this.isHovering = false;
            this._sprite.setTexture(this._texture);
        }
    }
    doClick(mouse: {posX: number, posY: number}) {
        if (Location.isInHitbox(mouse.posX, mouse.posY, this._sprite.getHitboxPos())) {
            if (this.onclick) this.onclick();
        }
    }
    onclick: () => void;
    setOnClick(c: () => void) {
        this.onclick = c;
        return this;
    }
    onhover: () => void;
    setOnHover(h: () => void) {
        this.onhover = h;
        return this;
    }
}
export {Button, ButtonFuncs, ClickingButton}