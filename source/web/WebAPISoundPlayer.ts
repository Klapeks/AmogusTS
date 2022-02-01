import { ISoundPlayer, SoundsUtils, SoundType } from "../engine/Sound";

var win: any = window;
window.AudioContext = win.AudioContext||win.webkitAudioContext;
if (!window.AudioContext) alert("Ваш браузер не поддерживает WebAudioAPI")

let ctx = new AudioContext();
let gainNodes = new Map<SoundType, GainNode>()
// let gainNode = ctx.createGain();
// gainNode.connect(ctx.destination);

class WebAPISoundPlayer implements ISoundPlayer {
    play(sound: AudioBuffer, type: SoundType = "default"): void {
        if (!gainNodes.has(type)) {
            const gainNode = ctx.createGain();
            gainNode.connect(ctx.destination);
            gainNodes.set(type, gainNode);
        }
        const gainNode = gainNodes.get(type);
        gainNode.gain.value = SoundsUtils.getVolume(type);
        let source = ctx.createBufferSource();
        source.buffer = sound;
        source.connect(gainNode);
        source.onended = function(){if(this.stop)this.stop(); if(this.disconnect)this.disconnect();}
        source.start(0);
    }
    create(path: string, onCreate: (sound: any) => void): void {
        let xhr = new XMLHttpRequest();
        xhr.onload = () => {
            ctx.decodeAudioData(xhr.response, buf => onCreate(buf), e => console.log(e));
        };
        xhr.open('GET', path, true);
        xhr.responseType = 'arraybuffer';
        xhr.send();
    }
}
export {WebAPISoundPlayer}