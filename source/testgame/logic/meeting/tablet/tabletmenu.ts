import { Game } from "../../../../engine/Game";
import { Location } from "../../../../engine/Location";
import { ApearableMenu } from "../../../../engine/Menu";
import { StaticSprite } from "../../../../engine/Sprite";
import { Texture } from "../../../../engine/Texture";
import { Character } from "../../../characters/Character";
import { Characters } from "../../charslog";
import { Nameplate } from "./nameplate";
import { tablet } from "./tablet";
import { tablet_settings } from "./tablet_settings";

const tabset = tablet_settings;

class TabletMenu extends ApearableMenu {
    constructor(){
        super(tabset.tabletTexture, tabset.tabletSize);
        this.setApearTime(100)
    }
    private _glass: StaticSprite;
    nameplates: Array<Nameplate> = new Array();
    private _selectedNameplate: StaticSprite;

    show(priority = 55) {
        tablet.tryChangeTexture();
        if (this.isShowed || this._sprite) return;
        Nameplate.last_number = 0;
        super.show(priority);
        this._glass = new StaticSprite(tabset.glassTexture)
                .setSize(this._sprite.width, this._sprite.height)
                .setLocation(this._sprite.getLocation().x,
                            this._sprite.getLocation().y)
                .setPriority(55);
        Game.getScene().LayerGUI.add(this._glass);
        this.nameplates.push(new Nameplate(Characters.main).createSprite());
        Characters.another.filter(ch => {
            if (!ch.isAlive) return true;
            this.nameplates.push(new Nameplate(ch).createSprite());
            return false;
        }).forEach(ch => {
            this.nameplates.push(new Nameplate(ch).createSprite());
        });
        this._selectedNameplate = new StaticSprite(tabset.nameplatesT,
                        this.nameplates[0].getLocation().clone())
                        .setSize(tabset.plateSize.width, tabset.plateSize.height)
                        .setSplitting(2, 78, 272, 64)
                        .setPriority(55);
        this._selectedNameplate.hidden = true;
        Game.getScene().LayerGUI.add(this._selectedNameplate);
    }
    updateNameplate(character: Character) {
        this.nameplates.forEach(np => {
            if (np.getCharacter()!==character) return;
            if (!character.isAlive) np.makeDead();
        })
    }

    setSelectedNameplateLocation(location: Location) {
        if (location){
            this._selectedNameplate.getLocation().x = location.x;
            this._selectedNameplate.getLocation().y = location.y;
            this._selectedNameplate.hidden = false;
        } else {
            this._selectedNameplate.hidden = true;
        }
        return this;
    }

    onClose(): void {
        this.nameplates.forEach(np=>np.removeSpirte());
        this.nameplates = this.nameplates.filter(a=>false);
        Game.getScene().LayerGUI.remove(this._glass, this._selectedNameplate);
        this._glass = null;
        this._selectedNameplate = null;
    }

    onMenuMoving(location: Location): void {
        if (this._glass) {
            this._glass.getLocation().y = location.y;
        }
        this.nameplates.forEach(np => np.updateLocation(location))
    }
}



export {TabletMenu}