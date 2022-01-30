import { BiLocation, Location } from "../../../../engine/Location";
import { Texture } from "../../../../engine/Texture";
import { Task } from "./task";

let defaultTaskTexture: Texture;

class DiverPowerTask extends Task {
    constructor(location: BiLocation, texture?: Texture) {
        super("diverpowertask", texture, location, true);
    }
    getDeafultTexture(): Texture {
        if (!defaultTaskTexture) defaultTaskTexture = new Texture('tasks/divert_power/task.png');
        return defaultTaskTexture;
    }
    use(): void {
        console.log("aboba");
    }
}

export {DiverPowerTask};