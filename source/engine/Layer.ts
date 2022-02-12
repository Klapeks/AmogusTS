import { Screen } from "./Screen";
import { Sprite, StaticSprite } from "./Sprite";
import { SpriteArray, TreeSprite } from "./utils/FilterSprite";

interface Layer {
    add(...sprite: Sprite[]): void;
    remove(...sprite: Sprite[]): void;
    draw(): void;
    drawSprite(sprite: Sprite): void;
    forEach(f: (sprite: Sprite) => void): void;
    isFilter(): this is IFilterLayer;
    isDynamic(): this is IDynamicLayer;
}
interface IFilterLayer {
    recalculate(): void;
    hasFullscreen(): boolean;
    isFullscreen(s: Sprite): boolean;
}
interface IDynamicLayer { }


type FilterLayerSettings = {checkFullscreen?: boolean};
abstract class AbstractFilterLayer implements Layer, IFilterLayer {
    protected _sprites: SpriteArray = new SpriteArray();
    protected _upperSprites: SpriteArray;
    fullscreenCheck = false;
    constructor(settings?: FilterLayerSettings) {
        if (!settings) return;
        this.fullscreenCheck ??= settings.checkFullscreen;
    }
    add(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s) continue;
            if (this.fullscreenCheck && this.isFullscreen(s)) {
                this._upperSprites = this._sprites.add(s);
            } else {
                this._sprites.add(s);
            }
        }
    }
    remove(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s) continue;
            this._sprites.remove(s);
            if (this._upperSprites && this._upperSprites.sprite === s) this._upperSprites = undefined;
        }
        if (this.fullscreenCheck && !this._upperSprites) this.recalculate();
    }
    recalculate() {
        if (!this.fullscreenCheck) return;
        this._upperSprites = this._sprites.getFirst(this.isFullscreen);
    }
    hasFullscreen(): boolean {
        return this.fullscreenCheck && this._upperSprites 
            && this.isFullscreen(this._upperSprites.sprite);
    }
    isFullscreen(s: Sprite) {
        if (!(s instanceof StaticSprite)) return false;
        const {x,y} = s.getLocation();
        return x <= 0 && y <= 0 
            && s.width + x >= Screen.width 
            && s.height + y >= Screen.height
            && !s.hidden && s.getTexture().isFulled 
            && (!Number.isFinite(s.opacity) || s.opacity >= 1);
    }
    draw(): void {
        if (this.hasFullscreen()) {
            this._upperSprites.forEach(this.drawSprite);
            return;
        }
        this.forEach(this.drawSprite);
    }
    forEach(f: (sprite:Sprite) => void) {
        this._sprites.forEach(f);
    }
    abstract drawSprite(sprite: Sprite): void;
    isFilter(): this is IFilterLayer { return true; }
    isDynamic(): this is IDynamicLayer { return false; }
}


abstract class AbstractDynamicLayer implements Layer, IDynamicLayer {
    protected _sprites: Array<Sprite> = new Array();
    add(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s || this._sprites.includes(s)) continue;
            this._sprites.push(s);
        }
    }
    remove(...sprite: Sprite[]): void {
        this._sprites = this._sprites.filter(s=>!sprite.includes(s));
    }
    draw(): void {
        let ts: TreeSprite;
        for (let sprite of this._sprites) {
            if (ts) ts.add(new TreeSprite(sprite));
            else ts = new TreeSprite(sprite);
        }
        if (ts) ts.foreach(this.drawSprite);
    }
    forEach(f: (sprite:Sprite) => void) {
        this._sprites.forEach(f);
    }
    abstract drawSprite(sprite: Sprite): void;
    isFilter(): this is IFilterLayer { return false; }
    isDynamic(): this is IDynamicLayer { return true; }
}

export { Layer, IDynamicLayer, IFilterLayer, AbstractFilterLayer, AbstractDynamicLayer, FilterLayerSettings };