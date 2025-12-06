import { Texture } from "../../../../engine/Texture";
import { CharacterFuncs } from "../../../characters/CharFuncs";
import { Characters } from "../../charslog";
import { tablet_settings } from "./tablet_settings";
import { VoteMenu } from "./votemenu";


let changedTexture = false;
const tablet = {
    load() {
        tablet_settings.load();
        VoteMenu.load();
    },
    update() {
        VoteMenu.update();
    },
    tryChangeTexture() {
        if (changedTexture) return;
        tablet_settings.tabletTexture = new Texture('voting/tablet.png', null, () => {
            tablet_settings.tabletTexture =
                    CharacterFuncs.cloneFiltering(
                    tablet_settings.tabletTexture,
                    Characters.main.getColor());
            VoteMenu.getMenu()?.setTexture(tablet_settings.tabletTexture);
        });
        changedTexture = true;
    },
    removeChangedTexture() {
        changedTexture = false;
    },
}

export {tablet};