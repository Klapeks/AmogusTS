import { Game } from "../../../engine/Game";
import { InteractableItem } from "../../../engine/InteractableItem";
import { BiLocation, Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { MultiSound, Sound } from "../../../engine/Sound";
import { Sprite } from "../../../engine/Sprite";
import { NullTexture, Texture } from "../../../engine/Texture";
import { Retexturing } from "../../../engine/utils/Retexturing";
import { Character } from "../../characters/Character";
import { config } from "../../config";
import { logic_buttons } from "../buttons";
import { Characters } from "../charslog";
import { GameLogic } from "../gamelogic";
import { logic_map } from "../maps/maplogic";

let textures = {
    idle: NullTexture,
    animation: new Array<Texture>(),
    arrow: NullTexture
}
let sounds: {
    move: MultiSound,
    open: Sound
};

class Vents extends InteractableItem {
    constructor(location: BiLocation) {
        super(null, location, "back");
        if (!sounds?.open) sounds = {
            move: new MultiSound('tasks/vent/move1.wav','tasks/vent/move2.wav','tasks/vent/move3.wav'),
            open: new Sound('tasks/vent/open.wav')
        };
        this.setRange(config.taskrange);
    }
    getDeafultTexture(): Texture {
        if (!textures.idle?.getPath()){
            textures.idle = new Texture('tasks/vent/idle.png');
            for (let i = 0; i < 7; i++) {
                textures.animation.push(new Texture(`tasks/vent/anim${i+1}.png`));
            }
        }
        return textures.idle;
    }
    directions: Array<Vents>;
    use(): void {
        if (!Characters.main.getRole().usevents) return;
        logic_buttons.setCooldown(0.6);
        if (Characters.main.ventilation) Characters.main.outVent();
        else Characters.main.jumpVent(this);
    }
    playVenting(): void {
        sounds.open.play();
        for (let i = 0; i < textures.animation.length; i++) {
            setTimeout(() => {
                this._sprite.setTexture(textures.animation[i]);
            }, i*3*vent_logic.ventAnimationTime/textures.animation.length);
        }
        setTimeout(() => {
            this._sprite.setTexture(textures.idle);
        }, 3*vent_logic.ventAnimationTime);
    }
    protected generateSelectedTexture(texture: Texture): Texture {
        texture = new Texture(texture.getPath(), null, () => {
            texture.setImage(Retexturing.oneColor(texture.getImage(), {r:255, g:0, b:0}, 50));
        });
        return texture;
    }
}

class VentArrow {
    private _sprite: Sprite;
    private _toVent: Vents;
    constructor(from: Vents, to: Vents) {
        this._toVent = to;
        if (!textures.arrow?.getPath()) vent_logic.nload();
        const direction = vent_logic.getDirection(from, to);
        this._sprite = new Sprite(textures.arrow,
                    new Location(from.getLocation().x + 300*Math.cos(direction),
                    from.getLocation().y + 300*Math.sin(direction), direction))
                    .setSize(128, 128);
        this._sprite.upperThanDark = true;
        Game.getScene().LayerGUI.add(this._sprite);
    }
    destroy() {
        Game.getScene().LayerGUI.remove(this._sprite);
        delete this._sprite;
    }
    isIn(qx: number, qy: number){
        return this._sprite.getLocation().x <= qx && this._sprite.getLocation().y <= qy
            && qx <= this._sprite.getLocation().x + this._sprite.width
            && qy <= this._sprite.getLocation().y + this._sprite.height;
    }
    getTo(){
        return this._toVent;
    }
}

let vent_logic = {
    ventAnimationTime: 175, /* in ms */
    impostorVentAnimTime: 150, /* in ms */
    showedArrows: new Array<VentArrow>(),
    showArrows(vent: Vents, allvents = false) {
        vent_logic.hideArrows();
        if (allvents) {
            let usedvents = new Array<Vents>();
            for (let vv of logic_map.getMap().vents) {
                if (vv.directions) for (let v of vv.directions) {
                    if (!usedvents.includes(v) && v!==vent) {
                        usedvents.push();
                        vent_logic.showedArrows.push(new VentArrow(vent, v));
                    }
                }
            }
            usedvents = null;
        } else {
            if (vent.directions) for (let v of vent.directions) {
                vent_logic.showedArrows.push(new VentArrow(vent, v));
            }
        }
    },
    hideArrows() {
        while (vent_logic.showedArrows.length > 0) {
            vent_logic.showedArrows.shift().destroy();
        }
    },
    getDirection(vent1: Vents, vent2: Vents): number {
        const x = vent2.getLocation().x - vent1.getLocation().x;
        const y = vent2.getLocation().y - vent1.getLocation().y;
        if (x==0 && y==0) return null;
		if (y==0) { if (x>0) return 0; else return Math.PI; }
		if (x==0) { if (y>0) return Math.PI/2; else return Math.PI*1.5; }
		if (x > 0 && y > 0) return Math.atan(y/x);
		if (x < 0 && y > 0) return Math.PI + Math.atan(y/x);
		if (x < 0 && y < 0) return Math.PI + Math.atan(y/x);
		if (x > 0 && y < 0) return Math.PI*2 + Math.atan(y/x);
        return null;
    },
    getMinVentByCharacterVent(ch: Character, direction: "up" | "left" | "right" | "down") {
        return vent_logic.getMinVentByDirection(ch.ventilation, ch.ventilation.directions, direction);
    },
    getMinVentByDirection(from: Vents, list: Vents[], direction: "up" | "left" | "right" | "down"): Vents {
        const a = [0,Math.PI/2,Math.PI,Math.PI*1.5][["right", "down", "left", "up"].findIndex(a=>a===direction)];
        let _direct: number;
        let _thevent: Vents = null;
        for (let vent of list) {
            if (from===vent) continue;
            _direct = vent_logic.getDirection(from,vent);
            _direct = Math.abs(_direct - a);
            if (_direct >= Math.PI/3) continue;
            if (!_thevent) _thevent = vent;
            else if (Math.abs(_direct - a) < Math.abs(vent_logic.getDirection(from,_thevent)-a)) _thevent = vent;
        }
        return _thevent;
    },
    playMoveSound(){
        sounds.move.play();
    },
    nload() {
        textures.arrow = new Texture('tasks/vent/arrow.png');
        Game.eventListeners.addMouseClick((x, y) => {
            if (!Characters.main.ventilation?.directions) return;
            if (vent_logic.showedArrows.length <= 0) return;
            const res = Game.getCamera().getResolution();
            let qx = (Game.mouseinfo.posX - Screen.width/2)*Screen.width/res.x + Game.getCamera().getLocation().x;
            let qy = (Game.mouseinfo.posY - Screen.height/2)*Screen.height/res.y + Game.getCamera().getLocation().y;
            for (let va of vent_logic.showedArrows) {
                if (va.isIn(qx, qy)) {
                    Characters.main.jumpVent(va.getTo());
                    return;
                }
            }
        });
    }
}

export {Vents, vent_logic, VentArrow}