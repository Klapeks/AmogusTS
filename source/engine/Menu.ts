import { Game } from "./Game";
import { Hitbox, HitboxLocation, Location, Size } from "./Location";
import { Screen } from "./Screen";
import { StaticSprite } from "./Sprite";
import { Texture } from "./Texture";


class Menu {
    protected _size: Size;
    protected _texture: Texture;
    constructor(texture: Texture, size: Size) {
        this._size = size;
        this._texture = texture;
    }
    protected _sprite: StaticSprite;
    isShowed = false;
    show(priority?: number) {
        if (this.isShowed) return;
        if (this._sprite) return;
        this.isShowed = true;
        this._sprite = new StaticSprite(this._texture)
            .setSize(this._size.width, this._size.height)
            .setLocationByCenter(Screen.width/2, Screen.height/2);
        if (priority) this._sprite.setPriority(priority);
        
        Game.getScene().addUpperSprite(this._sprite);
        MenusUtils.showedMenus.push(this);
    }
    hide() {
        MenusUtils.showedMenus = MenusUtils.showedMenus.filter(m => m!==this);
        Game.getScene().removeUpperSprite(this._sprite);
        this._sprite = null;
        this.isShowed = false;
    }
    protected _clickevents = new Array<{hitbox:Hitbox|HitboxLocation, event: (x:number,y:number) => void, block_another: boolean}>();
    addClick(hitbox: Hitbox | HitboxLocation, event: (x:number,y:number) => void, block_another: boolean = false) {
        this._clickevents.unshift({hitbox, event, block_another});
        return this;
    }
    click(x: number, y: number): boolean {
        for (let e of this._clickevents) {
            if (Location.isInHitbox(x, y, e.hitbox)) {
                e.event(x,y);
                if (e.block_another) return true;
            }
        }
        return false;
    }
    setTexture(texture: Texture){
        this._texture = texture;
    }
}

class ApearableMenu extends Menu {
    
    constructor(texture: Texture, size: Size){
        super(texture, size);
    }
    
    onMenuMoving(location: Location) {}
    onClose() {}
    
    show(priority?: number) {
        if (this.isShowed || this._sprite) return;
        super.show(priority);
        
        if (this.apeartime) {
            const ny = this._sprite.getLocation().y;
            this._sprite.getLocation().y = Screen.height;
            this.onMenuMoving(this._sprite.getLocation());

            for (let i = 0; i < Screen.height-ny; i+=10){
                setTimeout(() => {
                    if (this._sprite) this._sprite.getLocation().y -= 10;
                    this.onMenuMoving(this._sprite.getLocation());
                }, this.apeartime*i/(Screen.height-ny));
            }
            setTimeout(() => {
                this._sprite.getLocation().y = ny;
                this.onMenuMoving(this._sprite.getLocation());
            }, this.apeartime)
        }
    }
    hide(extra: boolean = false) {
        if (!extra) if (!this.isShowed) return;
        this.isShowed = false;
        if (!this._sprite) return;
        if (this.apeartime && !extra) {
            // logic_buttons.setCooldown(this.apeartime/1000+0.5, "use");
            const ny = this._sprite.getLocation().y;

            for (let i = 0; i < Screen.height-ny; i+=10){
                setTimeout(() => {
                    if (this._sprite) this._sprite.getLocation().y += 10;
                    this.onMenuMoving(this._sprite.getLocation());
                }, this.apeartime*i/(Screen.height-ny));
            }

            setTimeout(() => {
                this.onClose();
                super.hide();
            }, this.apeartime);
        } else {
            this.onClose();
            super.hide();
        }
    }

    apeartime: number = 0;
    setApearTime(miliseconds: number) {
        this.apeartime = miliseconds;
        return this;
    }
}

let MenusUtils = {
    showedMenus: new Array<Menu>(),
    click(x: number, y: number) {
        for (let i = MenusUtils.showedMenus.length-1; i >= 0; i--) {
            if (MenusUtils.showedMenus[i].click(x,y)) break;
        }
    },
    hideAll() {
        while (!MenusUtils.isNoMenu()) {
            MenusUtils.showedMenus.shift().hide();
        }
    },
    isNoMenu(){
        return MenusUtils.showedMenus.length === 0
    }
}

export {MenusUtils, Menu, ApearableMenu}