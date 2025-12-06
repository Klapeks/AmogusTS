

class Location {
    private _x: number;
    private _y: number;
    private _yaw: number;
    constructor(x: number, y: number, yaw: number = 0) {
        this._x = x;
        this._y = y;
        this._yaw = yaw;
    }
    set(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    get x(): number { return this._x; }
    get y(): number { return this._y; }
    set x(x: number) { this._x = x; }
    set y(y: number) { this._y = y; }
    get yaw(): number { return this._yaw; }
    set yaw(yaw: number) { this._yaw = yaw; }
    add(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }
    rotate(dyaw: number) {
        this.yaw += dyaw;
        if (this.yaw < 0) this.yaw = 360 - this.yaw;
        this.yaw %= 360;
    }
    distanceSquared(loc: Location){
        return Math.pow(loc.x-this.x, 2) + Math.pow(loc.y-this.y, 2);
    }
    clone(): Location {
        return new Location(this.x, this.y, this.yaw);
    }

    static isHitboxLocation(object: any): object is HitboxLocation {
        return 'location' in object && 'size' in object;
    }
    static isInHitbox(x: number, y: number, hitbox: Hitbox | HitboxLocation): boolean {
        if (this.isHitboxLocation(hitbox)) {
             return hitbox.location.x <= x && hitbox.location.y <= y 
                && x <= hitbox.location.x + hitbox.size.width
                && y <= hitbox.location.y + hitbox.size.height;
        }
        return hitbox.x <= x && hitbox.y <= y
            && x <= hitbox.dx + (hitbox.fromto ? 0 : hitbox.x)
            && y <= hitbox.dy + (hitbox.fromto ? 0 : hitbox.y)
    }
    static generateHitbox_Box(centerX: number, centerY: number, range: number): Hitbox {
        return {
            x: centerX - range/2,
            y: centerY - range/2,
            dx: range,
            dy: range
        }
    }
}

class LinkedLocation extends Location {
    private _location: Location;
    private _add: {dx: number, dy: number};
    constructor(location: Location, add: {dx: number, dy: number} = {dx:0,dy:0}) {
        super(null,null,null);
        this._location = location;
        this._add = add;
    }
    get x(): number { return this._location.x+this._add.dx; }
    get y(): number { return this._location.y+this._add.dy; }
    set x(x: number) { this._location.x = x; }
    set y(y: number) { this._location.y = y; }
    get yaw(): number { return this._location.yaw; }
    set yaw(yaw: number) { this._location.yaw = yaw; }
}
// type RoundHitbox = {x: number, y: number, rw: number, rh: number}
type BiLocation = { x: number, y: number, width: number, height: number }
type Hitbox = { x: number, y: number, dx: number, dy: number, fromto?: boolean}
type HitboxLocation = { location: Location, size: Size}
type Point = { x: number, y: number }
type Size = {width: number, height: number};
// type BiLocationFT = { fromX: number, fromY: number, toX: number, toY: number }
// type BiLocation = BiLocationFT | BiLocationWH

// let LocationFuncs = {
//     convertBiLocationFT(biloc: BiLocationFT): BiLocationWH {
//         return {x: biloc.fromX, y: biloc.fromY, width: biloc.toX-biloc.fromX, height: biloc.toY-biloc.fromY};
//     }
//     convertBiLocation(biloc: BiLocation): BiLocationWH {
//         if ()
//         return {x: biloc.fromX, y: biloc.fromY, width: biloc.toX-biloc.fromX, height: biloc.toY-biloc.fromY};
//     }
// }

export { Location, BiLocation, Size, Point, Hitbox, HitboxLocation, LinkedLocation };