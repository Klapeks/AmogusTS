import { Game } from "../../engine/Game";
import { Location } from "../../engine/Location";
import { Screen } from "../../engine/Screen";
import { FullscreenSprite, StaticSprite } from "../../engine/Sprite";
import { MultiTexture, Texture } from "../../engine/Texture"
import { GameLogic } from "../logic/gamelogic";
import { darking } from "./darking";

let background: StaticSprite;
let startButton: StaticSprite;

let MainMenu = {
    load() {
        background = FullscreenSprite('gui/mainmenu/background.jpg');
        startButton = new StaticSprite(new MultiTexture('gui/mainmenu/button.png','gui/mainmenu/button2.png'))
                    .setSize(256*1.5, 128*1.5)
                    .setLocationByCenter(Screen.half_width, Screen.height*3/4)
                    .setPriority(100);
        Game.eventListeners.addMouseClick((x,y) => {
            if (!MainMenu.isShowed) return;
            if (Location.isInHitbox(x,y, startButton.getHitboxPos())){
                MainMenu.isShowed = false;
                setTimeout(() => {
                    GameLogic.startGame();
                    MainMenu.hide();
                    darking.hide(0);
                }, darking.show());
            }
        })
    },
    update() {
        if (!MainMenu.isShowed) return;
        if (Location.isInHitbox(Game.mouseinfo.posX,Game.mouseinfo.posY, startButton.getHitboxPos())){
            (startButton.getTexture() as MultiTexture).setID(1);
        } else {
            (startButton.getTexture() as MultiTexture).setID(0);
        }
    },
    isShowed: false,
    show() {
        MainMenu.isShowed = true;
        Game.getScene().addUpperSprite(background, startButton);
    },
    hide() {
        MainMenu.isShowed = false;
        Game.getScene().removeUpperSprite(background, startButton);
    }
}

export { MainMenu }