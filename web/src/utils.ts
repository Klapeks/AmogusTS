import path from "path";

class ArrayMap<K, V> {
    protected hm = new Map<K, Array<V>>();
    constructor() { }

    public addIn(key: K, val: V) {
        let arval: Array<V> = this.get(key);
        if (!arval.includes(val)) {
            arval.push(val);
            this.hm.set(key, arval);
        }
    }
    public get(key: K): Array<V> {
        return this.hm.has(key) ? (this.hm.get(key) || new Array<V>()) : new Array<V>();
    }
    public remove(key: K, val: V): boolean {
        let arval: Array<V> = this.get(key);
        let i = arval.indexOf(val);
        if (i < 0) return false;
        let b = arval.splice(i, 1);
        if (Object.keys(arval).length === 0) {
            this.hm.delete(key);
            return true;
        }
        this.hm.set(key, arval);
        return true;
    }
    public hasKey(key: K): boolean {
        return this.hm.has(key);
    }
    public hasValue(key: K, val: V): boolean {
        return this.get(key).includes(val);
    }
    public delete(key: K): Array<V> {
        let a = this.get(key);
        this.hm.delete(key);
        return a;
    }
    public clear(): void {
        this.hm.clear();
    }
    public keySize(): number {
        return this.hm.size;
    }
    public valueSize(key: K): number {
        return Object.keys(this.get(key)).length;
    }
    public isEmpty() {
        return this.keySize() == 0;
    }
    public _original(): Map<K, Array<V>> {
        return this.hm;
    }
}

let debug = false;
let utils = {
    isDebug: debug,
    debug: (text: any): void => {
        if (!debug) return;
        if (typeof text === 'string' || typeof text === 'number' || typeof text === 'boolean'){
            console.debug(`\x1b[33m[DEBUG] ${text}`);
        } else {
            console.debug(text);
        }
    },
    getContentType: (filePath: string): string => {
        const ext = path.extname(filePath);
        if (!ext) return '';
        else switch (ext) {
            case '.css': return 'text/css';
            case '.js': return 'text/javascript';
            case '.mp4': return 'video/mp4';
            case '.png': return 'image/png';
            default: return 'text/html';
        }
    },
    getPath: (url: string | undefined): string => {
        if (!url) url = '/';
        if (url === '/') url = 'index.html';
        return path.join(path.dirname(__dirname), 'public', url);
    },
    colors: {
        reset: "\x1b[0m",
        _bright:  "\x1b[1m",
        _dim:  "\x1b[2m",
        _underscore: "\x1b[4m",
        _blink: "\x1b[5m",
        _reverse: "\x1b[7m",
        _hidden: "\x1b[8m",

        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",

        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m",
    },
    char$color: {'§0':'', '§1':'', '§2':'', '§3':'', '§4':'', '§5':'', '§6':'', '§7':'', '§8':'', '§9':'',
                 '§a':'', '§b':'', '§c':'', '§d':'', '§e':'', '§f':'', '§o':'', '§n':'', '§l':'', '§r':''}
}
utils.char$color = {
    '§0': utils.colors.black,   // black
    '§1': utils.colors.blue,    // dark blue
    '§2': utils.colors.green,   // dark green
    '§3': utils.colors.cyan,    // cyan
    '§4': utils.colors.red,     // red
    '§5': utils.colors.magenta, // magenta
    '§6': utils.colors.yellow,  // orange
    '§7': utils.colors.white,   // light gray 
    '§8': utils.colors.black + utils.colors._bright,   // dark gray
    '§9': utils.colors.blue + utils.colors._bright,    // light blue
    '§a': utils.colors.green + utils.colors._bright,   // light green
    '§b': utils.colors.blue + utils.colors._bright,    // light cyan
    '§c': utils.colors.red + utils.colors._bright,     // pink
    '§d': utils.colors.magenta + utils.colors._bright, // light magenta
    '§e': utils.colors.yellow + utils.colors._bright,  // light yellow 
    '§f': utils.colors.white + utils.colors._bright,   // white

    // '§m': utils.colors.blue,
    '§o': utils.colors._bright,
    '§n': utils.colors._underscore,
    '§l': utils.colors._reverse,
    '§r': utils.colors.reset,
}
export { utils, ArrayMap }