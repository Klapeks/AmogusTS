import { DeadCharacter } from "../../characters/DeadCharacter";
import { Characters } from "../../logic/charslog";

let dragging: DeadCharacter;

let role_medic = {
    setDragging(drag: DeadCharacter) {
        dragging = drag;
    },
    getDragging() {
        return dragging;
    },
    update() {
        if (!dragging) return;
        const x = Characters.main.getLocation().x - dragging.getSprite().getLocation().x;
        const y = Characters.main.getLocation().y - dragging.getSprite().getLocation().y+10;
        const lerp = 15;
        dragging.getSprite().getLocation().add(x/lerp,y/lerp);
    }
};

export {role_medic};