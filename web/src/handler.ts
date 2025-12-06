import { IncomingMessage, ServerResponse } from "http";
import url from 'url';
import { main } from "./main";
import fs from 'fs';
import { utils } from "./utils";
import mPath from 'path';

interface Parametrs {
    URL: url.UrlWithParsedQuery;
    contentType: string;
    filePath: string;
}
interface HandlerArguments {
    request: IncomingMessage;
    response: ServerResponse;
    params: Parametrs;
}
let handlers = new Map<String, (args: HandlerArguments) => boolean | Promise<boolean> | void | Promise<void>>();
let console_handlers = new Map<String, {description: string, handler: ((args: string[]) => any)}>();

let handler = {
    bind: (path: string, handler: (args: HandlerArguments) => boolean | Promise<boolean> | void | Promise<void>) => {
        handlers.set(path, handler);
    },
    doHandle: async (request: IncomingMessage, response: ServerResponse, params: Parametrs): Promise<boolean> => {
        if (!params?.URL?.pathname) return false;
        let path: string = params.URL.pathname;
        let func: any;
        if (handlers.has(path) && (func = handlers.get(path))) {
            try {
                let f1: any = func({request, response, params});
                if (f1?.then) f1 = await f1;
                if (typeof f1 === 'boolean') return f1;
                return true;
            } catch (e) {
                response.writeHead(500);
                response.end("500 Internal Server Error D:");
                console.log(e);
            }
            return false;
        }
        if (path.includes('gameapi/')){
            if (path.includes('gameapi/assets')) {
                path = "game/assets/"+path.split('gameapi/assets')[1];
            } else if (path.includes('gameapi/script')) {
                path = "game/script/" + path.split('gameapi/script')[1];
                if (!path.endsWith(".js")) path += ".js";
            }
            let contentType = utils.getContentType(path);
            if (!path) {
                response.writeHead(404); response.end("404 Not Found");
                return true;
            }
            path = path.replace('//', '/');
            fs.readFile(mPath.join(__dirname, '../../', path), (err, data) => {
                if (err) {
                    try { response.writeHead(404); response.end("404 Not Found"); console.error(err); } catch (e) {}
                    return;
                }
                response.writeHead(200, {'Content-Type': contentType});
                response.end(data);
            });
            return true;
        }
        return false;
    },
    console: {
        bind: (command: string | string[], description: string, handler: (args: string[]) => any) => {
            if (typeof command === 'string') console_handlers.set(command, {description, handler});
            else for (let c of command) {
                if (c === command[0]) console_handlers.set(c, {description, handler});
                else console_handlers.set(c, {description: `alias for §f${command[0]}`, handler})
            }
        },
        doHandle: async (command: string, args: string[]): Promise<boolean> => {
            let func: any;
            if (console_handlers.has(command) && (func = console_handlers.get(command))) {
                func.handler(args);
                return true;
            }
            console.log(`Unknown command: ${command}`);
            return false;
        },
        _helpCommand: () => {
            let msg = "§3Help list:";
            let cmd:any = null;
            let keys = console_handlers.keys();
            while ((cmd = keys.next().value)){
                msg += `\n  §f${cmd}§r - ${console_handlers.get(cmd)?.description}`;
            }
            console.log(msg);
        }
    },
    init: () => {
        main.init();
        console.log("Inited");
    },
};

export {handler, Parametrs};