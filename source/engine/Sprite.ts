import { HitboxLocation, Location, Size } from "./Location";
import { Screen } from "./Screen";
import { Texture } from "./Texture";

type Splitting = {x: number, y: number, width: number, height: number};

class Sprite {
    private _tex: Texture;
    private _loc: Location;
    private _size: Size = {width:0, height:0};
    private _split: Splitting | null = null;
    constructor(texture: Texture, location: Location = new Location(0, 0)) {
        if (!texture) return;
        this._tex = texture;
        this._loc = location;
    }
    set splitting(sp: Splitting | null){
        this._split = sp;
    }
    get splitting() {
        return this._split;
    }
    private _hidden = false;
    set hidden(b: boolean){
        this._hidden = b;
    }
    get hidden() {
        return this._hidden;
    }
    setSplitting(x: number, y: number, width: number, height: number) {
        this._split = {x,y,width,height};
        if (this._size.width==0&&this._size.height==0) this._size = {width, height};
        return this;
    }
    setSplittingS(x: number, y: number, tox: number, toy: number) {
        return this.setSplitting(x,y, tox-x, toy-y);
    }
    multiplySize(m: number) {
        this._size.width*=m;
        this._size.height*=m;
        return this;
    }
    setLocation(x: number, y: number) {
        if (!this._loc) this._loc = new Location(x,y);
        else {
            this._loc.x = x;
            this._loc.y = y;
        }
        return this;
    }
    setTexture(tex: Texture) {
        this._tex = tex;
        return this;
    }
    setSize(width: number, height: number) {
        this._size = {width, height};
        return this;
    }
    get width(): number {
        return this._size.width;
    }
    get height(): number {
        return this._size.height;
    }
    set width(w: number) {
        this._size.width = w;
    }
    set height(h: number) {
        this._size.height = h;
    }
    getHitboxPos(): HitboxLocation {
        return {
            location: this._loc,
            size: {width: this.width, height: this.height}
        };
    }
    setLocationByCenter(x: number, y: number) {
        this._loc.x = x - Math.abs(this.width)/2;
        this._loc.y = y - Math.abs(this.height)/2;
        return this;
    }
    setLocationYaw(yaw: number) {
        this._loc.yaw = yaw;
        return this;
    }
    getCenter(): {x: number, y: number} {
        return {
            x: this._loc.x + Math.abs(this.width)/2,
            y: this._loc.y + Math.abs(this.height)/2,
        };
    }
    getLocation(): Location {
        return this._loc;
    }
    getTexture(): Texture {
        return this._tex;
    }
    upperThanDark = false;
    private _hideInDark = false;
    isHideInDark() {
        return this._hideInDark;
    }
    setHideInDark(b: boolean) {
        this._hideInDark = b;
        return this;
    }
    opacity: number;
    setOpacity(opacity: number){
        this.opacity = opacity;
        return this;
    }
    
    priority = 0;
    setPriority(priority: number) {
        this.priority = priority;
        return this;
    }

    // set _deprecated_change_location_object(location: Location) {
    //     this._loc = location;
    // }
    private _margin: {x: number, y: number};

    setMargin(margin: {x:number, y:number}){
        this.margin = margin;
        return this;
    }
    set margin(margin: {x:number, y:number}) {
        this._margin = margin;
    }
    get margin() {
        return this._margin;
    }
}

class StaticSprite extends Sprite {
    constructor(texture: Texture, location: Location = new Location(0, 0)) {
        super(texture, location);
        this.upperThanDark = true;
        this.setMargin({ x: 0, y: 0 });
    }
}
let FullscreenSprite = (texture: Texture | string): StaticSprite => {
    return new StaticSprite(typeof texture === "string" ? new Texture(texture) : texture)
            .setSize(Screen.width, Screen.height);
}

let NullSprite: Sprite = new Sprite(null);

export { Sprite, Splitting, StaticSprite, NullSprite, FullscreenSprite};