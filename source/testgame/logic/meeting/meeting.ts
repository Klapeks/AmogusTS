import { Game } from "../../../engine/Game";
import { Location } from "../../../engine/Location";
import { MenusUtils } from "../../../engine/Menu";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { Sprite, StaticSprite } from "../../../engine/Sprite";
import { Texture } from "../../../engine/Texture";
import { Character } from "../../characters/Character";
import { Characters } from "../charslog";
import { caller } from "./caller";
import { tablet } from "./tablet";
import { voting } from "./voting";

let table: StaticSprite, meetingText: StaticSprite, deadbodyText: StaticSprite;
let amogusSprite: StaticSprite, additionSprite: StaticSprite, deadTexture: Texture;
let reportSound: Sound, meetingSound: Sound;

let position = {
    multiply: 1.75,
    dy: 130,
    width: 225*1.5,
    height: 131*1.5
}

let meeting = {
    load() {
        caller.load();
        tablet.load();
        reportSound = new Sound('voting/report.wav');
        meetingSound = new Sound('voting/meeting.wav');
        meetingText = new StaticSprite(new Texture('voting/meetingtext.png'))
                    .setSize(400*position.multiply, 192*position.multiply)
                    .setLocationByCenter(Screen.width/2, Screen.height/2+position.dy)
                    .setPriority(55);

        deadbodyText = new StaticSprite(new Texture('voting/reporttext.png'))
                    .setSize(432*position.multiply, 224*position.multiply)
                    .setLocationByCenter(Screen.width/2, Screen.height/2+position.dy)
                    .setPriority(55);

        table = new StaticSprite(new Texture('voting/table.png'))
                    .setSize(position.width, position.height)
                    .setLocationByCenter(Screen.width/2, Screen.height/2-position.dy*1.25)
                    .setPriority(55);
        
        deadTexture = new Texture('voting/dead.png');

        meeting.clear();
    },
    update() {
        if (Game.hasKey('keyb')) {
            if (!voting.isVoting) meeting.call(Characters.main, "meeting");
        }
        tablet.update();
    },
    clear() {
        meetingText.hidden = true;
        deadbodyText.hidden = true;
        table.hidden = true;
        Game.getScene().removeUpperSprite(meetingText, deadbodyText, 
            amogusSprite, table, additionSprite);
        amogusSprite = null;
        additionSprite = null;
    },
    call(icon: Character, state: "meeting" | "dead") {
        voting.isVoting = true;
        MenusUtils.hideAll();
        if (state==="dead") reportSound.play();
        else meetingSound.play();
        let time = caller.call(() => {
            if (state==="dead") {
                deadbodyText.hidden = false;
                amogusSprite = new StaticSprite(icon.getTextures().meeting.texture)
                    .setSize(position.width, position.height)
                    .setSplitting(0,0,icon.getTextures().meeting.width,icon.getTextures().meeting.height)
                    .setLocationByCenter(Screen.width/2, Screen.height/2-position.dy)
                    .setPriority(55);

                additionSprite = new StaticSprite(deadTexture)
                    .setSize(position.width, position.height)
                    .setLocationByCenter(Screen.width/2, Screen.height/2-position.dy*2.5)
                    .setPriority(55);
                
                Game.getScene().addUpperSprite(deadbodyText, amogusSprite, additionSprite);
            }
            else {
                meetingText.hidden = false;
                table.hidden = false;
                amogusSprite = new StaticSprite(icon.getTextures().meeting.texture)
                    .setSize(position.width, position.height)
                    .setSplitting(0,icon.getTextures().meeting.height,icon.getTextures().meeting.width,icon.getTextures().meeting.height)
                    .setLocationByCenter(Screen.width/2, Screen.height/2-position.dy*1.25)
                    .setPriority(55);

                additionSprite = new StaticSprite(icon.getTextures().meeting.texture)
                    .setSize(position.width, position.height)
                    .setSplitting(0,icon.getTextures().meeting.height*2,icon.getTextures().meeting.width,icon.getTextures().meeting.height)
                    .setLocationByCenter(Screen.width/2, Screen.height/2-position.dy*1.25)
                    .setPriority(55);

                Game.getScene().addUpperSprite(meetingText, amogusSprite, table, additionSprite);
            }
        }, 1500, () => meeting.clear());
        setTimeout(() => {
            voting.start();
        }, time-200);
    },
    end() {
        voting.isVoting = false;
    }
}

export {meeting}