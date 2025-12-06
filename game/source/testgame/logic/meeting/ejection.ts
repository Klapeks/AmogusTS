import { Game } from "../../../engine/Game";
import { Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { Sprite, StaticSprite } from "../../../engine/Sprite";
import { TextTexture, Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { textures } from "../../textures";
import { GameLogic } from "../gamelogic";
import { logic_kill } from "../kill";
import { meeting } from "./meeting";

let darkness: StaticSprite,
    stars: StaticSprite,
    stars2: StaticSprite,
    textSprite: StaticSprite,
    subtextSprite: StaticSprite,
    iconSprite: StaticSprite;

let soundText: Sound, soundKick: Sound;

let ejectTexts = {
    subsize: 70,
    mainsize: 80,
    mainmargin: -20,
    submargin: 25,
    subsizemultiply: 1.75,
    ejectRotation: 4*Math.PI,
    iconSize: 0.75
}
let ejectTimings = [ // in ms
    300,  // Затмение 
    2000, // Ожидание
    4000, // Анимация текста
    4300, // ждем 
    4900, // Анимация сабтекса
    5200, // Закрытие
    5500  // Конец
];

let ejections = {
    load() {
        soundText = new Sound("voting/eject_text.wav");
        soundKick = new Sound("voting/eject_skeld.wav");
        darkness = new StaticSprite(new Texture('dark.png'))
                    .setSize(Screen.width, Screen.height)
                    .setPriority(95);
        darkness.setSplitting(0, 0, 8, 8);
        darkness.hidden = true;

        stars = new StaticSprite(new Texture('stars.png'))
                    .setSize(Screen.width, Screen.height)
                    .setPriority(95);
        stars.setSplitting(0, 0, 800, 432);
        stars.hidden = true;

        stars2 = new StaticSprite(new Texture('stars2.png'))
                    .setSize(Screen.width, Screen.height)
                    .setPriority(95);
        stars2.setSplitting(0, 0, 800, 432);
        stars2.hidden = true;

        let textt = new TextTexture('', 'arial').setFontSize(ejectTexts.mainsize).setColor("white").setAlign("center").setOutline('black', 5);
        textSprite = new StaticSprite(textt, new Location(Screen.width/2,
                Screen.height/2 + ejectTexts.mainsize/2 + ejectTexts.mainmargin))
                .setSize(Screen.width, Screen.height)
                .setPriority(95);

        textt = new TextTexture('', 'arial').setFontSize(ejectTexts.subsize).setColor("white").setAlign("center").setOutline('black', 5);
        subtextSprite = new StaticSprite(textt, new Location(Screen.width/2,
                Screen.height/2 + (ejectTexts.subsize+ejectTexts.mainsize)/2 + ejectTexts.submargin))
                .setSize(Screen.width, Screen.height)
                .setPriority(95);
        
        textSprite.hidden = true;
        subtextSprite.hidden = true;
    },
    update() {
        if (!darkness.hidden){
            stars.splitting.x += 1.5;
            if (stars.splitting.x > 1504) stars.splitting.x = 0;
            stars2.splitting.x += 1;
            if (stars2.splitting.x > 1504) stars2.splitting.x = 0;
        }
    },
    isEjecting: false,
    eject(text: string, subtext: string = "", character?: Character) {
        ejections.isEjecting = true;
        Game.getScene().LayerGUI.add(darkness, stars, stars2);
        darkness.setSplitting(7*16, 7*16, 8, 8);
        // ejectanimation = 1;
        darkness.hidden = false;
        stars.splitting.x = 0;
        stars2.splitting.x = 0;

        let afterKick = new Array<() => void | boolean>();

        if (character) {
            GameLogic.eventListeners.onkick.check({character, doAfterKick: afterKick});
            iconSprite = new StaticSprite(character.getTextures().eject, new Location(-200, Screen.height/2))
                    .setSize(256*ejectTexts.iconSize, 256*ejectTexts.iconSize)
                    .setPriority(95);
            Game.getScene().LayerGUI.add(iconSprite);
            for (let i = 0; i < ejectTexts.ejectRotation; i+=0.1) {
                const ratio = i/ejectTexts.ejectRotation;
                setTimeout(() => {
                    iconSprite.getLocation().x = -200 + 2100*ratio;
                    iconSprite.getLocation().y = Screen.height/2 - 200*ratio;
                    iconSprite.setLocationYaw(i);
                }, ejectTimings[0] + (ejectTimings[3]-ejectTimings[0])*ratio);
            }
            character.setAlive(false);
        }
        Game.getScene().LayerGUI.add(subtextSprite, textSprite);

        // Darkness: 0 - dark, 7 - not dark
        // Stage 1: make screen dark
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                darkness.setSplitting(0, (8-i-1)*16+4, 8, 8);
            }, ejectTimings[0]*i/7);
        }
        // Stage 1.5: Show stars and text;
        setTimeout(() => {
            stars.hidden = false;
            stars2.hidden = false;
            textSprite.hidden = false;
            (subtextSprite.getTexture() as TextTexture).fontsize = 0;
            subtextSprite.hidden = false;
            soundKick.play();
        }, ejectTimings[0]);

        // Stage 2: Text animation
        for (let i = 0; i < text.length; i++) {
            setTimeout(() => {
                (textSprite.getTexture() as TextTexture).text = text.substring(0, i);
                soundText.play();
            }, ejectTimings[1] + (ejectTimings[2] - ejectTimings[1])*i/(text.length));
        }
        setTimeout(() => {
            (textSprite.getTexture() as TextTexture).text = text;
            soundText.play();
        }, ejectTimings[2]);

        // Stage 3: Wait

        // Stage 4: Subtext animation
        (subtextSprite.getTexture() as TextTexture).text = subtext;
        for (let i = 0; i < ejectTexts.subsize; i+=2) {
            setTimeout(() => {
                const timeratio: number = i/ejectTexts.subsize;
                // console.log(timeratio);
                if (timeratio < 0.75) {
                    (subtextSprite.getTexture() as TextTexture).fontsize = ejectTexts.subsizemultiply*ejectTexts.subsize*timeratio;
                } else {
                    (subtextSprite.getTexture() as TextTexture).fontsize = ejectTexts.subsize
                        *(1+(1-timeratio)*(0.75*ejectTexts.subsizemultiply-1)/0.25);
                }
            }, ejectTimings[3] + (ejectTimings[4] - ejectTimings[3])*i/(ejectTexts.subsize-1));
        }
        setTimeout(() => {
            (subtextSprite.getTexture() as TextTexture).fontsize = ejectTexts.subsize;
        }, ejectTimings[4]);

        // Stage 5: Wait 2
        setTimeout(() => {
            stars.hidden = true;
            stars2.hidden = true;
            textSprite.hidden = true;
            subtextSprite.hidden = true;
            meeting.end();
            let cont = true;
            if (afterKick && afterKick.length > 0) {
                for (let f of afterKick) {
                    const ans = f();
                    if (typeof ans === "boolean" && ans === false) {
                        cont = false;
                        break;
                    }
                }
            }
            if (cont) logic_kill.checkAlive(0);
        }, ejectTimings[5]);

        // Stage 6: Remove dark
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                darkness.setSplitting(0, i*16+4, 8, 8);
            }, ejectTimings[ejectTimings.length-2]+(ejectTimings[ejectTimings.length-1]-ejectTimings[ejectTimings.length-2])*i/7);
        }
        setTimeout(() => {
            darkness.hidden = true;
            (textSprite.getTexture() as TextTexture).text = '';
            (subtextSprite.getTexture() as TextTexture).text = '';
            (subtextSprite.getTexture() as TextTexture).fontsize = 0;
            Game.getScene().LayerGUI.remove(darkness, stars, stars2, subtextSprite, textSprite, iconSprite);
            ejections.isEjecting = false;
            iconSprite = null;
        }, ejectTimings[ejectTimings.length-1]);
    }
}

export { ejections };