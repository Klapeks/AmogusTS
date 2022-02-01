import { Button, ButtonFuncs } from "../../engine/Button";
import { Game } from "../../engine/Game";
import { Location } from "../../engine/Location";
import { MenusUtils } from "../../engine/Menu";
import { Sprite, StaticSprite } from "../../engine/Sprite";
import { TextTexture, Texture } from "../../engine/Texture";
import { config } from "../config";
import { Characters, logic_character } from "./charslog";
import { TaskMenu } from "./items/TaskMenu";
import { logic_kill } from "./kill";
import { logic_map } from "./maps/maplogic";
import { meeting } from "./meeting/meeting";
import { voting } from "./meeting/voting";


let killbutton: Button,
    reportbutton: Button,
    fullscreenbutton: Button,
    usebutton: Button,
    sabotagebutton: Button;

let killcooldownText: Sprite;

let killcooldown = 0, usecooldown = 0, anytimeout = false;

let logic_buttons = {
    setCooldown(seconds: number, button: "use" | "kill" = "use") {
        if (button === "kill") killcooldown = seconds;
        else usecooldown = seconds;
    },
    isCooldown(button: "use" | "kill" = "use") {
        if (button==="kill") return killcooldown>0;
        else return usecooldown>0
    },
    selectUseButton(b: boolean) {
        if (b) usebutton.select();
        else usebutton.unselect();
        if (Characters.main.getRole().type === "impostor") {
            usebutton.hidden = !b;
            sabotagebutton.hidden = b;
        }
    },
    update() {
        if (voting.isVoting) return;
        if (logic_character.isSelectedCharacter() && killcooldown == 0) killbutton.select();
        else killbutton.unselect();
        if (logic_kill.getDeadNear(Characters.main.getLocation())) reportbutton.select()
        else reportbutton.unselect();
        
        if (killcooldown > 0) {
            killcooldown -= Game.deltaTime;
            if (killcooldown <= 0.5) {
                (killcooldownText.getTexture() as TextTexture).setText("");
                killcooldown = 0;
            } else {
                (killcooldownText.getTexture() as TextTexture).setText(`${Math.round(killcooldown)}`);
            }
        }
        if (usecooldown > 0) {
            usecooldown -= Game.deltaTime;
            if (usecooldown <= 0.1) usecooldown = 0;
        }
        else {
            if (!MenusUtils.isNoMenu() && (Game.hasKey("escape") || Game.hasKey("keye"))) {
                for (let m of MenusUtils.showedMenus) {
                    if (m instanceof TaskMenu){
                        logic_buttons.setCooldown(0.5, "use");
                        m.hide();
                        return;
                    }
                }
            }
        }
    },
    load() {
        killcooldownText = new StaticSprite(new TextTexture("", "arial")
                .setFontSize(100).setColor("white").setAlign("center").setOutline('black', 10),
                new Location(100,75)).setMargin({x: -300, y: -50}).setSize(200, 200);
        
        killbutton = new Button(new Texture('buttons/nokill.png'), new Location(200,200))
                .setMargin({x: -300, y: -50})
                .setSize(200,200)
                .setAltKey('KeyQ')
                .setClick(() => {
                    if (voting.isVoting) return;
                    if (Characters.main.isVentedAnim) return;
                    if (killcooldown>0) return;
                    let ch = logic_character.trySelectCharacter();
                    if (ch) {
                        logic_kill.kill(ch, Characters.main, true);
                        killcooldown = config.killcooldown;
                    }
                })
                .setSelected(new Texture('buttons/kill.png'));

        sabotagebutton = new Button(new Texture('buttons/sabotage.png'), new Location(200,200))
                .setMargin({x: -50, y: -50})
                .setSize(200,200)
                .setClick(() => {
                    if (voting.isVoting) return;
                    console.log("sabotage go brrrrr");
                });

        usebutton = new Button(new Texture('buttons/nouse.png'), new Location(200,200))
                .setMargin({x: -50, y: -50})
                .setSize(200,200)
                .setAltKey('KeyE')
                .setClick(() => {
                    if (usecooldown>0) return;
                    const nt = logic_map.getNearInteractable();
                    if (nt) {
                        usecooldown = 0.3;
                        nt.use();
                    }
                })
                .setSelected(new Texture('buttons/use.png'));
        usebutton.hidden = true;
        reportbutton = new Button(new Texture('buttons/noreport.png'), new Location(200,200))
                .setMargin({x: -50, y: -300})
                .setSize(200,200)
                .setAltKey('KeyR')
                .setClick(() => {
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

        ButtonFuncs.addButton(sabotagebutton, killbutton, reportbutton, fullscreenbutton, usebutton);
        Game.getScene().addUpperSprite(killcooldownText);
    }
}

export {logic_buttons};