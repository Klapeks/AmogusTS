import { Game } from "../../../engine/Game";
import { Location, Size } from "../../../engine/Location";
import { ApearableMenu, Menu, MenusUtils } from "../../../engine/Menu";
import { Screen } from "../../../engine/Screen";
import { Sprite, StaticSprite } from "../../../engine/Sprite";
import { Texture } from "../../../engine/Texture";
import { logic_buttons } from "../buttons";
import { Characters } from "../charslog";
import { GameLogic } from "../gamelogic";
import { voting } from "../meeting/voting";

let isLoaded = false;
let closetexture: Texture;

class TaskMenu extends ApearableMenu {
    private _closeButton: StaticSprite;
    constructor(texture: Texture, size: Size){
        super(texture, size);
        if (!isLoaded){
            GameLogic.eventListeners.onmove.addEvent(ch => {
                if (ch===Characters.main) return MenusUtils.isNoMenu();
                return true;
            })
            isLoaded = true;
        }
        if (!closetexture) closetexture = new Texture('tasks/close.png');
        this._closeButton = new StaticSprite(closetexture)
                    .setSize(65*1.75, 65*1.75);
    }
    private _isEventAdded = false;
    show() {
        if (this.isShowed || this._sprite) return;
        Characters.main.idle();
        // logic_buttons.setCooldown(0.5, "use");
        super.show();
        this._closeButton.setLocation(
            this._sprite.getLocation().x - this._closeButton.width,
            this._sprite.getLocation().y);
        
        Game.getScene().LayerGUI.add(this._closeButton);
        
        if (!this._isEventAdded) {
            this._isEventAdded = true;
            this.addClick({
                location: this._closeButton.getLocation(),
                size: {
                    width: this._closeButton.width,
                    height: this._closeButton.height
                }},
                (x,y) => {
                    console.log("hide");
                    this.hide()
                });
        }
    }
    
    onMenuMoving(location: Location): void {
        if (this._closeButton?.getLocation()) {
            this._closeButton.getLocation().y = location.y;
        }
    }
    hide(extra: boolean = voting.isVoting) {
        super.hide(extra);
    }
    onClose(): void {
        Game.getScene().LayerGUI.remove(this._closeButton);
    }
}

export {TaskMenu};