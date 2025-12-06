import { Game } from "../engine/Game";
import { Screen } from "../engine/Screen";
import { Splitting, Sprite, StaticSprite } from "../engine/Sprite";
import { OnecolorTexture, TextTexture } from "../engine/Texture";
import { CanvasLayer } from "./Canvas2DLayer";

type CanvasDrawSettings = {
    x: number,
    y: number,
    width: number,
    height: number,
    splitting?: Splitting,
    rotation?: number,
    filter?: string
}
let _lx: number, _ly: number, _lw: number, _lh: number;

let Canvas2DUtils = {
    drawImage(layer: CanvasLayer, image: any, settings: CanvasDrawSettings) {
        if (!layer) return;
        const ctx = layer.getContext();
        if (!ctx) return;
        const {x,y,width,height} = settings;
        if (x+width < 0 || y+height < 0 || x > Screen.width || y > Screen.height) return;
        if (settings.filter && settings.filter.includes('opacity(0)')) return;
        // Canvas2DScene._drawedSpritedPesPeriod += 1;
        ctx.save();
        if (width < 0) {
            ctx.translate(x, y);
            if (settings.rotation) {
                ctx.translate(-width/2, height/2);
                ctx.rotate(settings.rotation);
                ctx.translate(width/2, -height/2);
            }
            ctx.scale(-1,1);
            ctx.translate(width, 0);
            if (settings.filter) ctx.filter = settings.filter;
            if (settings.splitting) {
                const s = settings.splitting;
                ctx.drawImage(image, s.x, s.y, s.width, s.height, 0, 0, -width, height);
            }
            else ctx.drawImage(image, 0, 0, -width, height);
        } else {
            ctx.translate(x, y);
            if (settings.rotation) {
                ctx.translate(width/2, height/2);
                ctx.rotate(settings.rotation);
                ctx.translate(-width/2, -height/2);
            }
            if (settings.filter) ctx.filter = settings.filter;
            
            if (settings.splitting) {
                const s = settings.splitting;
                ctx.drawImage(image, s.x, s.y, s.width, s.height, 0, 0, width, height);
            }
            else ctx.drawImage(image, 0, 0, width, height);
        }
        ctx.restore();
    },
    drawText(layer: CanvasLayer, tt: TextTexture, settings: CanvasDrawSettings) {
        if (!layer) return;
        const ctx = layer.getContext();
        if (!ctx) return;
        const {x,y,width,height} = settings;
        if (x+width < 0 || y+height+tt.fontsize < 0 || x-width > Screen.width || y-height-tt.fontsize > Screen.height) return;
        if (settings.filter && settings.filter.includes('opacity(0)')) return;
        // Canvas2DScene._drawedSpritedPesPeriod += 1;
        ctx.save();
        if (settings.filter) ctx.filter = settings.filter;
        ctx.font = `${tt.fontsize}px ${tt.font}`;
        ctx.textAlign = tt.align as CanvasTextAlign;
        if (tt.outline.color && tt.outline.width) {
            ctx.strokeStyle = tt.outline.color;
            ctx.lineWidth = tt.outline.width;
            ctx.strokeText(tt.text, x, y, width);
        }
        ctx.fillStyle = tt.color;
        ctx.fillText(tt.text, x, y, width);
        ctx.restore();
    },
    filterImage(image: any, filter: (data: any) => any, splitting?: Splitting) {
        let canvas = document.createElement('canvas');
        if (image.width == 0) return image;
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        if (splitting) {
            const data = filter(ctx.getImageData(splitting.x, splitting.y,
                splitting.width, splitting.height));
            canvas.remove();
            canvas = document.createElement('canvas');
            if (image.width == 0) return image;
            canvas.width = splitting.width;
            canvas.height = splitting.height;
            ctx = canvas.getContext('2d');
            ctx.putImageData(data, 0, 0);
        } else {
            ctx.putImageData(filter(ctx.getImageData(0, 0, canvas.width, canvas.height)), 0,0);
        }
        let img = new Image;
        img.src = canvas.toDataURL("image/png");
        img.width = splitting ? splitting.width : image.width;
        img.height = splitting ? splitting.height : image.height;
        Object.defineProperty(img, "geIsLoaded", {
            get: function () { return true; },
            enumerable: false,
            configurable: true
        });
        canvas.remove();
        return img;
    },
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
    }, 
    drawSprite(layer: CanvasLayer, sprite: Sprite): void {
        if (!layer) return;
        if (sprite.hidden) return;
        let img = sprite.getTexture().getImage();
        const camera = Game.getCamera();
        const res = {
            dx: camera.getResolution().x/Screen.width,
            dy: camera.getResolution().y/Screen.height
        };

        if (sprite instanceof StaticSprite) {
            _lx = sprite.getLocation().x;
            _ly = sprite.getLocation().y;
            if (sprite.margin) {
                let margin = sprite.margin;
                if (margin.x < 0) _lx = Screen.width - _lx + margin.x;
                else _lx += margin.x;
                if (margin.y < 0) _ly = Screen.height - _ly + margin.y;
                else _ly += margin.y;
            }
            _lw = sprite.width;
            _lh = sprite.height;
        } else {
            _lx = (sprite.getLocation().x - camera.getLocation().x)*res.dx + Screen.width/2;
            _ly = (sprite.getLocation().y - camera.getLocation().y)*res.dy + Screen.height/2;
            _lw = sprite.width*res.dx;
            _lh = sprite.height*res.dy;
            if (sprite.margin) {
                _lx += sprite.margin.x;
                _ly += sprite.margin.y;
            }
        }
        // const ctx = EngineConfig.hide_sprites_under_dark && sprite.isHideInDark() 
        //         && Light.isLightsEnable() ? this123._hideindark_ctx : this123._ctx;
        if (!img) {
            if (sprite.getTexture() instanceof TextTexture) {
                // if (EngineConfig.hide_sprites_under_dark && !isBack && Light.isLightsEnable()){
                //     Canvas2DScene.drawText(this123._hideindark_ctx, sprite.getTexture() as TextTexture, _lx, _ly, _lw, _lh, sprite.getFilters())
                //     if (sprite.isHideInDark()) return;
                // }
                Canvas2DUtils.drawText(layer, sprite.getTexture() as TextTexture, {
                    x: _lx, y: _ly, width: _lw, height: _lh, filter: sprite.getFilters()
                })
            }
            const ctx = layer.getContext();
            if (sprite.getTexture() instanceof OnecolorTexture) {
                const {r,g,b} = (sprite.getTexture() as OnecolorTexture).color;
                const rotation = sprite.getLocation().yaw;
                ctx.save();
                if (!Number.isNaN(sprite.opacity)) ctx.filter = `opacity(${sprite.opacity})`
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.translate(_lx, _ly);
                if (rotation) {
                    ctx.translate(_lw/2, _ly/2);
                    ctx.rotate(rotation);
                    ctx.translate(-_lw/2, -_ly/2);
                }
                ctx.fillRect(0, 0, _lw, _lh);
                ctx.restore();
            }
            return;
        } else {
            if (!img.geIsLoaded) return;
            // if (EngineConfig.hide_sprites_under_dark && !isBack && Light.isLightsEnable()){
            //     Canvas2DScene.drawImage(this123._hideindark_ctx, img, _lx, _ly, _lw, _lh, sprite.splitting, sprite.getLocation().yaw, sprite.getFilters());
            //     if (sprite.isHideInDark()) return;
            // }
            Canvas2DUtils.drawImage(layer, img, {
                x: _lx, y: _ly, width: _lw, height: _lh,
                splitting: sprite.splitting,
                rotation: sprite.getLocation().yaw,
                filter: sprite.getFilters() 
            });
        }
    }
}

export {Canvas2DUtils}