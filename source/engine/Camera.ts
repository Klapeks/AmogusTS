import { Location } from "./Location";
import { Screen } from "./Screen";

class Camera {
    private _loc: Location;
    private _resolution: Location;
    constructor(location?: Location) {
        if (!location) location = new Location(0,0);
        this._loc = location;
        this._resolution = new Location(Screen.width, Screen.height);
    }
    setPos(location: Location): void {
        this._loc = location;
    }
    getLocation(): Location {
        return this._loc;
    }
    getResolution(): Location {
        return this._resolution;
    }
}

export { Camera };