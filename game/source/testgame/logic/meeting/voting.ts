import { VoteMenu } from "./tablet/votemenu";

let voting = {
    isVoting: false,
    load() {
    },
    update() {
    },
    start(){
        VoteMenu.open();
    }
}

export {voting};