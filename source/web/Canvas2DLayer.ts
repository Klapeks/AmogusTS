import { AbstractDynamicLayer, AbstractFilterLayer, FilterLayerSettings, IDynamicLayer, IFilterLayer, Layer } from "../engine/Layer";
import { Screen } from "../engine/Screen";
import { Sprite } from "../engine/Sprite";
import { Canvas2DUtils } from "./Canvas2DUtils";

type CanvasLayerSettings = {
    canvas?: HTMLCanvasElement,
    context?: CanvasRenderingContext2D,
    filter?: FilterLayerSettings
}

class CanvasLayer implements Layer, IFilterLayer, IDynamicLayer {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    
    private _layer: Layer;
    constructor(type: "filter" | "dynamic", settings?: CanvasLayerSettings) {
        if (!settings?.canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.width = Screen.width;
            this._canvas.height = Screen.height;
        } else {
            this._canvas = settings?.canvas;
        }
        this._ctx = settings?.context || this._canvas.getContext('2d');
        if (type==="dynamic") {
            this._layer = new CanvasDynamicLayer();
        } else {
            this._layer = new CanvasFilterLayer(settings?.filter);
        }
        this._layer.drawSprite = (sprite) => {
            Canvas2DUtils.drawSprite(this, sprite);
        };
    }
    add = (...s: Sprite[]) => this._layer.add(...s); 
    remove = (...s: Sprite[]) => this._layer.remove(...s); 
    draw = () => this._layer.draw(); 

    drawSprite(sprite: Sprite): void {
        this._layer.drawSprite(sprite);
    }
    recalculate(): void {
        if (this._layer instanceof AbstractFilterLayer) {
            this._layer.recalculate();
        }
    }
    hasFullscreen(): boolean {
        if (this._layer instanceof AbstractFilterLayer) {
            return this._layer.hasFullscreen();
        }
        return false;
    }
    isFullscreen(s: Sprite): boolean {
        if (this._layer instanceof AbstractFilterLayer) {
            return this._layer.isFullscreen(s);
        }
        return false;
    }

    getCanvas = () => this._canvas;
    getContext = () => this._ctx;

    isFilter(): this is IFilterLayer { return this._layer.isFilter(); }
    isDynamic(): this is IDynamicLayer { return this._layer.isDynamic(); }
    
    forEach(f: (sprite: Sprite) => void): void {
        this._layer.forEach(f);
    }
}

class CanvasFilterLayer extends AbstractFilterLayer {
    drawSprite(sprite: Sprite): void {}
}
class CanvasDynamicLayer extends AbstractDynamicLayer {
    drawSprite(sprite: Sprite): void {}
}

export { CanvasLayer };