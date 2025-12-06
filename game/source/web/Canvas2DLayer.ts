import { AbstractDynamicLayer, AbstractLayer, DynamicLayer, Layer, LayerSettings } from "../engine/Layer";
import { Screen } from "../engine/Screen";
import { Sprite } from "../engine/Sprite";
import { Canvas2DUtils } from "./Canvas2DUtils";

type CanvasLayerSettings = {
    canvas?: HTMLCanvasElement,
    context?: CanvasRenderingContext2D,
    defset?: LayerSettings
}

class CanvasLayer extends AbstractLayer {
    protected _canvas: HTMLCanvasElement;
    protected _ctx: CanvasRenderingContext2D;

    constructor(settings?: CanvasLayerSettings) {
        super(settings?.defset);
        if (!settings?.canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.width = Screen.width;
            this._canvas.height = Screen.height;
        } else {
            this._canvas = settings?.canvas;
        }
        this._ctx = settings?.context || this._canvas.getContext('2d');
    }

    drawSprite(sprite: Sprite): void {
        Canvas2DUtils.drawSprite(this, sprite);
    }

    getCanvas = () => this._canvas;
    getContext = () => this._ctx;
}

class _a extends AbstractDynamicLayer {
    drawSprite(sprite: Sprite): void {}
}
class CanvasDynamicLayer extends CanvasLayer implements DynamicLayer, Layer {

    private _layer: AbstractDynamicLayer;
    constructor(settings?: CanvasLayerSettings) {
        super(settings);
        this._layer = new _a();

        this._layer.drawSprite = (sprite) => {
            Canvas2DUtils.drawSprite(this, sprite);
        };
    }
    addDynamic = (...s: Sprite[]) => this._layer.addDynamic(...s); 
    removeDynamic = (...s: Sprite[]) => this._layer.removeDynamic(...s); 
    drawDynamic = () => this._layer.drawDynamic(); 

    add = (...s: Sprite[]) => this._layer.add(...s); 
    remove = (...s: Sprite[]) => this._layer.remove(...s); 
    draw = () => this._layer.draw(); 

    drawSprite(sprite: Sprite): void {
        this._layer.drawSprite(sprite);
    }
    recalculate(): void {
        this._layer.recalculate();
    }
    hasFullscreen(): boolean {
        return this._layer.hasFullscreen();
    }
    isFullscreen(s: Sprite): boolean {
        return this._layer.isFullscreen(s);
    }

    getCanvas = () => this._canvas;
    getContext = () => this._ctx;

    isDynamic(): this is DynamicLayer { return true; }
    
    forEach(f: (sprite: Sprite) => void): void {
        this._layer.forEach(f);
    }
}


export { CanvasLayer, CanvasDynamicLayer };