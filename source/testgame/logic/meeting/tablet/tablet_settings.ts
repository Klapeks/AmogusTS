import { Screen } from "../../../../engine/Screen";
import { Sound } from "../../../../engine/Sound";
import { Texture } from "../../../../engine/Texture";

let tabletTexture: Texture, glassTexture: Texture;
let nameplatesT: Texture, deadmarkTexture: Texture;
let sounds: { select: Sound, vote: Sound }

const tabletMultiplier = 0.95;

let tablet_settings = {
    tabletSize: {
        width: Screen.width*tabletMultiplier,
        height: Screen.height*tabletMultiplier
    },
    plateSize: {
        width: Screen.width*tabletMultiplier*272/1020,
        height: Screen.height*tabletMultiplier*64/570
    },
    get tabletTexture() { return tabletTexture; },
    set tabletTexture(texture: Texture) {
        tabletTexture = texture;
    },
    get nameplatesT() { return nameplatesT; },
    get deadmarkTexture() { return deadmarkTexture; },
    get glassTexture() { return glassTexture; },
    sounds: {
        get select() { return sounds.select; },
        get vote() { return sounds.vote; } 
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
    }
}

export {tablet_settings};