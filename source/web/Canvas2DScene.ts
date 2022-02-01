import { Camera } from "../engine/Camera";
import { EngineConfig } from "../engine/EngineConfig";
import { Game } from "../engine/Game";
import { Light } from "../engine/Light";
import { BiLocation } from "../engine/Location";
import { Scene } from "../engine/Scene";
import { Screen } from "../engine/Screen";
import { Splitting, Sprite, StaticSprite } from "../engine/Sprite";
import { SuperMath } from "../engine/SuperMath";
import { OnecolorTexture, TextTexture, Texture } from "../engine/Texture";
import { config } from "../testgame/config";

let _lx: number, _ly: number, _lw: number, _lh: number;

class Canvas2DScene extends Scene {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement) {
        super();
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");

        this._drawlight_canvas = document.createElement('canvas');
        this._drawlight_canvas.width = this._canvas.width+200;
        this._drawlight_canvas.height = this._canvas.height+200;
        if (EngineConfig.hide_sprites_under_dark) {
            this._hideindark_canvas = document.createElement('canvas');
            this._hideindark_canvas.width = this._canvas.width;
            this._hideindark_canvas.height = this._canvas.height;
    
            this._drawlight_ctx = this._drawlight_canvas.getContext('2d');
            this._hideindark_ctx = this._hideindark_canvas.getContext('2d');
        }
    }
    drawTextureFullScreen(texture: Texture): void {
        console.log("texture was drawed: ", texture)
        Canvas2DScene.drawImage(this._ctx, texture.getImage(), 0, 0, Screen.width, Screen.height, null, 0);
    }
    drawSprites(): void {
        if (!Game.isLoaded) return;
        this._ctx.fillStyle = "black";
        this._ctx.fillRect(0, 0, Screen.width, Screen.height);
        if (EngineConfig.hide_sprites_under_dark) {
            this._hideindark_ctx?.clearRect(0, 0, Screen.width, Screen.height);
        }
        super.drawSprites();
    }
    drawSprite(sprite: Sprite, isBack = false): void {
        if (sprite.hidden) return;
        let img = sprite.getTexture().getImage();
        const res = {
            dx: this._camera.getResolution().x/Screen.width,
            dy: this._camera.getResolution().y/Screen.height
        };
        if (sprite instanceof StaticSprite) {
            _lx = sprite.getLocation().x;
            _ly = sprite.getLocation().y;
            let margin = (sprite as StaticSprite).margin;
            if (margin.x < 0) _lx = Screen.width - _lx + margin.x;
            else _lx += margin.x;
            if (margin.y < 0) _ly = Screen.height - _ly + margin.y;
            else _ly += margin.y;
            _lw = sprite.width;
            _lh = sprite.height;
        } else {
            _lx = (sprite.getLocation().x - this._camera.getLocation().x)*res.dx + Screen.width/2;
            _ly = (sprite.getLocation().y - this._camera.getLocation().y)*res.dy + Screen.height/2;
            _lw = sprite.width*res.dx;
            _lh = sprite.height*res.dy;
        }
        const ctx = EngineConfig.hide_sprites_under_dark && sprite.isHideInDark() ? this._hideindark_ctx : this._ctx;
        if (!img) {
            if (sprite.getTexture() instanceof TextTexture) {
                if (EngineConfig.hide_sprites_under_dark && !isBack){
                    Canvas2DScene.drawText(this._hideindark_ctx, sprite.getTexture() as TextTexture, _lx, _ly, _lw, _lh, sprite.opacity)
                    if (sprite.isHideInDark()) return;
                }
                Canvas2DScene.drawText(ctx, sprite.getTexture() as TextTexture, _lx, _ly, _lw, _lh, sprite.opacity)
            }
            if (sprite.getTexture() instanceof OnecolorTexture) {
                const {r,g,b} = (sprite.getTexture() as OnecolorTexture).color;
                const rotation = sprite.getLocation().yaw;
                this._ctx.save();
                if (!Number.isNaN(sprite.opacity)) ctx.filter = `opacity(${sprite.opacity})`
                this._ctx.fillStyle = `rgb(${r},${g},${b})`;
                this._ctx.translate(_lx, _ly);
                if (rotation) {
                    this._ctx.translate(_lw/2, _ly/2);
                    this._ctx.rotate(rotation);
                    this._ctx.translate(-_lw/2, -_ly/2);
                }
                this._ctx.fillRect(0, 0, _lw, _lh);
                this._ctx.restore();
            }
            return;
        } else {
            if (!img.geIsLoaded) return;
            if (EngineConfig.hide_sprites_under_dark && !isBack){
                Canvas2DScene.drawImage(this._hideindark_ctx, img, _lx, _ly, _lw, _lh, sprite.splitting, sprite.getLocation().yaw, sprite.opacity);
                if (sprite.isHideInDark()) return;
            }
            Canvas2DScene.drawImage(ctx, img, _lx, _ly, _lw, _lh, sprite.splitting, sprite.getLocation().yaw, sprite.opacity);
        }
    }

    static drawText(ctx: CanvasRenderingContext2D, tt: TextTexture, x: number, y: number, dx: number, dy: number, opacity?: number) {
        if (!ctx) return;
        ctx.save();
        if (!Number.isNaN(opacity)) ctx.filter = `opacity(${opacity})`;
        ctx.font = `${tt.fontsize}px ${tt.font}`;
        ctx.textAlign = tt.align as CanvasTextAlign;
        if (tt.outline.color && tt.outline.width) {
            ctx.strokeStyle = tt.outline.color;
            ctx.lineWidth = tt.outline.width;
            ctx.strokeText(tt.text, x, y, dx);
        }
        ctx.fillStyle = tt.color;
        ctx.fillText(tt.text, x, y, dx);
        ctx.restore();
    }
    static drawImage(ctx: CanvasRenderingContext2D, image: any, x: number, y: number, dx: number, dy: number, s: Splitting | null, rotation: number, opacity?: number) {
        if (!ctx) return;
        ctx.save();
        if (!Number.isNaN(opacity)) ctx.filter = `opacity(${opacity})`;
        if (dx < 0) {
            ctx.translate(x, y);
            if (rotation) {
                ctx.translate(-dx/2, dy/2);
                ctx.rotate(rotation);
                ctx.translate(dx/2, -dy/2);
            }
            ctx.scale(-1,1);
            ctx.translate(dx, 0);
            if (s) ctx.drawImage(image, s.x, s.y, s.width, s.height, 0, 0, -dx, dy);
            else ctx.drawImage(image, 0, 0, -dx, dy);
        } else {
            ctx.translate(x, y);
            if (rotation) {
                ctx.translate(dx/2, dy/2);
                ctx.rotate(rotation);
                ctx.translate(-dx/2, -dy/2);
            }
            if (s) ctx.drawImage(image, s.x, s.y, s.width, s.height, 0, 0, dx, dy);
            else ctx.drawImage(image, 0, 0, dx, dy);
        }
        ctx.restore();
    }
    filterImage(image: any, filter: (data: any) => any) {
        let canvas = document.createElement('canvas');
        if (image.width == 0) return image;
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        ctx.putImageData(filter(ctx.getImageData(0, 0, canvas.width, canvas.height)), 0,0);
        let img = new Image;
        img.src = canvas.toDataURL("image/png");
        img.width = image.width;
        img.height = image.height;
        Object.defineProperty(img, "geIsLoaded", {
            get: function () { return true; },
            enumerable: false,
            configurable: true
        });
        canvas.remove();
        return img;
    }
    getImageData(image: any): Uint8ClampedArray {
        let canvas = document.createElement('canvas');
        if (image.width == 0) return image;
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        canvas.remove();
        return data;
    }

    private _drawlight_canvas: HTMLCanvasElement;
    private _drawlight_ctx: CanvasRenderingContext2D;
    private _hideindark_canvas: HTMLCanvasElement;
    private _hideindark_ctx: CanvasRenderingContext2D;
    drawLights(): void {
        this._drawlight_ctx.clearRect(0,0,this._drawlight_canvas.width,this._drawlight_canvas.height);
        
        this._drawlight_ctx.fillStyle = "black";
        this._drawlight_ctx.fillRect(0, 0, this._drawlight_canvas.width, this._drawlight_canvas.height);
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
            this._drawlight_ctx.save();
            this._drawlight_ctx.beginPath();
            for (let i = 0; i < PI; i+=config.graphic.light_angle_iteration) {
                if (this.checkLightFunction(light, i, res)) {
                    this._drawlight_ctx.lineTo(
                        light.radius*SuperMath.cos(i, 100)+_lx,
                        light.radius*SuperMath.sin(i, 100)+_ly
                    );
                }
            }
            this._drawlight_ctx.clip();
            this._drawlight_ctx.clearRect(_lx-light.radius, _ly-light.radius, light.radius*2, light.radius*2);
            this._drawlight_ctx.restore();
        }

        if (EngineConfig.hide_sprites_under_dark) {
            this._hideindark_ctx.save();
            this._hideindark_ctx.globalCompositeOperation = "destination-out";
            this._hideindark_ctx.filter = `blur(${config.graphic.light_blur})`;
            this._hideindark_ctx.drawImage(this._drawlight_canvas, -100, -100, Screen.width+200, Screen.height+200);
            this._hideindark_ctx.restore()
            this._ctx.drawImage(this._hideindark_canvas, 0, 0, Screen.width, Screen.height);
        }

        this._ctx.save();
        this._ctx.filter = `opacity(${config.graphic.light_opacity})`;
        this._ctx.filter += ` blur(${config.graphic.light_blur})`;
        this._ctx.drawImage(this._drawlight_canvas, -100, -100, Screen.width+200, Screen.height+200);

        // this._ctx.drawImage(this._drawlight_canvas, 0, 0, Screen.width, Screen.height);
        this._ctx.restore();
    }
    checkLightFunction(light: Light, i: number, res: {dx:number,dy:number}): boolean {
        let _llx = 0, _lly = 0, _lcos = 0, _lsin = 0;
        _lcos = SuperMath.cos(i, 100);
        _lsin = SuperMath.sin(i, 100);
        let hider = false;
        for (let radius = 0; radius <= light.radius*1.17; radius+=config.graphic.light_radius_iteration) {
            _llx = light.getLocation().x - this.darkness_map.location.x + radius*_lcos;
            _lly = light.getLocation().y - this.darkness_map.location.y + radius*_lsin;
            _llx *= this.darkness_map.separate.sx;
            _lly *= this.darkness_map.separate.sy;
            
            _llx = Math.floor(_llx);
            _lly = Math.floor(_lly);
            if (this.darkness_map.data.data[(_llx+this.darkness_map.data.width*_lly)*4+3] >= 100){
                if (radius < 10) {
                    radius = 300;
                    this._drawlight_ctx.lineTo(radius*_lcos*res.dx+_lx, radius*_lsin*res.dy+_ly);
                    return false;
                }
                hider = true;
            } else if (hider) {
                this._drawlight_ctx.lineTo(radius*_lcos*res.dx+_lx, radius*_lsin*res.dy+_ly);
                return false;
            }
        }
        return true;
    }
    // copyImageData(rule: {copy: BiLocation, paste: BiLocation, isStaticPaste: boolean}):
    //                     {paste: BiLocation, data: ImageData, isStaticPaste: boolean} {
    //     const res = this._camera.getResolution();
    //     _lx = (rule.copy.x - this._camera.getLocation().x)*res.x/Screen.width + Screen.width/2;
    //     _ly = (rule.copy.y - this._camera.getLocation().y)*res.y/Screen.height + Screen.height/2;
    //     _lw = rule.copy.width*res.x/Screen.width;
    //     _lh = rule.copy.height*res.y/Screen.height;
    //     let data = this._ctx.getImageData(_lx, _ly, _lw, _lh);
    //     return {paste: rule.paste, isStaticPaste: rule.isStaticPaste, data};
    // }
    // pasteImageData(data: {paste: BiLocation, data: ImageData, isStaticPaste: boolean}): void {
    //     if (data.isStaticPaste) {
    //         this._ctx.putImageData(data.data, data.paste.x, data.paste.y, 0, 0, data.paste.width, data.paste.height)
    //     } else {
    //         const res = this._camera.getResolution();
    //         _lx = (data.paste.x - this._camera.getLocation().x)*res.x/Screen.width + Screen.width/2;
    //         _ly = (data.paste.y - this._camera.getLocation().y)*res.y/Screen.height + Screen.height/2;
    //         _lw = data.paste.width*res.x/Screen.width;
    //         _lh = data.paste.height*res.y/Screen.height;
    //         this._ctx.putImageData(data.data, _lx, _ly, 0, 0, _lw, _lh);
    //     }
    // }
}
export { Canvas2DScene };