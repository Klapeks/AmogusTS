import { InteractableItem } from "../../../../engine/InteractableItem";
import { BiLocation } from "../../../../engine/Location";
import { Menu } from "../../../../engine/Menu";
import { Texture } from "../../../../engine/Texture";
import { Retexturing } from "../../../../engine/utils/Retexturing";
import { config } from "../../../config";

abstract class Task extends InteractableItem {
    protected _id: string;
    constructor(id: string, texture: Texture, location: BiLocation, type: "upper" | "dynamic" | "back" = "dynamic") {
        super(texture, location, type);
        this._id = id;
        this.setRange(config.taskrange);
    }
    protected generateSelectedTexture(texture: Texture): Texture {
        texture = new Texture(texture.getPath(), null, () => {
            texture.setImage(Retexturing.oneColor(texture.getImage(), {r:255, g:150, b:0}, 50));
        });
        return texture;
    }
    isOpened(): boolean {
        return this.getMenu()?.isShowed;
    }
    use(): void {
        this.getMenu()?.show();
    }
    update(): void {};

    abstract getMenu(): Menu;
}

export {Task};