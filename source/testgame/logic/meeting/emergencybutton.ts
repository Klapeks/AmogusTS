import { InteractableItem } from "../../../engine/InteractableItem";
import { BiLocation, Hitbox, Location } from "../../../engine/Location";
import { Screen } from "../../../engine/Screen";
import { Sound } from "../../../engine/Sound";
import { Texture } from "../../../engine/Texture";
import { Retexturing } from "../../../engine/utils/Retexturing";
import { logic_buttons } from "../buttons";
import { Characters } from "../charslog";
import { TaskMenu } from "../items/TaskMenu";
import { meeting } from "./meeting";
import { voting } from "./voting";
import { tablet } from "./tablet/tablet";

let buttonTexture: Texture;
let clicksound: Sound;
let menu: TaskMenu;
let waitingHost: boolean = false;

class EmergencyButton extends InteractableItem {

    constructor(location: BiLocation, range: number | Hitbox = 300) {
        super(null, location, "back");
        this.setRange(range);
        if (!clicksound) clicksound = new Sound('voting/embutton.wav');
        if (!menu) {
            menu = new TaskMenu(new Texture('tasks/emergencybutton/menu1.png'),
                {width: Screen.height, height: Screen.height});
            menu.addClick({x: 793, y: 257, dx: 1151, dy: 604, fromto:true}, () => {
                if (waitingHost) return;
                if (voting.isVoting) return;
                waitingHost = true;
                clicksound.play();
                logic_buttons.setCooldown(1, "use");
                setTimeout(() => {
                    logic_buttons.setCooldown(3, "use");
                    meeting.call(Characters.main, "meeting");
                    waitingHost = false;
                }, 100);
            });
            menu.setApearTime(100);
        }
    }

    getDeafultTexture(): Texture {
        if (!buttonTexture) buttonTexture = new Texture('tasks/emergencybutton/button.png');
        return buttonTexture;
    }
    use(): void {
        tablet.tryChangeTexture();
        if (voting.isVoting) return;
        menu.show();
    }
    protected generateSelectedTexture(texture: Texture): Texture {
        texture = new Texture(texture.getPath(), null, () => {
            texture.setImage(Retexturing.oneColor(texture.getImage(), {r:0, g:0, b:255}, 50));
        });
        return texture;
    }
}

export {EmergencyButton}