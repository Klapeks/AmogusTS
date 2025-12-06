import { handler } from "./handler";

let main = {
    init: () => {
        handler.console.bind(['help', '?'], 'help command', (args) => {
            handler.console._helpCommand();
        });
        handler.console.bind('stop', 'stops server', (args) => {
            console.log("§eThank you and goodbye :)")
            process.exit(0);
        });
    }
}

export { main }