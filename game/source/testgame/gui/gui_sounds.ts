import { Sound } from "../../engine/Sound"

let hoverSound: Sound, selectSound: Sound;

let gui_sounds = {
    load() {
        hoverSound = new Sound('gui/hover.wav');
        selectSound = new Sound('gui/select.wav');
    },
    get hover() {
        return hoverSound;
    },
    get select() {
        return selectSound;
    },
}

export {gui_sounds};