import { Game } from "../../../engine/Game";
import { Sound } from "../../../engine/Sound";
import { Character } from "../../characters/Character";
import { Characters } from "../charslog";
import { KA_Alien } from "./kat_alien";
import { KillAnimation } from "./killanimations";

let allAnimations = new Array<KillAnimation>();
let killMusic: Sound, killSound: Sound;

let killanimation_logic = {
    isAnimationPlaying: false,
    playKillMusic() {
        killMusic.play();
    },
    playKillSound() {
        killSound.play();
    },
    load(){
        killMusic = new Sound('kill/music.wav');
        killSound = new Sound('kill/kill.wav');
        allAnimations.push(new KA_Alien());
        Game.eventListeners.addDone(() => {
            allAnimations.forEach(a => a.onGameStarted());
        })
    },
    play(killer: Character) {
        allAnimations[0].play(killer);
    },
    update() {
        if (Game.hasKey('keyl')) {
            allAnimations[0].play(Characters.another[1]);
        }
    }
}

export {killanimation_logic};