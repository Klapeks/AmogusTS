import { Camera } from "./Camera";
import { Light } from "./Light";
import { Location, Size } from "./Location";
import { Screen } from "./Screen";
import { Splitting, Sprite, StaticSprite } from "./Sprite";
import { Texture } from "./Texture";

type SpriteFilter = (value: Sprite, next: Sprite) => number;

class SpriteArray {
    next: SpriteArray;
    sprite: Sprite;
    constructor(sprite?: Sprite) {
        if (sprite) this.sprite = sprite;
    }
    add(sprite: Sprite, filter: SpriteFilter = SpriteArray.PriorityFilter) {
        if (this.sprite===sprite) return this;
        if (!this.sprite){
            this.sprite = sprite;
            return this;
        }
        let f = filter(this.sprite, sprite);
        if (f < 0) {
            [this.sprite, sprite] = [sprite, this.sprite];
            if (!this.next){
                this.next = new SpriteArray(sprite);
                return this;
            }
            let newnext = new SpriteArray(sprite);
            newnext.next = this.next;
            this.next = newnext;
            return this;
        }

        if (!this.next){
            this.next = new SpriteArray(sprite);
            return this.next;
        }
        return this.next.add(sprite, filter);
    }
    remove(sprite: Sprite) {
        if (!this.next) {
            if (this.sprite === sprite)
                this.sprite = null;
            return;
        }
        if (this.sprite !== sprite) {this.next.remove(sprite); return;}
        this.sprite = this.next.sprite;
        this.next = this.next.next;
        return;
    }
    forEach(f: (sprite: Sprite) => void) {
        if (this.sprite) f(this.sprite);
        if (this.next) this.next.forEach(f);
    }

    static PriorityFilter: SpriteFilter = (now: Sprite, next: Sprite) => {
        return next.priority - now.priority;
    }
    static PosFilter: SpriteFilter = (now: Sprite, next: Sprite) => {
        return next.getLocation().y - now.getLocation().y;
    }
}

class TreeSprite {
    right: TreeSprite;
    left: TreeSprite;
    value: Sprite;
    constructor(sprite: Sprite) {
        this.value = sprite;
    }
    add(ts: TreeSprite){
        if (ts.value.getCenter().y < this.value.getCenter().y){
            if (this.left) this.left.add(ts);
            else this.left = ts;
        } else {
            if (this.right) this.right.add(ts);
            else this.right = ts;
        }
    }
    foreach(f: (sprite: Sprite) => void) {
        if (this.left) this.left.foreach(f);
        f(this.value);
        if (this.right) this.right.foreach(f);
    }
}

abstract class Scene {
    protected _sprites_back: SpriteArray = new SpriteArray();
    protected _sprites_dynamic: Array<Sprite> = new Array();
    protected _sprites_upper: SpriteArray = new SpriteArray();
    protected _lights: Array<Light> = new Array();

    protected _camera: Camera = new Camera();
    constructor() {
    }
    getCamera(): Camera {
        return this._camera;
    }

    removeDynamicSprite(...sprite: Sprite[]) {
        this._sprites_dynamic = this._sprites_dynamic.filter(p=>!sprite.includes(p));
    }
    removeUpperSprite(...sprite: Sprite[]) {
        for (let s of sprite) {
            if(!s) continue;
            this._sprites_upper.remove(s);
            if (this._veryUpper && this._veryUpper.sprite === s) this._veryUpper = undefined;
        }
    }
    addDynamicSprite(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s || this._sprites_dynamic.includes(s)) continue;
            this._sprites_dynamic.push(s);
        }
    }
    addBackSprite(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s) continue;
            this._sprites_back.add(s);
        }
    }
    protected _veryUpper: SpriteArray;
    addUpperSprite(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s) continue;
            if (s instanceof StaticSprite) {
                const {x,y} = s.getLocation();
                if (x <= 0 && y <= 0 && s.width + x >= Screen.width && s.height + y >= Screen.height) {
                    if ((!Number.isFinite(s.opacity) || s.opacity >= 1) && !s.hidden && s.getTexture().isFulled) {
                        this._veryUpper = this._sprites_upper.add(s);
                        continue;
                    }
                }
            }
            this._sprites_upper.add(s);
        }
    }
    addLight(...lights: Light[]): void {
        for (let l of lights) {
            if(l) this._lights.push(l);
        }
    }
    darkness_map: {data: any, location: Location, size: Size, separate?: {sx:number, sy:number}};
    setDarknessMap(dm: {data: any, location: Location, size: Size, separate?: {sx:number, sy:number}}) {
        this.darkness_map = dm;
        if (!this.darkness_map.separate) {
            this.darkness_map.separate = {
                sx: this.darkness_map.data.width/this.darkness_map.size.width,
                sy: this.darkness_map.data.height/this.darkness_map.size.height
            }
        }
    }
    removeLight(...lights: Light[]): void {
        this._lights = this._lights.filter(l=>!lights.includes(l));
    }
    drawSprites(): void {
        if (this._veryUpper && this._veryUpper.sprite) {
            const s = this._veryUpper.sprite;
            if ((!Number.isFinite(s.opacity) || s.opacity >= 1) && !s.hidden && s.getTexture().isFulled) {
                const upper_than_dark = new Array<Sprite>();
                this._veryUpper.forEach((sprite) => {
                    if (sprite.upperThanDark) upper_than_dark.push(sprite);
                    else this.drawSprite(sprite)
                })
                if (Light.isLightsEnable()) this.drawLights();
                upper_than_dark.forEach(sprite => this.drawSprite(sprite));
                return;
            }
        }
        this._sprites_back.forEach((sprite) => this.drawSprite(sprite, true));

        let ts: TreeSprite;
        for (let sprite of this._sprites_dynamic) {
            if (ts) ts.add(new TreeSprite(sprite));
            else ts = new TreeSprite(sprite);
        }
        ts.foreach((sprite) => {
            this.drawSprite(sprite)
        });

        const upper_than_dark = new Array<Sprite>();
        this._sprites_upper.forEach((sprite) => {
            if (sprite.upperThanDark) upper_than_dark.push(sprite);
            else this.drawSprite(sprite)
        })
        if (Light.isLightsEnable()) this.drawLights();
        upper_than_dark.forEach(sprite => this.drawSprite(sprite));
    }
    // drawSprites(): void {
    //     this._sprites_back.forEach((sprite) => this.drawSprite(sprite, true));
        
    //     let ts: TreeSprite;
    //     for (let sprite of this._sprites_dynamic) {
    //         if (ts) ts.add(new TreeSprite(sprite));
    //         else ts = new TreeSprite(sprite);
    //     }
    //     ts.foreach((sprite) => {
    //         this.drawSprite(sprite)
    //     });

    //     const upper_than_dark = this._sprites_upper.filter((sprite) => {
    //         if (sprite.upperThanDark) return true;
    //         this.drawSprite(sprite)
    //         return false;
    //     })
    //     if (Light.isLightsEnable()) this.drawLights();
    //     upper_than_dark.forEach(sprite => this.drawSprite(sprite));
    // }
    abstract drawSprite(sprite: Sprite, isBack?: boolean): void;
    abstract filterImage(image: any, filter: (data:any)=>any, splitting?: Splitting): any;
    abstract getImageData(image: any): Uint8ClampedArray;
    abstract drawTextureFullScreen(texture: Texture): void;
    abstract drawLights(): void;
}

export { Scene };