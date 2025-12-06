import { Button, ButtonFuncs } from "./Button";
import { Game } from "./Game";
import { Location } from "./Location";
import { Screen } from "./Screen";
import { Sprite, StaticSprite } from "./Sprite"
import { Texture } from "./Texture";

let joy: StaticSprite, circle: StaticSprite;

let joypos: {x:number,y:number};

type Touch = {x: number, y: number, id: number};
let touches: Array<Touch> = new Array();

let Touching = {
    add(touch: Touch) {
        touches.push(touch);
        ButtonFuncs.doclick(touch.x, touch.y);
        if (!Number.isNaN(Joystick.touchId)) return;
        if (Joystick.onclick(touch.x, touch.y, "touch")) Joystick.touchId = touch.id;
    },
    remove(id: number) {
        touches = touches.filter(t => t.id != id);
        if (Joystick.touchId==id) Joystick.touchId = NaN;
    },
    move(touch: Touch) {
        touches.forEach(t => {
            if (t.id==touch.id) {
                t.x = touch.x;
                t.y = touch.y;
            }
        });
    },
    get(id: number): Touch {
        if (Number.isNaN(id)) return null;
        if (touches.length) for (let t of touches) if (t.id == id) return t;
        else return null;
    }
};

let Joystick = {
    isDisabled: false,
    isJoystickOpen(): boolean {
        if (joypos) return true;
        return false;
    },
    touchId: NaN,
    isCreated: false,
    setSize(width: number, height?: number){
        if (!joy) return;
        if (!height) height = width;
        joy.width = width; joy.height = height;
        circle.width = width; circle.height = height;
    },
    create(joytexture: Texture, circletexture: Texture) {
        joy = new StaticSprite(joytexture);
        circle = new StaticSprite(circletexture);
        joy.hidden = true;
        circle.hidden = true;
        Joystick.setSize(256);
        Game.getScene().LayerGUI.add(joy, circle);
        Joystick.isCreated = true;
    },
    onclick(x:number,y:number, type: "mouse" | "touch" = "mouse"): boolean {
        if (Joystick.isDisabled) return false;
        if (!Joystick.isCreated) return false;
        if (x >= Screen.width/2) return false;
        if (joypos && type!="touch") return false;
        joypos = {x,y};
        joy.setLocationByCenter(joypos.x, joypos.y);
        circle.setLocationByCenter(joypos.x, joypos.y);
        joy.hidden = false;
        circle.hidden = false;
        return true;
    },
    onJoystick(x: number, y: number) {},
    update() {
        if (!Joystick.isCreated) return;
        if (!joypos) return;
        if (Number.isNaN(Joystick.touchId)) {
            if (!Game.mouseinfo.isClicked) {
                joypos = null;
                joy.hidden = true;
                circle.hidden = true;
                return;
            }
        }
        try {
            _nowtouch = Touching.get(Joystick.touchId);
            _x = _nowtouch?.x || Game.mouseinfo.posX;
            _y = _nowtouch?.y || Game.mouseinfo.posY;
            _dx = _x - joypos.x;
            _dy = _y - joypos.y;
            _r = Math.sqrt(_dx*_dx+_dy*_dy);
            if (_r > joy.width/2){
                if (_dy==0) _dx = (_dx<0?-1:1)*joy.width/2;
                else if (_dx==0) _dy = (_dy<0?-1:1)*joy.height/2;
                else [_dx, _dy] = [_dx*joy.width/(2*_r), _dy*joy.height/(2*_r)];
            }
    
            Joystick.onJoystick(_dx*200/joy.width, _dy*200/joy.height);
            circle.setLocationByCenter(joypos.x+_dx,joypos.y+_dy);
        } catch (e){
            alert(e);
        }
    }
}
let _x: number, _y: number, _dx: number, _dy: number, _r: number, _nowtouch: Touch;
export {Joystick, Touching}