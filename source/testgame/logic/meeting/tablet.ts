import { Game } from "../../../engine/Game";
import { LinkedLocation, Location } from "../../../engine/Location";
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
import { GameLogic } from "../gamelogic";
import { ejections } from "./ejection";
import { meeting } from "./meeting";

let tabletTexture: Texture, glassTexture: Texture, nameplatesT: Texture, deadmarkTexture: Texture;
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
        }
    }
    
    checkMouseMove(posX: number = Game.mouseinfo.posX, posY: number = Game.mouseinfo.posY): boolean {
        if (!this.nameplate) return false;
        if (!this._character?.isAlive) return false;
        const loc = this.nameplate.getLocation();
        const secloc = {x: loc.x+this.nameplate.width, y:loc.y+this.nameplate.height};
        return loc.x <= posX && posX <= secloc.x && loc.y <= posY && posY <= secloc.y;
    }

    charplate: Map<string, StaticSprite>;
    get nameplate() { return this.charplate.get('nameplate'); }
    createSprite() {
        if (this.charplate) return this;
        this.charplate = new Map();
        const nloc = new Location(-500,-500);
        this.charplate.set('nameplate', 
            new StaticSprite(nameplatesT, nloc)
            .setSize(plateSize.width, plateSize.height)
            .setSplitting(2, 10, 272, 64)
            .setPriority(55));
        
        this.charplate.set('icon', 
            new StaticSprite(this._character.getTextures().idle,
            new LinkedLocation(nloc, {dx:-20, dy:-28}))
            .setSize(1.75*128*textures.character_ratio, 1.75*190/2*textures.character_ratio)
            .setSplitting(0,0,256,190)
            .setPriority(55));

        const nick = this._character.getNickname();
        if (nick) {
            const nickplate = Character.generateNicknameTexture(nick, 40, 'left');
            nickplate.setColor(this._character.getNicknameColor());
            this.charplate.set('nickname', new StaticSprite(nickplate,
                new LinkedLocation(nloc, {dx: 130, dy: 50}))
                .setSize(plateSize.width,0)
                .setPriority(55));
            
        }
        if (this._character.isRoleplateShows()) {
            const npt = Character.generateNicknameTexture(this._character.getRole().name, 30, 'left');
            npt.color = this._character.getRole().toCSS();
            this.charplate.set('role', new StaticSprite(npt,
                new LinkedLocation(nloc, {dx: 130, dy: 90}))
                .setSize(plateSize.width,0)
                .setPriority(55));
        }
        this.charplate.forEach((sprite) => Game.getScene().addUpperSprite(sprite));
        if (!this._character.isAlive) this.makeDead();
        return this;
    }
    makeDead() {
        const nloc = this.charplate.get('nameplate').getLocation();
        this.nameplate.opacity = 0.7;
        let _i = this.charplate.get('icon');
        if (_i) _i.opacity = 0.9;
        _i = this.charplate.get('nickname');
        if (_i) _i.opacity = 0.9;
        _i = this.charplate.get('role');
        if (_i) _i.opacity = 0.9;
        this.charplate.set('deadmark', 
            new StaticSprite(deadmarkTexture,
            new LinkedLocation(nloc, {dx: 20, dy: 20}))
            .setSize(plateSize.height-25, plateSize.height-25)
            .setPriority(55));
            
        Game.getScene().addUpperSprite(this.charplate.get('deadmark'));
        return this;
    }
    removeSpirte() {
        this.charplate.forEach((sprite) => Game.getScene().removeUpperSprite(sprite));
        this.charplate = null;
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

    show(priority = 55) {
        tablet.tryChangeTexture();
        if (this.isShowed || this._sprite) return;
        Nameplate.last_number = 0;
        super.show(priority);
        this._glass = new StaticSprite(glassTexture)
                .setSize(this._sprite.width, this._sprite.height)
                .setLocation(this._sprite.getLocation().x,
                            this._sprite.getLocation().y)
                .setPriority(55);
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
                        .setSplitting(2, 78, 272, 64)
                        .setPriority(55);
        this._selectedNameplate.hidden = true;
        Game.getScene().addUpperSprite(this._selectedNameplate);
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

let additionalButton: StaticSprite;
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
    setAdditionalButtonTexture(texture: Texture) {
        additionalButton.setTexture(texture);
    },
    updateNameplate(character: Character) {
        menu.updateNameplate(character);
    },
    load() {
        tabletTexture = new Texture('voting/tablet.png');
        glassTexture = new Texture('voting/tablet_up.png');
        nameplatesT = new Texture('buttons/nameplates.png');
        deadmarkTexture = new Texture('voting/deadmark.png');
        sounds = {
            vote: new Sound("voting/votescreen_vote.wav", "effects"),
            select: new Sound("voting/votescreen_select.wav", "gui"),
        }

        acceptButton = new StaticSprite(new Texture('buttons/accept.png'))
            .setSize(plateSize.height-30, plateSize.height-25)
            .setPriority(55);
        acceptButton.hidden = true;

        additionalButton = new StaticSprite(new Texture('missingo.png'),
            new LinkedLocation(acceptButton.getLocation(), {dx: -(plateSize.height-30-15)-5, dy: 7.5}))
            .setSize(plateSize.height-30-15, plateSize.height-25-15)
            .setPriority(55);
        additionalButton.hidden = true;

        menu = new TabletMenu().addClick({x:0,y:0,dx:Screen.width,dy:Screen.height}, (x,y) =>{
            let nameplate: Nameplate = null;
            for (let np of menu.nameplates) {
                if (np.checkMouseMove(x,y)) {
                    nameplate = np;
                    break;
                }
            }
            if (!nameplate) {
                acceptButton.hidden = additionalButton.hidden = true;
                Game.getScene().removeUpperSprite(acceptButton, additionalButton);
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
                                nameplate.getCharacter());
                        setTimeout(() => {
                            tablet.close();
                        }, 500);
                    }
                    return;
                } else if (!additionalButton.hidden && Location.isInHitbox(x,y, {
                    location: additionalButton.getLocation(), size: additionalButton
                })) {
                    if (!Characters.main.getRole().meetingAction) return;
                    Characters.main.getRole().meetingAction.act(nameplate.getCharacter());
                    return;
                }
                sounds.select.play();
                acceptButton.setLocation(nameplate.getLocation().x+375, nameplate.getLocation().y+10);
            } else {
                sounds.select.play();
                acceptButton.setLocation(nameplate.getLocation().x+375, nameplate.getLocation().y+10);
                acceptButton.hidden = false;
                additionalButton.hidden = true;
                Game.getScene().addUpperSprite(acceptButton, additionalButton);
            }
            if (Characters.main.getRole().meetingAction) {
                additionalButton.hidden = Characters.main.getRole().meetingAction.select 
                    ? !Characters.main.getRole().meetingAction.select(nameplate.getCharacter())
                    : false;
            }
        });
        GameLogic.eventListeners.onreset.addEvent(() => {
            tablet.close();
            meeting.end();
        })
    },
    update() {
        if (menu.isShowed) {
            trySelectButton(acceptButton);
            trySelectButton(additionalButton);
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
    },
    close() {
        acceptButton.hidden = additionalButton.hidden = true;
        Game.getScene().removeUpperSprite(acceptButton, additionalButton);
        menu.hide(true);
    }

};
let trySelectButton = (button: StaticSprite) => {
    if (!button || button.hidden) return;
    if (Location.isInHitbox(
        Game.mouseinfo.posX,Game.mouseinfo.posY, {
        location: button.getLocation(),
        size: button
    })) {
        button.setFilter('brightness', 0.7);
        // (button.getTexture() as MultiTexture).setID(1);
    } else {
        button.setFilter('brightness', null);
        // (button.getTexture() as MultiTexture).setID(0);
    }
}

export {tablet}