import { config } from "../../config";
import { Map } from "./map";
import { Characters } from "../charslog";
import { Task } from "../items/tasks/task";
import { logic_buttons } from "../buttons";
import { InteractableItem } from "../../../engine/InteractableItem";
import { Location } from "../../../engine/Location";
import { Vents } from "../items/vents";

let _mininteract: InteractableItem, _dist: number, _wasminint: boolean;
let mapNow: Map;


function distanceSquared(loc1: {x: number, y: number}, loc2: {x: number, y: number}){
    return Math.pow(loc1.x-loc2.x, 2) + Math.pow(loc1.y-loc2.y, 2);
}

let logic_map = {
    setMap(map: Map) {
        mapNow = map;
    },
    getMap(){
        return mapNow;
    },
    update() {
        if (!mapNow) return;
        _wasminint = !!_mininteract;
        _mininteract = null;
        const charcenter = Characters.main.getCenter();
        let trySelect = (inter: InteractableItem) => {
            inter.unselect();
            if (inter instanceof Vents && !Characters.main.getRole().usevents) return;
            if (typeof inter.userange === "number") {
                _dist = distanceSquared(inter.getCenter(), charcenter);
                if (_dist < inter.userange*inter.userange) {
                    if (_mininteract) {
                        if (_dist < distanceSquared(_mininteract.getCenter(), charcenter)) _mininteract = inter;
                    } else _mininteract = inter;
                }
            } else {
                if (Location.isInHitbox(charcenter.x, charcenter.y, inter.userange)){
                    if (_mininteract) {
                        if (distanceSquared(inter.getCenter(), charcenter) < distanceSquared(_mininteract.getCenter(), charcenter))
                            _mininteract = inter;
                    } else _mininteract = inter;
                }
            }
        }
        mapNow.tasks.forEach(task => {
            trySelect(task);
            if (task.isOpened()){
                task.update();
            }
        });
        mapNow.vents.forEach(trySelect);
        trySelect(mapNow.emergencybutton);

        if (_mininteract) {
            _mininteract.select();
            if (_wasminint) {
                logic_buttons.InteractButton.setState(0);
                logic_buttons.InteractButton.select();
            }
        } else if (_wasminint) {
            if (Characters.main.getRole().type === "impostor") {
                logic_buttons.InteractButton.setState(-1);
            } else {
                logic_buttons.InteractButton.unselect();
            }
        }
        mapNow.update();
        // logic_map.mapNow.tasks;
    },
    getNearInteractable() {
        return _mininteract;
    }
}

export {logic_map}