import { Game } from "../../../engine/Game";
import { Location, Size } from "../../../engine/Location";
import { Sprite } from "../../../engine/Sprite";
import { Texture } from "../../../engine/Texture";
import { Task } from "../items/tasks/task";
import { Vents } from "../items/vents";
import { EmergencyButton } from "../meeting/emergencybutton";

// type Pos
class MapBuilder {
    constructor() {}
    texture: Texture;
    setTexture(texture: Texture) {
        this.texture = texture;
        return this;
    }

    hitbox: {data: Uint8ClampedArray, width: number, height: number};
    setHitboxfile(path: string) {
        if (path.endsWith(".png")) {
            let t = new Texture(path, null, () => {
                this.hitbox = {
                    data: Game.getScene().getImageData(t.getImage()),
                    width: t.getImage().width,
                    height: t.getImage().height
                };
            });
        }
        return this;
    }

    uppertexture: Texture;
    setUpperTexture(uppertexture: Texture) {
        this.uppertexture = uppertexture;
        return this;
    }
    
    tasks: Array<Task> = new Array();
    addTask(...task: Task[]) {
        task.forEach(t=>this.tasks.push(t));
        return this;
    }

    vents: Array<Vents> = new Array();
    addVents(...vent: Vents[]) {
        vent.forEach(t=>this.vents.push(t));
        return this;
    }

    emergencybutton: EmergencyButton;
    setEmergencyButton(emergencybutton: EmergencyButton) {
        this.emergencybutton = emergencybutton;
        return this;
    }

    size: Size;
    setSize(size: Size) {
        this.size = size;
        return this;
    }

    build() {
        return new Map(this);
    }

    static union(...vents: Vents[]): Vents[] {
        for (let i = 0; i < vents.length; i++){
            vents[i].directions = new Array();
            for (let j = 0; j < vents.length; j++){
                if (i===j) continue;
                vents[i].directions.push(vents[j]);
            }
        }
        return vents;
    }
}

class Map {
    private _b: MapBuilder;
    private _sprite: Sprite;
    private _uppersprite: Sprite;
    constructor(b: MapBuilder) {
        if (!b) return;
        this._sprite = new Sprite(b.texture)
            .setSize(b.size.width, b.size.height)
            .setLocationByCenter(0,0);
        if (b.uppertexture) this._uppersprite = new Sprite(b.uppertexture)
            .setSize(b.size.width, b.size.height)
            .setLocationByCenter(0,0);

        this._b = b;
        this._sprite.hidden = true;
        this._uppersprite.hidden = true;
        Game.getScene().addBackSprite(this._sprite);
        if (this._uppersprite) Game.getScene().LayerUpper.add(this._uppersprite);

        this._b.tasks.forEach(t=>t.registerSprite())
        this._b.vents.forEach(v=>v.registerSprite())
        this._b.emergencybutton.registerSprite();
        
        // gamelogic.eventListeners.onmapload.check();
    }
    getLocation(){
        return this._sprite.getLocation();
    }
    getSprite(){
        return this._sprite;
    }
    onVisibleChange(isVisibleNow: boolean) {}
    set hidden(b: boolean) {
        this._sprite.hidden = b;
        this._uppersprite.hidden = b;
        this.onVisibleChange(!b);
    }
    get tasks() {
        return this._b?.tasks;
    }
    get vents() {
        return this._b?.vents;
    }
    get emergencybutton() {
        return this._b?.emergencybutton;
    }
    getHitboxColorMap(x:number, y:number) {
        if (!this._b.hitbox) {
            return null;
        }
        if (x < 0 || y < 0) {
            // console.log(`${x} < 0  ||  ${y} < 0`);
            return null;
        }
        x = Math.floor(x * this._b.hitbox.width / this._b.size.width);
        y = Math.floor(y * this._b.hitbox.height / this._b.size.height);
        // x = Math.floor(x); y = Math.floor(y);
        x = (x+y*this._b.hitbox.width)*4;
        // x = Math.floor(x);
        if (x >= this._b.hitbox.data.length-4) {
            return null;
        }
        if (this._b.hitbox.data[x+3] > 200) 
            return [this._b.hitbox.data[x],
                    this._b.hitbox.data[x+1],
                    this._b.hitbox.data[x+2],
                    this._b.hitbox.data[x+3]]
        else return null; 
    }
    getHitboxColor(loc: {x: number, y: number}) {
        return this.getHitboxColorMap(loc.x - this._sprite.getLocation().x,
                loc.y - this._sprite.getLocation().y);
    }
    update() {}
}


export {Map, MapBuilder}