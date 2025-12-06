import { Game } from "../../../../engine/Game";
import { LinkedLocation, Location } from "../../../../engine/Location";
import { Screen } from "../../../../engine/Screen";
import { StaticSprite } from "../../../../engine/Sprite";
import { Texture } from "../../../../engine/Texture";
import { Character } from "../../../characters/Character";
import { RoleFuncs } from "../../../roles/roles";
import { Characters } from "../../charslog";
import { GameLogic } from "../../gamelogic";
import { ejections } from "../ejection";
import { meeting } from "../meeting";
import { Nameplate } from "./nameplate";
import { tablet_settings } from "./tablet_settings";
import { TabletMenu } from "./tabletmenu";
import { GuessRole } from "./guessrole";

const tabset = tablet_settings;

let menu: TabletMenu;


let acceptButton: StaticSprite;
let additionalButton: StaticSprite;
let roleGuess: GuessRole;

class VotingMenu extends TabletMenu {
    constructor() {
        super();
        this.addClick({x:0,y:0,dx:Screen.width,dy:Screen.height}, onClick)
    }

    show(priority = 55) {
        if (this.isShowed || this._sprite) return;
        super.show(priority);
        if (Characters.main.getRole().meetingAction?.roleSelecting) {
            Game.getScene().LayerGUI.add(...roleGuess.getSprites());
        }
    }
    hide(extra: boolean = false) {
        if (!extra) if (!this.isShowed) return;
        super.hide(extra);
        acceptButton.hidden = additionalButton.hidden = true;
        Game.getScene().LayerGUI.remove(...roleGuess.getSprites());
        Game.getScene().LayerGUI.remove(acceptButton, additionalButton);
    }
    onMenuMoving(location: Location): void {
        super.onMenuMoving(location);
        if (!roleGuess) return;
        this.nameplates.forEach(np => np.updateLocation(location));
        roleGuess.getLocation().set(location.x + this._size.width/2, location.y + this._size.height*3/4);
    }
}

const VoteMenu = {
    open() { menu.show(); },
    close() { menu.hide(true); },
    getMenu() { return menu; },
    setAdditionalButtonTexture(texture: Texture) {
        additionalButton.setTexture(texture);
    },
    updateNameplate(character: Character) {
        menu.updateNameplate(character);
    },
    load() {
        acceptButton = new StaticSprite(new Texture('buttons/accept.png'))
            .setSize(tabset.plateSize.height-30, tabset.plateSize.height-25)
            .setPriority(55);
        acceptButton.hidden = true;

        additionalButton = new StaticSprite(new Texture('missingo.png'),
            new LinkedLocation(acceptButton.getLocation(),
                {dx: -(tabset.plateSize.height-30-15)-5, dy: 7.5}))
            .setSize(tabset.plateSize.height-30-15, tabset.plateSize.height-25-15)
            .setPriority(55);
        additionalButton.hidden = true;

        roleGuess = new GuessRole(new Location(-500, -500)).setPriority(55);
        
        menu = new VotingMenu();

        GameLogic.eventListeners.onreset.addEvent(() => {
            VoteMenu.close();
            meeting.end();
        })
    },
    update() {
        if (!menu || !menu.isShowed) return;
        trySelectButton(acceptButton);
        trySelectButton(additionalButton);
        let nameplate: Nameplate = null;
        for (let np of menu.nameplates) {
            if (np.checkMouseMove()) {
                nameplate = np;
                break;
            }
        }
        if (!nameplate) menu.setSelectedNameplateLocation(null);
        else menu.setSelectedNameplateLocation(nameplate.getLocation());
    },
    hideButtons() {
        onClick(-1,-1);
    }
}

let trySelectButton = (button: StaticSprite) => {
    if (!button || button.hidden) return;
    if (Location.isInHitbox(
        Game.mouseinfo.posX,Game.mouseinfo.posY, {
        location: button.getLocation(),
        size: button
    })) {
        button.setFilter('brightness', 0.7);
    } else {
        button.setFilter('brightness', null);
    }
}
let onClick = (x: number, y: number) => {
    let nameplate: Nameplate = null;
    for (let np of menu.nameplates) {
        if (np.checkMouseMove(x,y)) {
            nameplate = np;
            break;
        }
    }
    if (!nameplate) {
        acceptButton.hidden = additionalButton.hidden = true;
        Game.getScene().LayerGUI.remove(acceptButton, additionalButton);
        return;
    }
    const mainrole = Characters.main.getRole();
    if (!acceptButton.hidden){
        if (Location.isInHitbox(x,y, {
            location: acceptButton.getLocation(),
            size: acceptButton
        })) {
            if (!ejections.isEjecting){
                tabset.sounds.vote.play();
                ///Change it
                const nick = nameplate.getCharacter().getNickname() || `Абобус ${nameplate.getId()}`
                ejections.eject(
                        `${nick} был ${nameplate.getCharacter().getRole().name}`,
                        `Осталось еще ${RoleFuncs.getImpostors(true).length} компостира`,
                        nameplate.getCharacter());
                setTimeout(() => {
                    VoteMenu.close();
                }, 500);
            }
            return;
        } else if (!additionalButton.hidden && Location.isInHitbox(x,y, {
            location: additionalButton.getLocation(), size: additionalButton
        })) {
            if (!mainrole.meetingAction) return;
            if (mainrole.meetingAction.roleSelecting) {
                const selrole = roleGuess.getSelectedRole();
                if (!selrole) {
                    console.log("SELECT ROLE PLS")
                    return;
                }
                mainrole.meetingAction.act(nameplate.getCharacter(), selrole);
            } else {
                mainrole.meetingAction.act(nameplate.getCharacter());
            }
            return;
        }
        tabset.sounds.select.play();
        acceptButton.setLocation(nameplate.getLocation().x+375, nameplate.getLocation().y+10);
    } else {
        tabset.sounds.select.play();
        acceptButton.setLocation(nameplate.getLocation().x+375, nameplate.getLocation().y+10);
        acceptButton.hidden = false;
        additionalButton.hidden = true;
        Game.getScene().LayerGUI.add(acceptButton, additionalButton);
    }
    if (mainrole.meetingAction) {
        additionalButton.hidden = mainrole.meetingAction.select
            ? !mainrole.meetingAction.select(nameplate.getCharacter())
            : false;
    }
}

export {VoteMenu};