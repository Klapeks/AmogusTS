import { Screen } from "./Screen";
import { Sprite, StaticSprite } from "./Sprite";
import { SpriteArray, TreeSprite } from "./utils/FilterSprite";

interface Layer {
    add(...sprite: Sprite[]): void;
    remove(...sprite: Sprite[]): void;
    draw(): void;
    drawSprite(sprite: Sprite): void;
    forEach(f: (sprite: Sprite) => void): void;

    isDynamic(): this is DynamicLayer;

    recalculate(): void;
    hasFullscreen(): boolean;
    isFullscreen(s: Sprite): boolean;
}
interface DynamicLayer {
    addDynamic(...sprite: Sprite[]): void;
    removeDynamic(...sprite: Sprite[]): void;
    drawDynamic(): void;
}


type LayerSettings = {checkFullscreen?: boolean};

abstract class AbstractLayer implements Layer {
    protected _sprites: SpriteArray = new SpriteArray();
    protected _upperSprites: SpriteArray;
    fullscreenCheck = false;
    constructor(settings?: LayerSettings) {
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
            this._upperSprites.forEach(s => this.drawSprite(s));
            return;
        }
        this.forEach((s) => this.drawSprite(s));
    }
    forEach(f: (sprite:Sprite) => void) {
        this._sprites.forEach(f);
    }
    abstract drawSprite(sprite: Sprite): void;

    isDynamic(): this is DynamicLayer { return false; }
}


abstract class AbstractDynamicLayer extends AbstractLayer implements DynamicLayer {
    protected _sprites_dynamic: Array<Sprite> = new Array();

    constructor() {
        super();
        this.fullscreenCheck = false;
    }
    
    addDynamic(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s || this._sprites_dynamic.includes(s)) continue;
            this._sprites_dynamic.push(s);
        }
    }
    removeDynamic(...sprite: Sprite[]): void {
        this._sprites_dynamic = this._sprites_dynamic.filter(s=>!sprite.includes(s));
    }
    draw(): void {
        this.drawDynamic();
        super.draw();
    }
    drawDynamic(): void {
        let ts: TreeSprite;
        for (let sprite of this._sprites_dynamic) {
            if (ts) ts.add(new TreeSprite(sprite));
            else ts = new TreeSprite(sprite);
        }
        if (ts) ts.foreach((s) => this.drawSprite(s));
    }

    isDynamic(): this is DynamicLayer { return true; }
}

export { Layer, AbstractLayer, AbstractDynamicLayer, LayerSettings, DynamicLayer };