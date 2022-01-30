import { Game } from "../engine/Game";
import { Texture, TextureFuncs } from "../engine/Texture"
import { AmogusTextures } from "./characters/CharFuncs";
import { skeld } from "./logic/maps/skeld";

let textures: {
    character_ratio: number,
    amogus: AmogusTextures,
    missingo: Texture,
    crewkillanimation: {
        alien: Texture    
    }
} = {
    character_ratio: 0.8,
    amogus: {
        idle: null, walk: null, dead: null, eject: null,
        vent: new Array(),
        meeting: null,
        killanimations: {
            // alien_crewmate: null,
            alien: null
        }
    },
    crewkillanimation: {
        alien: null
    },
    missingo: null
};

function loadTextures() {
    const multiply = 2;
    let wait = 0;
    setTimeout(() => {
        textures.missingo = new Texture(`missingo.png`);
        textures.amogus.eject = new Texture(`amogus/eject.png`);
    }, multiply*wait++);
    setTimeout(() => {
        textures.amogus.dead = {
            texture: new Texture(`amogus/dead.png`),
            width: 256,
            height: 256,
            amount_per_line: 8,
            amount: 37
        };
    }, multiply*wait++);
    setTimeout(() => {
        textures.amogus.walk = {
            texture: new Texture(`amogus/walk.png`),
            width: 256,
            height: 256,
            amount_per_line: 4,
            amount: 12
        };
    }, multiply*wait++);
    for (let i = 0; i < 5; i++){
        setTimeout(() => {
            textures.amogus.vent.push(new Texture(`amogus/vent/getinVent00${i+1<10?`0${i+1}`:`${i+1}`}.png`));
        }, multiply*wait++);
    }
    setTimeout(() => {
        textures.amogus.meeting = {
            texture: new Texture(`amogus/meeting.png`),
            width: 224,
            height: 128,
            amount_per_line: 1,
            amount: 3
        }
    }, multiply*wait++);
    setTimeout(() => {
        textures.amogus.killanimations.alien = new Texture(`amogus/killanimations/alien_imp.png`);
        textures.crewkillanimation.alien = new Texture(`amogus/killanimations/alien_crew.png`);
    }, multiply*wait++);
    
    wait+=10;
    setTimeout(() => {
        textures.amogus.idle = new Texture(`amogus/idle.png`);
        textures.amogus.idle.onload = () => {
            Game.eventListeners.callLoad();
            checkIsLoaded();
        }
    }, (multiply*wait+1));
}

function checkIsLoaded() {
    if (TextureFuncs.loadingTextures<=0) {
        Game.eventListeners.callDone();
    } else {
        setTimeout(() => {
            checkIsLoaded();
        }, 50);
    }
}

export {textures, loadTextures, AmogusTextures}