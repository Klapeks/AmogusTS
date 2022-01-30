import { Game } from "../engine/Game";
import { Joystick } from "../engine/Joystick";
import { Light } from "../engine/Light";
import { Location } from "../engine/Location";
import { Scene } from "../engine/Scene";
import { Screen } from "../engine/Screen";
import { Sprite } from "../engine/Sprite";
import { Texture } from "../engine/Texture";
import { logic } from "./logic/alllogic";
import { Characters } from "./logic/charslog";
import { skeld } from "./logic/maps/skeld";
import { loadTextures, textures } from "./textures";

let camera_lerp = 0.1;
let dsc = 0;

async function update() {
    dsc = 0;
    if (Game.hasKey('keym')) dsc+=10;
    if (Game.hasKey('keyn')) dsc-=10;
    if (dsc!=0) {
        Game.getCamera().getResolution().add(dsc*1280/720, dsc);
    }

    logic.update();
    Game.getCamera().getLocation().add(
        (Characters.main.getCenter().x-Game.getCamera().getLocation().x)*camera_lerp,
        (Characters.main.getCenter().y-Game.getCamera().getLocation().y)*camera_lerp);
}
let mapsize = 5;

let testgame = {
    async load(): Promise<void> {
        let loadingscreen = new Texture("loadingscreen.png");
        loadingscreen.onload = () => {
            Game.getScene().drawTextureFullScreen(loadingscreen);
            loadTextures();
        };
        Game.eventListeners.addLoad(() => {
            Game.getCamera().getResolution().set(Game.getCamera().getResolution().x*0.85, Game.getCamera().getResolution().y*0.85);
            let border = new Sprite(new Texture('border.png'), new Location(-Screen.width/2, -Screen.height/2)).setSize(Screen.width, Screen.height);
            
            skeld.load();

            Game.getScene().addUpperSprite(border);

            logic.load();

            // Game.getScene().addLight(new Light(new Location(-1257,-1599), 250));
            // Game.getScene().addLight(new Light(new Location(-1092,-123), 50));
            Light.enableLights();

            Game.eventListeners.onUpdate = update;
        })
    }
}

export { testgame };