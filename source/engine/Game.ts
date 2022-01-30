import { ButtonFuncs } from "./Button";
import { Camera } from "./Camera";
import { Scene } from "./Scene";
import { Texture } from "./Texture";

type MouseClickEvent = (x: number, y:number) => void;
type ResizeEvent = (x: number, y:number) => void;
type SomeEvent = () => void;

let events_mouseclick: Array<MouseClickEvent> = new Array();
let events_resize: Array<ResizeEvent> = new Array();
// let events_onupdate: Array<SomeEvent> = new Array();
let events_onload: Array<SomeEvent> = new Array();
let events_ondone: Array<SomeEvent> = new Array();

let keys: Array<String> = new Array();
let mainscene: Scene;

let lastTime = 0;

let Game = {
    deltaTime: 0,
    isLoaded: false,
    gameinfo: {
        isFullScreen: false,
    },
    mouseinfo: {
        isClicked: false,
        posX: 0,
        posY: 0
    },
    eventListeners: {
        addMouseClick(event: MouseClickEvent) {
            events_mouseclick.push(event);
        },
        addLoad(event: SomeEvent) {
            events_onload.push(event);
        },
        addRezise(event: ResizeEvent) {
            events_resize.push(event);
        },
        addDone(event: SomeEvent) {
            events_ondone.push(event);
        },
        async onUpdate(): Promise<void> {},
        callMouseClick(x: number, y: number) {
            events_mouseclick.forEach(m => m(x,y));
        },
        callResize(w: number, h: number) {
            events_resize.forEach(m => m(w,h));
        },
        callLoad() {
            ButtonFuncs.load();
            events_onload.forEach(m => m());
        },
        callDone() {
            events_ondone.forEach(m => m());
            Game.isLoaded = true;
        },
        tryFullScreen() {}
    },
    update() {
        Game.deltaTime = (performance.now()-lastTime)/1000;
        lastTime = performance.now();

        Game.eventListeners.onUpdate();
        ButtonFuncs.update();
        mainscene.drawSprites();
    },
    functions: {
        texturePath(path: string): string {
            return path;
        },
        soundPath(path: string): string {
            return path;
        },
        generateImage(texture: Texture, onload: (texture: Texture, image: any)=>void): any {
            let image = new Image;
            image.onload = () => {
                onload(texture, image);
            }
            image.src = texture.getPath();
            return image;
        }
    },
    getCamera(): Camera {
        return mainscene.getCamera();
    },
    getScene(): Scene {
        return mainscene;
    },
    setScene(scene: Scene): void {
        mainscene = scene;
    },
    addKey(key: string): void {
        if (!key) return;
        if (!Game.hasKey(key)) {
            console.log(key);
            keys.push(key.toLowerCase());
        }
    },
    getKeys() {
        return keys;
    },
    removeKey(key: string): void { 
        if (!key) return;
        keys = keys.filter(k => k!=key.toLowerCase());
    },
    hasKey(key: string): boolean {
        if (!key) return false;
        return keys.includes(key.toLowerCase());
    },
}

export {Game};