import { Game } from "../../../engine/Game";
import { Location } from "../../../engine/Location";
import { ApearableMenu } from "../../../engine/Menu";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { StaticSprite } from "../../../engine/Sprite";
import { MultiTexture, Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { CharacterFuncs } from "../../characters/CharFuncs";
import { RoleFuncs } from "../../roles/roles";
import { textures } from "../../textures";
import { Characters } from "../charslog";
import { ejections } from "./ejection";

let tabletTexture: Texture, glassTexture: Texture, nameplatesT: Texture;
let tabletSize = {width: Screen.width*0.95, height: Screen.height*0.95};
let plateSize = {width: 272*tabletSize.width/1020, height: 64*tabletSize.height/570};

let sounds: { select: Sound, vote: Sound }

class Nameplate {
    private _character: Character;
    private _id: number;
    constructor(character: Character) {
        this._id = Nameplate.last_number++;
        this._character = character;
    }
    updateLocation(tabletLocation: Location) {
        if (this.nameplate) {
            this.nameplate.getLocation().x = (this._id%3)*(plateSize.width+25) + 210;
            this.nameplate.getLocation().y = Math.floor(this._id/3)*(plateSize.height+25) + tabletLocation.y + 180;
            this.icon.getLocation().x = this.nameplate.getLocation().x-20;
            this.icon.getLocation().y = this.nameplate.getLocation().y-28;
            if (this.nickname) {
                this.nickname.getLocation().x = this.nameplate.getLocation().x+130;
                this.nickname.getLocation().y = this.nameplate.getLocation().y+50;
            }
        }
    }
    
    checkMouseMove(posX: number = Game.mouseinfo.posX, posY: number = Game.mouseinfo.posY): boolean {
        if (!this.nameplate) return false;
        const loc = this.nameplate.getLocation();
        const secloc = {x: loc.x+this.nameplate.width, y:loc.y+this.nameplate.height};
        return loc.x <= posX && posX <= secloc.x && loc.y <= posY && posY <= secloc.y;
    }

    nameplate: StaticSprite;
    icon: StaticSprite;
    nickname: StaticSprite;
    createSprite() {
        if (this.nameplate) return this;
        this.nameplate = new StaticSprite(nameplatesT, new Location(-500,-500))
                    .setSize(plateSize.width, plateSize.height)
                    .setSplitting(2, 10, 272, 64);
        this.icon = new StaticSprite(this._character.getTextures().idle, new Location(-500,-500))
                    .setSize(1.75*128*textures.character_ratio, 1.75*190/2*textures.character_ratio)
                    .setSplitting(0,0,256,190);
        const nick = this._character.getNickname();
        if (nick) {
            this.nickname = new StaticSprite(Character.generateNicknameTexture(nick, 40, 'left'))
                            .setLocation(-500,-500).setSize(plateSize.width,40);
        }
        Game.getScene().addUpperSprite(this.nameplate, this.icon, this.nickname);
        return this;
    }
    removeSpirte() {
        Game.getScene().removeUpperSprite(this.nameplate, this.icon, this.nickname);
        this.nameplate = null;
        this.icon = null;
        this.nickname = null;
    }
    getCharacter(){
        return this._character;
    }
    getId() {
        return this._character.getId();
    }
    getLocation(){
        return this.nameplate.getLocation();
    }

    static last_number = 0;
}


class TabletMenu extends ApearableMenu {
    constructor(){
        super(tabletTexture, tabletSize);
        this.setApearTime(100)
    }
    private _glass: StaticSprite;
    nameplates: Array<Nameplate> = new Array();
    private _selectedNameplate: StaticSprite;

    show() {
        tablet.tryChangeTexture();
        if (this.isShowed || this._sprite) return;
        Nameplate.last_number = 0;
        super.show();
        this._glass = new StaticSprite(glassTexture)
                .setSize(this._sprite.width, this._sprite.height)
                .setLocation(this._sprite.getLocation().x,
                            this._sprite.getLocation().y);
        Game.getScene().addUpperSprite(this._glass);
        this.nameplates.push(new Nameplate(Characters.main).createSprite());
        Characters.another.filter(ch => {
            if (!ch.isAlive) return true;
            this.nameplates.push(new Nameplate(ch).createSprite());
            return false;
        }).forEach(ch => {
            this.nameplates.push(new Nameplate(ch).createSprite());
        });
        this._selectedNameplate = new StaticSprite(nameplatesT, this.nameplates[0].getLocation().clone())
                        .setSize(plateSize.width, plateSize.height)
                        .setSplitting(2, 78, 272, 64);
        this._selectedNameplate.hidden = true;
        Game.getScene().addUpperSprite(this._selectedNameplate);
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
        Game.getScene().removeUpperSprite(this._glass, this._selectedNameplate);
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
let acceptButton: StaticSprite;
let menu: TabletMenu;
let changedTexture = false;
let tablet = {
    tryChangeTexture() {
        if (!changedTexture) {
            tabletTexture = new Texture('voting/tablet.png', null, () => {
                tabletTexture = CharacterFuncs.cloneFiltering(tabletTexture, Characters.main.getColor());
                menu.setTexture(tabletTexture);
            });
            changedTexture = true;
        }
    },
    removeChangedTexture() {
        changedTexture = false;
    },
    open() { menu.show(); },
    load() {
        tabletTexture = new Texture('voting/tablet.png');
        glassTexture = new Texture('voting/tablet_up.png');
        nameplatesT = new Texture('buttons/nameplates.png');
        sounds = {
            vote: new Sound("voting/votescreen_vote.wav", "effects"),
            select: new Sound("voting/votescreen_select.wav", "gui"),
        }

        acceptButton = new StaticSprite(
            new MultiTexture('buttons/accept.png', 'buttons/accept_showed.png'),
            new Location(0,0))
            .setSize(plateSize.height-30, plateSize.height-25);
        acceptButton.hidden = true;

        menu = new TabletMenu().addClick({x:0,y:0,dx:Screen.width,dy:Screen.height}, (x,y) =>{
            let nameplate: Nameplate = null;
            for (let np of menu.nameplates) {
                if (np.checkMouseMove(x,y)) {
                    nameplate = np;
                    break;
                }
            }
            if (!nameplate) {
                acceptButton.hidden = true;
                Game.getScene().removeUpperSprite(acceptButton);
                return;
            }
            if (!acceptButton.hidden){
                if (Location.isInHitbox(x,y, {
                    location: acceptButton.getLocation(),
                    size: acceptButton
                })) {
                    if (!ejections.isEjecting){
                        sounds.vote.play();
                        ///Change it
                        const nick = nameplate.getCharacter().getNickname() || `Абобус ${nameplate.getId()}`
                        ejections.eject(
                                `${nick} был ${nameplate.getCharacter().getRole().name}`,
                                `Осталось еще ${RoleFuncs.getImpostors(true).length} компостира`,
                                nameplate.getCharacter().getTextures().eject);
                        setTimeout(() => {
                            acceptButton.hidden = true;
                            Game.getScene().removeUpperSprite(acceptButton);
                            menu.hide(true);
                        }, 500);
                    }
                    return;
                }
                sounds.select.play();
                acceptButton.setLocation(nameplate.getLocation().x+375, nameplate.getLocation().y+10);
            } else {
                sounds.select.play();
                acceptButton.setLocation(nameplate.getLocation().x+375, nameplate.getLocation().y+10);
                acceptButton.hidden = false;
                Game.getScene().addUpperSprite(acceptButton);
            }
        });
    },
    update() {
        if (menu.isShowed) {
            if (acceptButton) {
                if (Location.isInHitbox(
                    Game.mouseinfo.posX,Game.mouseinfo.posY, {
                    location: acceptButton.getLocation(),
                    size: acceptButton
                })) {
                    (acceptButton.getTexture() as MultiTexture).setID(1);
                } else {
                    (acceptButton.getTexture() as MultiTexture).setID(0);
                }
            }
            let nameplate: Nameplate = null;
            for (let np of menu.nameplates) {
                if (np.checkMouseMove()) {
                    nameplate = np;
                    break;
                }
            }
            if (!nameplate) menu?.setSelectedNameplateLocation(null);
            else menu?.setSelectedNameplateLocation(nameplate.getLocation());
        }
    }

};

export {tablet}