import { Camera } from "./Camera";
import { Light } from "./Light";
import { BiLocation, Location, Point, Size } from "./Location";
import { Screen } from "./Screen";
import { Sprite, StaticSprite } from "./Sprite";
import { Texture } from "./Texture";

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
    protected _sprites_back: Array<Sprite> = new Array();
    protected _sprites_dynamic: Array<Sprite> = new Array();
    protected _sprites_upper: Array<Sprite> = new Array();
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
        this._sprites_upper = this._sprites_upper.filter(p=>!sprite.includes(p));
    }
    addDynamicSprite(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(s) this._sprites_dynamic.push(s);
        }
    }
    addBackSprite(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(s) this._sprites_back.push(s);
        }
    }
    addUpperSprite(...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(s) this._sprites_upper.push(s);
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
        this._sprites_back.forEach((sprite) => this.drawSprite(sprite, true));
        
        let ts: TreeSprite;
        for (let sprite of this._sprites_dynamic) {
            if (ts) ts.add(new TreeSprite(sprite));
            else ts = new TreeSprite(sprite);
        }
        ts.foreach((sprite) => {
            this.drawSprite(sprite)
        });
        const static_upper = new Array();
        this._sprites_upper.forEach((sprite) => {
            if (sprite.upperThanDark) static_upper.push(sprite);
            else this.drawSprite(sprite)
        });
        if (Light.isLightsEnable()) this.drawLights();
        static_upper.forEach(sprite => this.drawSprite(sprite));
    }
    abstract drawSprite(sprite: Sprite, isBack?: boolean): void;
    abstract filterImage(image: any, filter: (data:any)=>any): any;
    abstract getImageData(image: any): Uint8ClampedArray;
    abstract drawTextureFullScreen(texture: Texture): void;
    abstract drawLights(): void;
}

export { Scene };