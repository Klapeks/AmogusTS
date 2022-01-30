import { Location } from "./Location";

let isEnableLight = false;


class Light {
    private _location: Location;
    radius: number;
    constructor(location: Location, radius: number) {
        this._location = location;
        this.radius = radius;
    }
    getLocation() {
        return this._location;
    }
    isStatic = false;
    setStatic(b: boolean) {
        this.isStatic = b;
        return this;
    }
    static enableLights() {
        isEnableLight = true;
    }
    static disableLights(){
        isEnableLight = false;
    }
    static isLightsEnable(){
        return isEnableLight;
    }
}

export {Light};