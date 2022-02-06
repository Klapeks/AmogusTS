import { Character } from "../../characters/Character";
import { Role, RoleType } from "../../roles/role";



let theend = {
    end(role: Role, characters?: Character[]) {
        role.getWinSound().play();
        switch(role.type) {
            case "neutral": {

                break;
            }
            case "impostor": {

                break;
            }
            default: {
                
                break;
            }
        }
    }
}


export {theend};