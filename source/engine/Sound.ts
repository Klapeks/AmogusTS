import { Game } from "./Game";

interface ISoundPlayer {
    play(sound: any, vol?: number): void;
    create(path: string, onCreate: (sound: any) => void): void;
}

class HTMLSoundPlayer implements ISoundPlayer {
    play(sound: HTMLAudioElement, vol?: number) {
        sound.volume = vol || SoundsUtils.volume;
        if (sound.cloneNode) {
            const s = sound.cloneNode(true) as HTMLAudioElement;
            s.volume = vol || SoundsUtils.volume;
            s.play();
        }
        else {
            sound.currentTime = 0;
            sound.play();
        }
    }
    create(path: string, onCreate: (sound: any) => void): void {
        // let audio = new Audio;
        let audio = new Audio;
        audio.src = path;
        audio.setAttribute("preload", "auto");
        audio.setAttribute("controls", "none");
        onCreate(audio);
    }
}

let soundCreator: ISoundPlayer = new HTMLSoundPlayer();
let SoundsUtils = {
    setSoundCreator(sc: ISoundPlayer) {
        soundCreator = sc;
    },
    volume: 0.1
}


class Sound {
    private _path: string;
    private _sound: any;
    constructor(path: string) {
        this._path = Game.functions.soundPath(path);
        soundCreator.create(this._path, (sound) => {
            this._sound = sound;
        });
    }
    play() {
        soundCreator.play(this._sound, SoundsUtils.volume);
    }
}
class MultiSound {
    private _sounds: Array<Sound> = new Array();
    constructor(...path: string[]) {
        for (let p of path) {
            this._sounds.push(new Sound(p));
        }
    }
    play() {
        this._sounds[Math.round((this._sounds.length-1)*Math.random())].play();
    }
}
export {Sound, MultiSound, ISoundPlayer, SoundsUtils}