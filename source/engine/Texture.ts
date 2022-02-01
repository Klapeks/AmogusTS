import { Color } from "./Color";
import { Game } from "./Game";

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
    constructor(path: string, image?: any, onload?: ()=>void) {
        if (onload) this._onload = onload;
        if (path){
            this._path = Game.functions.texturePath(path);
            if (image) this._image = image;
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
        this._textureID = id;
    }
}
class OnecolorTexture extends Texture {
    color: Color;
    constructor(color: Color){
        super(null);
        this.color = color;
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
    setColor(color: string) {
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

export {Texture, TextTexture, TextureFuncs, NullTexture, SplitingTexture, MultiTexture, OnecolorTexture};