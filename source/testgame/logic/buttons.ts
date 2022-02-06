import { Button, ButtonFuncs } from "../../engine/Button";
import { Game } from "../../engine/Game";
import { LinkedLocation, Location } from "../../engine/Location";
import { MenusUtils } from "../../engine/Menu";
import { Sprite, StaticSprite } from "../../engine/Sprite";
import { TextTexture, Texture } from "../../engine/Texture";
import { Retexturing } from "../../engine/utils/Retexturing";
import { DeadCharacter } from "../characters/DeadCharacter";
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
        this.resetModifiedCooldown();
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
        if (this.hidden) return;
        if (!this._isselected) return;
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
            this.modifiedCooldown.afterEnd();
            return;
        }
        this.cooldown_time = time;
        if (!this.cooldown_text && this._showcd) this.cooldown_text 
            = new StaticSprite(new TextTexture("", "arial")
            .setFontSize(100).setColor(this.modifiedCooldown.color)
            .setAlign("center").setOutline('black', 10),
            new LinkedLocation(this._sprite.getLocation(),
                {dx:this._sprite.margin.x < 0 ? -100 : 100,
                dy:this._sprite.margin.y < 0 ? -125 : 125}))
            .setMargin(this._sprite.margin)
            .setSize(200, 200)
            .setPriority(50);
        this.updateCD();

        Game.getScene().addUpperSprite(this.cooldown_text);
    }
    modifiedCooldown: {color: string, afterEnd: () => void};
    resetModifiedCooldown() {
        this.setModifiedCooldown("white", () => {})
    }
    setModifiedCooldown(color: string, afterEnd: () => void) {
        this.modifiedCooldown = {color, afterEnd};
    }
    updateCD() {
        if (!this.cooldown_time) return;
        this.cooldown_time -= Game.deltaTime;
        if (this.cooldown_time <= 0) {
            this.cooldown(0);
        } else if (this.cooldown_text) {
            (this.cooldown_text.getTexture() as TextTexture)
                .setText(`${Math.ceil(this.cooldown_time)}`);
            this.cooldown_text.hidden = this._sprite.hidden;
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
let additionalButton: Array<UseButton> = new Array();

let anytimeout = false;

let logic_buttons = {
    get ActionButton() { return actionButton; },
    get InteractButton() { return interactButton; },
    get AdditionalButton() { return additionalButton; },
    setCooldown(seconds: number, button: "use" | "action" = "use") {
        if (button === "action") actionButton.cooldown(seconds);
        else interactButton.cooldown(seconds);
    },
    isCooldown(button: "use" | "action" = "use") {
        if (button==="action") 
            return actionButton.cooldown_time > 0;
        return interactButton.cooldown_time > 0
    },
    buttonSelectUpdate(butid: number | true, neardead: DeadCharacter) {
        if (!GameLogic.isGameStarted) return;
        const button = butid === true ? actionButton : additionalButton[butid];
        if (!button) return;
        button.updateCD();
        if (button.cooldown_time > 0) {
            button.unselect();
            return;
        }
        const role = Characters.main.getRole();
        if (butid !== true) {
            if (!role.additionalActions) return;
            if (role.additionalActions.length <= butid && !role.additionalActions[butid]) return;
        }
        const act = butid === true ? role.action : role.additionalActions[butid];
        if (!role.canSelectSomeone(false, butid)) {
            if (act && act.select !== "regulatable") button.select();
            return;
        }
        if (act.select === "deadbody") {
            if (!neardead) {
                button.unselect();
                return;
            }
            button.select();
        } else {
            if (!logic_character.isSelectedCharacter()) {
                button.unselect();
                return;
            }
            button.select();
        }
    },
    update() {
        if (voting.isVoting) return;

        const neardead = logic_kill.getDeadNear(Characters.main.getLocation());
        logic_buttons.buttonSelectUpdate(true, neardead);
        for (let i = additionalButton.length; i > 0; i--) {
            logic_buttons.buttonSelectUpdate(i-1, neardead);
        }
        if (neardead) reportButton.select()
        else reportButton.unselect();
        
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
        ['Digit1', 'Digit2', 'Digit3'].forEach((key, i) => {
            const b = new UseButton(new Texture('missingo.png'))
                    .setMargin({x: 50+i*250, y: -250})
                    .setSize(200,200)
                    .setAltKey(key)
                    .setClickRule(() => {
                        return !voting.isVoting && GameLogic.isGameStarted;
                    })
                    .setClick(() => {
                        const role = Characters.main.getRole();
                        if (role.additionalActions.length <= i && !role.additionalActions[i]) return;
                        const selection = role.canSelectSomeone(false, i);
                        if (!selection) {
                            role.additionalActions[i].act(null);
                            additionalButton[i].cooldown(role.additionalActions[i].cooldown);
                            return;
                        }
                        if (role.additionalActions[i].select === "deadbody") {
                            let ch = logic_kill.getDeadNear(Characters.main.getLocation());
                            if (ch) {
                                role.additionalActions[i].act(ch.getCharacter());
                                additionalButton[i].cooldown(role.additionalActions[i].cooldown);
                            }
                            return;
                        }
                        let ch = logic_character.trySelectCharacter(true, selection === "notimpostor", selection === "notinfected");
                        if (ch) {
                            role.additionalActions[i].act(ch);
                            additionalButton[i].cooldown(role.additionalActions[i].cooldown);
                        }
                    });
            additionalButton.push(b);
        })
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
                    const selection = role.canSelectSomeone(false, true);
                    if (!selection) {
                        role.action.act(null);
                        actionButton.cooldown(role.action.cooldown);
                        return;
                    }
                    if (role.action.select === "deadbody") {
                        let ch = logic_kill.getDeadNear(Characters.main.getLocation());
                        if (ch) {
                            role.action.act(ch.getCharacter());
                            actionButton.cooldown(role.action.cooldown);
                        }
                        return;
                    }
                    let ch = logic_character.trySelectCharacter(true, selection === "notimpostor", selection === "notinfected");
                    if (ch) {
                        role.action.act(ch);
                        actionButton.cooldown(role.action.cooldown);
                    }
                });
        actionButton.unselect();

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


        RoleFuncs.load();

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
                    dc.delete();
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

        ButtonFuncs.addButton(actionButton, reportButton, interactButton, fullscreenbutton, ...additionalButton);
    }
}

export {logic_buttons};