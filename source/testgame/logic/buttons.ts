import { Button, ButtonFuncs } from "../../engine/Button";
import { Game } from "../../engine/Game";
import { LinkedLocation, Location } from "../../engine/Location";
import { MenusUtils } from "../../engine/Menu";
import { Sprite, StaticSprite } from "../../engine/Sprite";
import { TextTexture, Texture } from "../../engine/Texture";
import { Retexturing } from "../../engine/utils/Retexturing";
import { config } from "../config";
import { RoleFuncs } from "../roles/roles";
import { Characters, logic_character } from "./charslog";
import { GameLogic } from "./gamelogic";
import { TaskMenu } from "./items/TaskMenu";
import { logic_kill } from "./kill";
import { logic_map } from "./maps/maplogic";
import { meeting } from "./meeting/meeting";
import { voting } from "./meeting/voting";


class UseButton extends Button {
    private _textures: Array<Texture> = new Array();
    private _unselectedtextures: Array<Texture> = new Array();
    private _onclicking: Array<()=>void> = new Array();
    private _nowtex: number = 0;
    constructor(defaultTexture: Texture, location: Location = new Location(0,0)) {
        super(defaultTexture, location);
        this.addState(defaultTexture, null);
        this.setState(0);
    }
    addState(texture: Texture | string, onclick: () => void) {
        if (typeof texture === "string") texture = new Texture(texture);
        this._textures.push(texture);
        const seltex = new Texture(texture.getPath(), texture.getImage(), () => {
            seltex.setImage(Retexturing.gray(seltex.getImage()));
        });
        this._unselectedtextures.push(seltex);
        this._onclicking.push(onclick);
        return this._textures.length-1;
    }
    setState(state: number){
        if (state===-1) state = this.defaultState;
        if (state < 0 || state >= this._textures.length) return this;
        this._nowtex = state;
        if (this._isselected) this._sprite.setTexture(this._textures[this._nowtex]);
        else this._sprite.setTexture(this._unselectedtextures[this._nowtex]);
        return this;
    }
    clickRule: () => boolean;
    setClickRule(rule: () => boolean) {
        this.clickRule = rule;
        return this;
    }
    click() {
        if (this.cooldown_time) return;
        if (this.clickRule && !this.clickRule()) return;
        let f = this._onclicking[this._nowtex];
        if (!f) f = this._onclick;
        f();
    }
    select(){
        this._sprite.opacity = 1;
        if (this._isselected) return;
        this._isselected = true;
        this._sprite.setTexture(this._textures[this._nowtex]);
    }
    unselect(){
        this._sprite.opacity = 0.5;
        if (!this._isselected) return;
        this._sprite.setTexture(this._unselectedtextures[this._nowtex]);
        this._isselected = false;
    }

    cooldown_text: StaticSprite;
    cooldown_time: number = 0;
    private _showcd = true;
    showCooldown(b: boolean) {
        this._showcd = false;
        return this;
    }
    cooldown(time: number) {
        if (!time) {
            this.cooldown_time = 0;
            Game.getScene().removeUpperSprite(this.cooldown_text);
            this.cooldown_text = null;
            return;
        }
        this.cooldown_time = time;
        if (!this.cooldown_text && this._showcd) this.cooldown_text 
            = new StaticSprite(new TextTexture("", "arial")
            .setFontSize(100).setColor("white")
            .setAlign("center").setOutline('black', 10),
            new LinkedLocation(this._sprite.getLocation(), {dx:-100, dy:-125}))
            .setMargin(this._sprite.margin)
            .setSize(200, 200);
        this.updateCD();

        Game.getScene().addUpperSprite(this.cooldown_text);
    }
    updateCD() {
        if (!this.cooldown_time) return;
        this.cooldown_time -= Game.deltaTime;
        if (this.cooldown_time <= 0) {
            this.cooldown(0);
        } else if (this.cooldown_text) {
            (this.cooldown_text.getTexture() as TextTexture)
                .setText(`${Math.ceil(this.cooldown_time)}`);
        }
    }
    defaultState = 0;
    setDefaultState(stage: number){
        this.defaultState = stage;
        return this;
    }
}

let actionButton: UseButton; // characters
let interactButton: UseButton; // items
let reportButton: Button;
let fullscreenbutton: Button;

// let killcooldownText: Sprite;
// let killcooldown = 0, usecooldown = 0,
let anytimeout = false;

let logic_buttons = {
    get ActionButton() { return actionButton; },
    get InteractButton() { return interactButton; },
    setCooldown(seconds: number, button: "use" | "action" = "use") {
        if (button === "action") actionButton.cooldown(seconds);
        else interactButton.cooldown(seconds);
    },
    isCooldown(button: "use" | "action" = "use") {
        if (button==="action") 
            return actionButton.cooldown_time > 0;
        return interactButton.cooldown_time > 0
    },
    update() {
        if (voting.isVoting) return;
        if (Characters.main.getRole().canSelectSomeone()) {
            if (actionButton.cooldown_time == 0 && logic_character.isSelectedCharacter()) actionButton.select();
            else actionButton.unselect();
        } else {
            if (actionButton.cooldown_time == 0) actionButton.select();
            else actionButton.unselect();
        }
        if (logic_kill.getDeadNear(Characters.main.getLocation())) reportButton.select()
        else reportButton.unselect();
        
        actionButton.updateCD();
        interactButton.updateCD();
        if (interactButton.cooldown_time===0 && !MenusUtils.isNoMenu() 
            && (Game.hasKey("escape") || Game.hasKey("keye"))) {
            for (let m of MenusUtils.showedMenus) {
                if (m instanceof TaskMenu){
                    logic_buttons.setCooldown(0.5, "use");
                    m.hide();
                    return;
                }
            }
        }
    },
    load() {
        actionButton = new UseButton(new Texture('buttons/kill.png'), new Location(200,200))
                .setMargin({x: -300, y: -50})
                .setSize(200,200)
                .setAltKey('KeyQ')
                .setClickRule(() => {
                    return !voting.isVoting
                        && GameLogic.isGameStarted
                        && !Characters.main.isVentedAnim;
                })
                .setClick(() => {
                    const role = Characters.main.getRole();
                    if (!role.action?.act) return;
                    if (!role.canSelectSomeone()) {
                        role.action.act(null);
                        actionButton.cooldown(role.action.cooldown);
                        return;
                    }
                    let ch = logic_character.trySelectCharacter();
                    if (ch) {
                        role.action.act(ch);
                        actionButton.cooldown(role.action.cooldown);
                    }
                });
        actionButton.unselect();
        RoleFuncs.load();

        interactButton = new UseButton(new Texture('buttons/use.png'), new Location(200,200))
                .setMargin({x: -50, y: -50})
                .setSize(200,200)
                .setAltKey('KeyE')
                .setClickRule(() => {
                    return !voting.isVoting
                        && GameLogic.isGameStarted;
                })
                .setClick(() => {
                    const nt = logic_map.getNearInteractable();
                    if (nt) {
                        interactButton.cooldown(0.3);
                        nt.use();
                    }
                })
                .showCooldown(false);
        interactButton.unselect();
        
        interactButton.addState('buttons/sabotage.png', () => {
            console.log('sabotage go brrrrrrrrrrr');
        })

        reportButton = new Button(new Texture('buttons/noreport.png'), new Location(200,200))
                .setMargin({x: -50, y: -300})
                .setSize(200,200)
                .setAltKey('KeyR')
                .setClick(() => {
                    if (!GameLogic.isGameStarted) return;
                    if (voting.isVoting) return;
                    const dc = logic_kill.getDeadNear(Characters.main.getLocation());
                    if (!dc) return;
                    meeting.call(dc.getCharacter(), "dead");
                    dc.getCharacter().hidden = false;
                    logic_kill.removeDead(dc);
                    Game.getScene().removeDynamicSprite(dc.getSprite());
                })
                .setSelected(new Texture('buttons/report.png'));
        
        fullscreenbutton = new Button(new Texture('buttons/fullscreen.png'), new Location(0,0))
                .setMargin({x: -125, y: 25})
                .setSize(100,100)
                .setClick(() => {
                    if (anytimeout) return;
                    anytimeout = true;
                    setTimeout(() => { anytimeout = false; }, 500);
                    Game.eventListeners.tryFullScreen();
                    if (Game.gameinfo.isFullScreen) fullscreenbutton.select();
                    else fullscreenbutton.unselect();
                })
                .setSelected(new Texture('buttons/nofullscreen.png'));
        fullscreenbutton.getSprite().priority = 999;

        ButtonFuncs.addButton(actionButton, reportButton, interactButton, fullscreenbutton);
    }
}

export {logic_buttons};