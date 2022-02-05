import { Game } from "../../../engine/Game";
import { Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { StaticSprite } from "../../../engine/Sprite"
import { Texture } from "../../../engine/Texture";
import { Characters } from "../charslog";
import { tablet } from "./tablet";

let redSprite: StaticSprite, callSprite: StaticSprite;
let calltime = 260; // in milis

let caller = {
    load() {
        redSprite = new StaticSprite(new Texture('voting/red.png'), new Location(0,0))
            .setSize(Screen.width,Screen.height)
            .setPriority(55);
        callSprite = new StaticSprite(new Texture('voting/call.png'), new Location(0, 0))
            .setSize(Screen.width, 0)
            .setPriority(55);
        redSprite.hidden = true;
        callSprite.hidden = true;
    },
    call(oncall: () => void, endcall: number = 2000, onend?: () => void): number {
        Game.getScene().addUpperSprite(callSprite, redSprite);
        tablet.tryChangeTexture();
        Characters.main.outVent(false);
        redSprite.hidden = false;
        callSprite.hidden = false;
        setTimeout(() => {
            callSprite.getLocation().x = -Screen.width/2;
            callSprite.getLocation().y = Screen.height/3;
            callSprite.getLocation().yaw = -9/16;
            callSprite.setSize(2*Screen.width, Screen.height/4);
            redSprite.hidden = true;
        }, calltime/3);
        setTimeout(() => {
            callSprite.getLocation().x = -Screen.width/2;
            callSprite.getLocation().y = Screen.height/3;
            callSprite.getLocation().yaw = 9/16;
            callSprite.setSize(2*Screen.width, Screen.height/2);
        }, 2*calltime/3);
        setTimeout(() => {
            callSprite.getLocation().x = 0;
            callSprite.getLocation().y = 0;
            callSprite.getLocation().yaw = 0;
            callSprite.setSize(Screen.width, Screen.height);
            oncall();
        }, calltime);
        setTimeout(() => {
            callSprite.hidden = true;
            Game.getScene().removeUpperSprite(callSprite, redSprite);
            if (onend) onend();
        }, endcall+calltime);
        return endcall+calltime;
    }
}

export {caller};