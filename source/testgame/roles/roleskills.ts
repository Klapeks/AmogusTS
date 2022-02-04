import { config } from "../config";
import { Characters } from "../logic/charslog";
import { logic_kill } from "../logic/kill";
import { RoleAction } from "./role";

const ImpostorAction: RoleAction = {
    select: "notimpostor",
    act: (ch) => {
        logic_kill.kill(ch, Characters.main, true);
    },
    cooldown: config.killcooldown,
    button_texture: 'buttons/kill.png'
}

export {ImpostorAction}