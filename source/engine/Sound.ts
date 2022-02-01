import { GameConfig } from "./EngineConfig";
import { Game } from "./Game";

interface ISoundPlayer {
    play(sound: any, type?: SoundType): void;
    create(path: string, onCreate: (sound: any) => void): void;
}

type SoundType = "gui" | "ambient" | "interaction" | "default" | "effects";

class HTMLSoundPlayer implements ISoundPlayer {
    play(sound: HTMLAudioElement, type: SoundType = "default") {
        sound.volume = SoundsUtils.getVolume(type);
        if (sound.cloneNode) {
            const s = sound.cloneNode(true) as HTMLAudioElement;
            s.volume = SoundsUtils.getVolume(type);
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
let typeVolume = new Map<SoundType, number>()
let SoundsUtils = {
    setSoundCreator(sc: ISoundPlayer) {
        soundCreator = sc;
    },
    setVolume(type: SoundType, vol: number) {
        typeVolume.set(type, vol)
    },
    getVolume(type: SoundType) {
        return typeVolume.has(type) ? typeVolume.get(type) : GameConfig.volume;
    }
}


class Sound {
    private _path: string;
    private _sound: any;
    private _type: SoundType = "default";
    constructor(path: string, type: SoundType = "default") {
        this._path = Game.functions.soundPath(path);
        soundCreator.create(this._path, (sound) => {
            this._sound = sound;
        });
        this._type = type;
    }
    setType(type: SoundType) {
        this._type = type;
        return this;
    }
    play() {
        soundCreator.play(this._sound, this._type);
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
export {Sound, MultiSound, ISoundPlayer, SoundsUtils, SoundType}