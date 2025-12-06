import http from 'http';
import readline from "readline";
import fs from 'fs';
import path from 'path';
import url from 'url';
import { handler } from './handler';
import { utils } from './utils';

const port = 3500;
let onStart = () => {
    console.log("§aServer has been started");
}

// DON'T TOUCH ALL AFTER THIS PLS
// НЕ ЛЕЗЬ УБЬЕТ
const server = http.createServer(async (request, response) => {
    try {
        if (request.url) {
            let URL = url.parse(request.url, true);
            if (!URL.pathname || URL.pathname === '/') URL.pathname = '/index';
            if (URL.pathname.startsWith('/')) URL.pathname = URL.pathname.substring(1);
            let filePath = path.join(__dirname, '../public', URL.pathname);
            let contentType = utils.getContentType(filePath);
            if (await handler.doHandle(request, response, { URL, contentType, filePath })) return;
            if (!contentType) { 
                contentType = 'text/html'; 
                filePath += ".html" 
            };

            if (contentType.startsWith('video/')) {
                const range = request.headers.range;
                const videoSize = fs.statSync(filePath).size;
                const CHUNK_SIZE = 10 ** 6; // 1MB
                const start = Number(range ? range.replace(/\D/g, "") : 0);
                const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
                const contentLength = end - start + 1;
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": contentLength,
                    "Content-Type": "video/mp4",
                };
                response.writeHead(206, headers);
                let stream = fs.createReadStream(filePath, { start, end });
                stream.pipe(response);
                return;
            }
            if (!fs.existsSync(filePath) && filePath.endsWith(".html")) {
                console.log("NOT FOUND:", filePath);
                filePath = path.join(__dirname, 'public', 'error404.html');
            }
            utils.debug(URL.query);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    try { response.writeHead(404); response.end("404 Not Found"); console.error(err); } catch (e) { }
                    return;
                }
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(data);
            });
        }
    } catch (err) {
        console.log(err);
    }
});
handler.init();
const _console_funcs = {
    getDate: (seconds: number = Math.floor(Date.now() / 1000)): string => {
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        let hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        hours = hours % 24;
        let f = (num: number): string => `${num < 10 ? '0' : ''}${num}`;
        return `${f(hours)}:${f(minutes)}:${f(seconds)}`;
    },
    fixColor: (msg: string): string => {
        let col: any = utils.char$color;
        for (let c in col) {
            while (msg.includes(c)) msg = msg.replace(c, col[c]);
        }
        return msg + utils.char$color["§r"];
    }
};
const _oldconsole = Object.assign(Object.create(Object.getPrototypeOf(console)), console);
console.log = (message?: any, ...optionalParams: any[]) => {
    if (message && typeof message === 'string') {
        message = `§7[${_console_funcs.getDate()}] ${message}`;
        message = _console_funcs.fixColor(message);
    }
    if (optionalParams && Object.keys(optionalParams).length > 0)
        return _oldconsole.log(message, optionalParams);
    return _oldconsole.log(message);
}
console.error = (message?: any, ...optionalParams: any[]) => {
    if (message && typeof message === 'string') {
        message = `§4[${_console_funcs.getDate()} ERROR] ${message}`;
        message = _console_funcs.fixColor(message);
    }
    if (optionalParams && Object.keys(optionalParams).length > 0)
        return _oldconsole.error(message, optionalParams);
    return _oldconsole.error(message);
}
process.on('uncaughtException', err => {
    console.error(`Uncaught Exception: §c${err.message}`);
    console.log(err);
});
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function console_command() {
    rl.question("", (command: string) => {
        while (command.includes('  ')) command = command.replace('  ', ' ');
        let args: any = command.split(" ");
        command = args.shift().toLowerCase();
        if (command !== '') handler.console.doHandle(command, args);
        console_command();
    });
}
server.listen(port, () => {
    onStart();
    console_command();
});