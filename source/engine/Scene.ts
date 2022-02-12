import { Camera } from "./Camera";
import { DynamicLayer, Layer } from "./Layer";
import { Light } from "./Light";
import { Location, Size } from "./Location";
import { Splitting, Sprite } from "./Sprite";
import { Texture } from "./Texture";

type SceneLayers = {back: Layer, middle: Layer&DynamicLayer, middleDarked: Layer&DynamicLayer, upper: Layer, light: Layer, GUI: Layer};
abstract class Scene {
    // protected _additionalayers: {[key: string]: Layer} = {};
    protected layers: SceneLayers;
    constructor(layers: SceneLayers) {
        this.layers = layers;
    }
    protected _camera: Camera = new Camera();
    getCamera(): Camera {
        return this._camera;
    }

    // get LayerBack() { return this.layers.back; }
    // get DLayerDynamic() {return this.layers.dynamic}
    // get DLayerDarking() { return this.layers.hideInDark; }
    get LayerUpper() { return this.layers.upper; }
    get LayerGUI() { return this.layers.GUI; }

    addBackSprite(...sprite: Sprite[]): void {
        this.layers.back.add(...sprite);
    }
    removeBackSprite(...sprite: Sprite[]) {
        this.layers.back.remove(...sprite);
    }
    removeMiddleSprite(...sprite: Sprite[]) {
        this.layers.middle.remove(...sprite);
        this.layers.middle.removeDynamic(...sprite);
        this.layers.middleDarked.remove(...sprite);
        this.layers.middleDarked.removeDynamic(...sprite);
    }
    addMiddleSprite(isDynamic: true | false | "both", ...sprite: Sprite[]): void {
        for (let s of sprite) {
            if(!s) continue;
            if (isDynamic===true||isDynamic==="both") {
                if (s.isHideInDark()) this.layers.middleDarked.addDynamic(s);
                else this.layers.middle.addDynamic(s);
            }
            if (isDynamic===false||isDynamic==="both"){
                if (s.isHideInDark()) this.layers.middleDarked.add(s);
                else this.layers.middle.add(s);
            }
        }
    }
    // addUpperSprite(...sprite: Sprite[]): void {
    //     this.layers.upper.addSprite(...sprite);
    // }
    // removeUpperSprite(...sprite: Sprite[]) {
    //     this.layers.upper.removeSprite(...sprite);
    // }

    protected _lights: Array<Light> = new Array();
    addLight(...lights: Light[]): void {
        for (let l of lights) {
            if(l) this._lights.push(l);
        }
    }
    removeLight(...lights: Light[]): void {
        this._lights = this._lights.filter(l=>!lights.includes(l));
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

    render() {
        if (this.layers.GUI.hasFullscreen()) {
            this.layers.GUI.draw();
            return;
        }
        this.layers.back.draw();
        this.layers.middle.draw();
        this.layers.upper.draw();
        this.drawLights(this.layers.middleDarked);
        this.layers.upper.forEach(s => {
            if (!s.isHideInDark()) this.layers.upper.drawSprite(s);
        })
        this.layers.GUI.draw();
    }
    abstract filterImage(image: any, filter: (data:any)=>any, splitting?: Splitting): any;
    abstract getImageData(image: any): Uint8ClampedArray;
    abstract drawTextureFullScreen(texture: Texture): void;
    abstract drawLights(hideInDark: Layer): void;
    // abstract createLayer(type: "filter" | "dynamic", settings?: any): Layer;
}

// addLayer(id: string, layer: Layer): void {
//     this._layers[id] = layer;
// }
// removeLayer(layer: string | Layer) {
//     if (typeof layer === "object") {
//         const keys = Object.keys(this._layers);
//         for (let key of keys) {
//             if (this._layers[key] === layer) layer = key;
//         }
//         if (typeof layer === "object") return;
//     }
//     delete this._layers[layer];
// }

// abstract class SceneOLD {
//     protected _sprites_back: SpriteArray = new SpriteArray();
//     protected _sprites_dynamic: Array<Sprite> = new Array();
//     protected _sprites_upper: SpriteArray = new SpriteArray();
//     protected _lights: Array<Light> = new Array();

//     protected _camera: Camera = new Camera();
//     constructor() {
//     }
//     getCamera(): Camera {
//         return this._camera;
//     }

//     removeDynamicSprite(...sprite: Sprite[]) {
//         this._sprites_dynamic = this._sprites_dynamic.filter(p=>!sprite.includes(p));
//     }
//     removeUpperSprite(...sprite: Sprite[]) {
//         for (let s of sprite) {
//             if(!s) continue;
//             this._sprites_upper.remove(s);
//             if (this._veryUpper && this._veryUpper.sprite === s) this._veryUpper = undefined;
//         }
//     }
//     addDynamicSprite(...sprite: Sprite[]): void {
//         for (let s of sprite) {
//             if(!s || this._sprites_dynamic.includes(s)) continue;
//             this._sprites_dynamic.push(s);
//         }
//     }
//     addBackSprite(...sprite: Sprite[]): void {
//         for (let s of sprite) {
//             if(!s) continue;
//             this._sprites_back.add(s);
//         }
//     }
//     protected _veryUpper: SpriteArray;
//     addUpperSprite(...sprite: Sprite[]): void {
//         for (let s of sprite) {
//             if(!s) continue;
//             if (s instanceof StaticSprite) {
//                 const {x,y} = s.getLocation();
//                 if (x <= 0 && y <= 0 && s.width + x >= Screen.width && s.height + y >= Screen.height) {
//                     if ((!Number.isFinite(s.opacity) || s.opacity >= 1) && !s.hidden && s.getTexture().isFulled) {
//                         this._veryUpper = this._sprites_upper.add(s);
//                         continue;
//                     }
//                 }
//             }
//             this._sprites_upper.add(s);
//         }
//     }
//     addLight(...lights: Light[]): void {
//         for (let l of lights) {
//             if(l) this._lights.push(l);
//         }
//     }
//     darkness_map: {data: any, location: Location, size: Size, separate?: {sx:number, sy:number}};
//     setDarknessMap(dm: {data: any, location: Location, size: Size, separate?: {sx:number, sy:number}}) {
//         this.darkness_map = dm;
//         if (!this.darkness_map.separate) {
//             this.darkness_map.separate = {
//                 sx: this.darkness_map.data.width/this.darkness_map.size.width,
//                 sy: this.darkness_map.data.height/this.darkness_map.size.height
//             }
//         }
//     }
//     removeLight(...lights: Light[]): void {
//         this._lights = this._lights.filter(l=>!lights.includes(l));
//     }
//     drawSprites(): void {
//         if (this._veryUpper && this._veryUpper.sprite) {
//             const s = this._veryUpper.sprite;
//             if ((!Number.isFinite(s.opacity) || s.opacity >= 1) && !s.hidden && s.getTexture().isFulled) {
//                 const upper_than_dark = new Array<Sprite>();
//                 this._veryUpper.forEach((sprite) => {
//                     if (sprite.upperThanDark) upper_than_dark.push(sprite);
//                     else this.drawSprite(sprite)
//                 })
//                 if (Light.isLightsEnable()) this.drawLights();
//                 upper_than_dark.forEach(sprite => this.drawSprite(sprite));
//                 return;
//             }
//         }
//         this._sprites_back.forEach((sprite) => this.drawSprite(sprite, true));

//         let ts: TreeSprite;
//         for (let sprite of this._sprites_dynamic) {
//             if (ts) ts.add(new TreeSprite(sprite));
//             else ts = new TreeSprite(sprite);
//         }
//         ts.foreach((sprite) => {
//             this.drawSprite(sprite)
//         });

//         const upper_than_dark = new Array<Sprite>();
//         this._sprites_upper.forEach((sprite) => {
//             if (sprite.upperThanDark) upper_than_dark.push(sprite);
//             else this.drawSprite(sprite)
//         })
//         if (Light.isLightsEnable()) this.drawLights();
//         upper_than_dark.forEach(sprite => this.drawSprite(sprite));
//     }
    
//     abstract drawSprite(sprite: Sprite, isBack?: boolean): void;
//     abstract filterImage(image: any, filter: (data:any)=>any, splitting?: Splitting): any;
//     abstract getImageData(image: any): Uint8ClampedArray;
//     abstract drawTextureFullScreen(texture: Texture): void;
//     abstract drawLights(): void;
// }

export { Scene };