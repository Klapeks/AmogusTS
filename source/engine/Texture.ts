import { Color } from "./Color";
import { Game } from "./Game";
import { Splitting } from "./Sprite";

function image_on_load(texture: Texture, image: any) {
    if (!texture.getPath().includes("/amogus/"))console.log(`Texture ${texture.getPath()} was loaded`);
    Object.defineProperty(image, "geIsLoaded", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    texture.onload();
    TextureFuncs.loadingTextures--;
}
let TextureFuncs = {
    loadingTextures: 0
};
class Texture {
    private _path: string;
    private _image: any;
    private _onload: ()=>void = () => {};
    constructor(path: string, image?: any, onload?: (texture: Texture)=>void) {
        if (onload) this._onload = () => onload(this);
        if (path){
            this._path = Game.functions.texturePath(path);
            if (image) {
                this._image = image;
                if (onload) {
                    TextureFuncs.loadingTextures++;
                    image_on_load(this, this._image);
                }
            }
            else {
                TextureFuncs.loadingTextures++;
                this._image = Game.functions.generateImage(this, image_on_load);
            }
        }
    }
    set onload(l: ()=>void){
        this._onload = l;
    }
    get onload() {
        return this._onload;
    }
    setImage(image: any) {
        this._image = image;
        return this;
    }
    getPath(){
        return this._path;
    }
    getImage(): any {
        return this._image;
    }
    isFulled = false;
    settings(set: {isFulled?:boolean}){
        this.isFulled ??= set.isFulled;
        return this;
    }
}
class SplittedTexture extends Texture {
    constructor(path: string, splitting: Splitting, image?: any, onload?: ()=>void) {
        super(path, image, () => {
            this.setImage(Game.getScene().filterImage(this.getImage(), i=>i, splitting));
            onload();
        });
    }
}
class MultiTexture extends Texture {
    private _textures: Array<Texture> = new Array();
    private _textureID = 0;
    constructor(...text : (Texture | string)[]) {
        super (null,null)
        for (let t of text) {
            this._textures.push(typeof t === "string" ? new Texture(t) : t);
        }
        // this._textures = text;
    }
    getPath(){
        return this._textures[this._textureID].getPath();
    }
    getImage(): any {
        return this._textures[this._textureID].getImage();
    }
    setID(id: number) {
        if (id < 0 || id >= this._textures.length) return this;
        this._textureID = id;
        return this;
    }
}
class OnecolorTexture extends Texture {
    color: Color;
    constructor(color: Color){
        super(null);
        this.color = color;
        this.isFulled = true;
    }
}
class TextTexture extends Texture {
    text: string;
    font: string;
    align = "start";
    color = "black";
    fontsize = 0;
    constructor(text: string, font: string){
        super(null);
        this.text = text;
        this.font = font;
    }
    setFontSize(fontsize: number) {
        this.fontsize = fontsize;
        return this;
    }
    setAlign(align: string) {
        this.align = align;
        return this;
    }
    setColor(color: string | Color) {
        if (typeof color !== "string") 
            color = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.color = color;
        return this;
    }
    setFont(font: string) {
        this.font = font;
        return this;
    }
    setText(text: string) {
        this.text = text;
        return this;
    }

    outline = {color:null, width:null}; 
    setOutline(color: string, width: number): TextTexture {
        this.outline = {color, width};
        return this;
    }
}

type SplitingTexture = {texture: Texture, width: number, height: number, amount_per_line: number, amount: number};
let NullTexture = new Texture(null);

export {Texture, TextTexture, TextureFuncs, NullTexture, SplitingTexture, MultiTexture, OnecolorTexture, SplittedTexture};