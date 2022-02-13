import { BiLocation, Location } from "../../../../engine/Location";
import { Texture } from "../../../../engine/Texture";
import { Task } from "./task";

let defaultTaskTexture: Texture;
function texture(): Texture {
    if (!defaultTaskTexture) defaultTaskTexture = new Texture('tasks/divert_power/task.png');
    return defaultTaskTexture;
}

class DiverPowerTask extends Task {
    constructor(location: BiLocation) {
        super("diverpowertask", texture(), location, "back");
    }
    use(): void {
        console.log("aboba");
    }
}

export {DiverPowerTask};