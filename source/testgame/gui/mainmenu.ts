import { ClickingButton } from "../../engine/Button";
import { Game } from "../../engine/Game";
import { Screen } from "../../engine/Screen";
import { FullscreenSprite, StaticSprite } from "../../engine/Sprite";
import { MultiTexture, Texture } from "../../engine/Texture"
import { GameLogic } from "../logic/gamelogic";
import { darking } from "./darking";
import { gui_sounds } from "./gui_sounds";

let background: StaticSprite;
let startButton: ClickingButton;

let MainMenu = {
    load() {
        background = FullscreenSprite('gui/mainmenu/background.jpg');
        
        startButton = new ClickingButton(new Texture('gui/mainmenu/button.png'))
                .setHoverTexture(new Texture('gui/mainmenu/button2.png'));
        startButton.getSprite().setSize(256*1.5,128*1.5)
                .setLocationByCenter(Screen.half_width, Screen.height*3/4)
                .setPriority(100);
        startButton.setOnClick(() => {
            gui_sounds.select.play();
            MainMenu.isShowed = false;
            setTimeout(() => {
                GameLogic.startGame();
                MainMenu.hide();
                darking.hide(0);
            }, darking.show());
        }).setOnHover(() => {
            gui_sounds.hover.play();
        });
        Game.eventListeners.addMouseClick((x,y) => {
            if (!MainMenu.isShowed) return;
            startButton.doClick({posX: x, posY: y});
        })
    },
    update() {
        if (!MainMenu.isShowed) return;
        startButton.update();
    },
    isShowed: false,
    show() {
        MainMenu.isShowed = true;
        Game.getScene().LayerGUI.add(background, startButton.getSprite());
    },
    hide() {
        MainMenu.isShowed = false;
        Game.getScene().LayerGUI.remove(background, startButton.getSprite());
    }
}

export { MainMenu }