import { EngineConfig } from "../engine/EngineConfig";
import { Game } from "../engine/Game";
import { Light } from "../engine/Light";
import { Scene } from "../engine/Scene";
import { Screen } from "../engine/Screen";
import { SuperMath } from "../engine/utils/SuperMath";
import { Texture } from "../engine/Texture";
import { Canvas2DUtils } from "./Canvas2DUtils";
import { Layer } from "../engine/Layer";
import { CanvasDynamicLayer, CanvasLayer } from "./Canvas2DLayer";

let _lx: number, _ly: number, _lw: number, _lh: number;

class Canvas2DScene extends Scene {
    main_canvas: HTMLCanvasElement;
    main_ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, context = canvas.getContext("2d")) {
        super({
            back: new CanvasLayer({canvas, context}),
            middle: new CanvasDynamicLayer({canvas, context}),
            middleDarked: new CanvasDynamicLayer(),
            upper: new CanvasLayer({canvas, context}),
            light: new CanvasLayer({canvas: (() => {
                let c = document.createElement('canvas');
                c.width = canvas.width + 200;
                c.height = canvas.height + 200;
                return c;
            })()}),
            GUI: new CanvasLayer({canvas, context}),
        });
        this.main_canvas = canvas;
        this.main_ctx = context;
    }
    render(): void {
        if (!Game.isLoaded) return;
        this.main_ctx.fillStyle = "black";
        this.main_ctx.fillRect(0, 0, Screen.width, Screen.height);
        if (EngineConfig.hide_sprites_under_dark) {
            (this.layers.middleDarked as CanvasDynamicLayer).getContext()?.clearRect(0, 0, Screen.width, Screen.height);
        }
        super.render();
    }

    drawTextureFullScreen(texture: Texture): void {
        console.log("texture was drawed: ", texture)
        Canvas2DUtils.drawImage(this.layers.GUI as CanvasLayer, texture.getImage(), 
            {x: 0, y: 0, width: Screen.width, height: Screen.height});
    }
    drawLights(hideInDark: Layer): void {
        hideInDark.draw();
        if (!Light.isLightsEnable()){
            if (!(hideInDark instanceof CanvasLayer)) return;
            this.main_ctx.drawImage(hideInDark.getCanvas(), 0, 0, Screen.width, Screen.height);
            return;
        }
        if (!(this.layers.light instanceof CanvasLayer)) return;
        const dlcanvas = this.layers.light.getCanvas();
        const dlctx = this.layers.light.getContext();
        dlctx.clearRect(0,0,dlcanvas.width,dlcanvas.height);
        
        dlctx.fillStyle = "black";
        dlctx.fillRect(0, 0, dlcanvas.width, dlcanvas.height);
        const res = {
            dx: this._camera.getResolution().x/Screen.width,
            dy: this._camera.getResolution().y/Screen.height
        };
        const PI = SuperMath.PI_int(100)*2; // 314
        for (let light of this._lights) {
            if (light.isStatic) {
                _lx = light.getLocation().x;
                _ly = light.getLocation().y;
            } else {
                _lx = (light.getLocation().x - this._camera.getLocation().x)*res.dx + Screen.half_width + 100;//+100
                _ly = (light.getLocation().y - this._camera.getLocation().y)*res.dy + Screen.half_height + 100;
            }
            dlctx.save();
            dlctx.beginPath();
            for (let i = 0; i < PI; i+=EngineConfig.graphic.light_angle_iteration) {
                if (this.checkLightFunction(light, i, res)) {
                    dlctx.lineTo(
                        light.radius*SuperMath.cos(i, 100)+_lx,
                        light.radius*SuperMath.sin(i, 100)+_ly
                    );
                }
            }
            dlctx.clip();
            dlctx.clearRect(_lx-light.radius, _ly-light.radius, light.radius*2, light.radius*2);
            dlctx.restore();
        }

        if (EngineConfig.hide_sprites_under_dark && hideInDark instanceof CanvasLayer) {
            const hidctx = hideInDark.getContext();
            hidctx.save();
            hidctx.globalCompositeOperation = "destination-out";
            hidctx.filter = `blur(${EngineConfig.graphic.light_blur})`;
            hidctx.drawImage(dlcanvas, -100, -100, Screen.width+200, Screen.height+200);
            hidctx.restore()
            this.main_ctx.drawImage(hideInDark.getCanvas(), 0, 0, Screen.width, Screen.height);
        }

        this.main_ctx.save();
        this.main_ctx.filter = `opacity(${EngineConfig.graphic.light_opacity})`;
        this.main_ctx.filter += ` blur(${EngineConfig.graphic.light_blur})`;
        this.main_ctx.drawImage(dlcanvas, -100, -100, Screen.width+200, Screen.height+200);

        // this._ctx.drawImage(dlcanvas, 0, 0, Screen.width, Screen.height);
        this.main_ctx.restore();
    }
    checkLightFunction(light: Light, i: number, res: {dx:number,dy:number}): boolean {
        if (!(this.layers.light instanceof CanvasLayer)) return;
        // const dlcanvas = this.layers.light.getCanvas();
        const dlctx = this.layers.light.getContext();
        let _llx = 0, _lly = 0, _lcos = 0, _lsin = 0;
        _lcos = SuperMath.cos(i, 100);
        _lsin = SuperMath.sin(i, 100);
        let hider = false;
        for (let radius = 0; radius <= light.radius*1.17; radius+=EngineConfig.graphic.light_radius_iteration) {
            _llx = light.getLocation().x - this.darkness_map.location.x + radius*_lcos;
            _lly = light.getLocation().y - this.darkness_map.location.y + radius*_lsin;
            _llx *= this.darkness_map.separate.sx;
            _lly *= this.darkness_map.separate.sy;
            
            _llx = Math.floor(_llx);
            _lly = Math.floor(_lly);
            if (this.darkness_map.data.data[(_llx+this.darkness_map.data.width*_lly)*4+3] >= 100){
                if (radius < 10) {
                    radius = 300;
                    dlctx.lineTo(radius*_lcos*res.dx+_lx, radius*_lsin*res.dy+_ly);
                    return false;
                }
                hider = true;
            } else if (hider) {
                dlctx.lineTo(radius*_lcos*res.dx+_lx, radius*_lsin*res.dy+_ly);
                return false;
            }
        }
        return true;
    }
    
    filterImage = Canvas2DUtils.filterImage;
    getImageData = Canvas2DUtils.getImageData;
}

// let _ctxFilter: string;

// class Canvas2DSceneOLd extends SceneOLD {
//     private _canvas: HTMLCanvasElement;
//     private _ctx: CanvasRenderingContext2D;
//     constructor(canvas: HTMLCanvasElement) {
//         super();
//         this._canvas = canvas;
//         this._ctx = canvas.getContext("2d");

//         dlcanvas = document.createElement('canvas');
//         dlcanvas.width = this._canvas.width+200;
//         dlcanvas.height = this._canvas.height+200;
//         if (EngineConfig.hide_sprites_under_dark) {
//             this._hideindark_canvas = document.createElement('canvas');
//             this._hideindark_canvas.width = this._canvas.width;
//             this._hideindark_canvas.height = this._canvas.height;
    
//             dlctx = dlcanvas.getContext('2d');
//             this._hideindark_ctx = this._hideindark_canvas.getContext('2d');
//         }
//     }
//     drawTextureFullScreen(texture: Texture): void {
//         console.log("texture was drawed: ", texture)
//         Canvas2DScene.drawImage(this._ctx, texture.getImage(), 0, 0, Screen.width, Screen.height, null, 0);
//     }
//     // static _drawedSpritedPesPeriod: number = 0;
//     // static _drawedSpritesSprite: TextTexture;
//     drawSprites(): void {
//         if (!Game.isLoaded) return;

//         // Canvas2DScene._drawedSpritedPesPeriod = 0;
//         // if (!Canvas2DScene._drawedSpritesSprite)
//         //     Canvas2DScene._drawedSpritesSprite 
//         //         = new TextTexture('Sprites: ', 'arial')
//         //         .setColor('white')
//         //         .setFontSize(30)
//         //         .setOutline('black', 1)
//         //         .setAlign('left');

//         this._ctx.fillStyle = "black";
//         this._ctx.fillRect(0, 0, Screen.width, Screen.height);
//         if (EngineConfig.hide_sprites_under_dark) {
//             this._hideindark_ctx?.clearRect(0, 0, Screen.width, Screen.height);
//         }
//         super.drawSprites();
//         // Canvas2DScene._drawedSpritesSprite.setText(`Sprites: ${Canvas2DScene._drawedSpritedPesPeriod}`);
//         // Canvas2DScene.drawText(this._ctx, Canvas2DScene._drawedSpritesSprite, 30, 40, 1000, 50);
//     }

//     private dlcanvas: HTMLCanvasElement;
//     private dlctx: CanvasRenderingContext2D;
//     private _hideindark_canvas: HTMLCanvasElement;
//     private _hideindark_ctx: CanvasRenderingContext2D;
//     drawLights(): void {
//         dlctx.clearRect(0,0,dlcanvas.width,dlcanvas.height);
        
//         dlctx.fillStyle = "black";
//         dlctx.fillRect(0, 0, dlcanvas.width, dlcanvas.height);
//         const res = {
//             dx: this._camera.getResolution().x/Screen.width,
//             dy: this._camera.getResolution().y/Screen.height
//         };
//         const PI = SuperMath.PI_int(100)*2; // 314
//         for (let light of this._lights) {
//             if (light.isStatic) {
//                 _lx = light.getLocation().x;
//                 _ly = light.getLocation().y;
//             } else {
//                 _lx = (light.getLocation().x - this._camera.getLocation().x)*res.dx + Screen.half_width + 100;//+100
//                 _ly = (light.getLocation().y - this._camera.getLocation().y)*res.dy + Screen.half_height + 100;
//             }
//             dlctx.save();
//             dlctx.beginPath();
//             for (let i = 0; i < PI; i+=EngineConfig.graphic.light_angle_iteration) {
//                 if (this.checkLightFunction(light, i, res)) {
//                     dlctx.lineTo(
//                         light.radius*SuperMath.cos(i, 100)+_lx,
//                         light.radius*SuperMath.sin(i, 100)+_ly
//                     );
//                 }
//             }
//             dlctx.clip();
//             dlctx.clearRect(_lx-light.radius, _ly-light.radius, light.radius*2, light.radius*2);
//             dlctx.restore();
//         }

//         if (EngineConfig.hide_sprites_under_dark) {
//             this._hideindark_ctx.save();
//             this._hideindark_ctx.globalCompositeOperation = "destination-out";
//             this._hideindark_ctx.filter = `blur(${EngineConfig.graphic.light_blur})`;
//             this._hideindark_ctx.drawImage(dlcanvas, -100, -100, Screen.width+200, Screen.height+200);
//             this._hideindark_ctx.restore()
//             this._ctx.drawImage(this._hideindark_canvas, 0, 0, Screen.width, Screen.height);
//         }

//         this._ctx.save();
//         this._ctx.filter = `opacity(${EngineConfig.graphic.light_opacity})`;
//         this._ctx.filter += ` blur(${EngineConfig.graphic.light_blur})`;
//         this._ctx.drawImage(dlcanvas, -100, -100, Screen.width+200, Screen.height+200);

//         // this._ctx.drawImage(dlcanvas, 0, 0, Screen.width, Screen.height);
//         this._ctx.restore();
//     }
//     checkLightFunction(light: Light, i: number, res: {dx:number,dy:number}): boolean {
//         let _llx = 0, _lly = 0, _lcos = 0, _lsin = 0;
//         _lcos = SuperMath.cos(i, 100);
//         _lsin = SuperMath.sin(i, 100);
//         let hider = false;
//         for (let radius = 0; radius <= light.radius*1.17; radius+=EngineConfig.graphic.light_radius_iteration) {
//             _llx = light.getLocation().x - this.darkness_map.location.x + radius*_lcos;
//             _lly = light.getLocation().y - this.darkness_map.location.y + radius*_lsin;
//             _llx *= this.darkness_map.separate.sx;
//             _lly *= this.darkness_map.separate.sy;
            
//             _llx = Math.floor(_llx);
//             _lly = Math.floor(_lly);
//             if (this.darkness_map.data.data[(_llx+this.darkness_map.data.width*_lly)*4+3] >= 100){
//                 if (radius < 10) {
//                     radius = 300;
//                     dlctx.lineTo(radius*_lcos*res.dx+_lx, radius*_lsin*res.dy+_ly);
//                     return false;
//                 }
//                 hider = true;
//             } else if (hider) {
//                 dlctx.lineTo(radius*_lcos*res.dx+_lx, radius*_lsin*res.dy+_ly);
//                 return false;
//             }
//         }
//         return true;
//     }
//     filterImage = Canvas2DUtils.filterImage;
//     getImageData = Canvas2DUtils.getImageData;
// }
export { Canvas2DScene };