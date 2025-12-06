import { Sprite } from "../Sprite";


type SpriteFilter = (value: Sprite, next: Sprite) => number;

class SpriteArray {
    next: SpriteArray;
    sprite: Sprite;
    constructor(sprite?: Sprite) {
        if (sprite) this.sprite = sprite;
    }
    add(sprite: Sprite, filter: SpriteFilter = SpriteArray.PriorityFilter) {
        if (this.sprite===sprite) return this;
        if (!this.sprite){
            this.sprite = sprite;
            return this;
        }
        let f = filter(this.sprite, sprite);
        if (f < 0) {
            [this.sprite, sprite] = [sprite, this.sprite];
            if (!this.next){
                this.next = new SpriteArray(sprite);
                return this;
            }
            let newnext = new SpriteArray(sprite);
            newnext.next = this.next;
            this.next = newnext;
            return this;
        }

        if (!this.next){
            this.next = new SpriteArray(sprite);
            return this.next;
        }
        return this.next.add(sprite, filter);
    }
    remove(sprite: Sprite) {
        if (!this.next) {
            if (this.sprite === sprite)
                this.sprite = null;
            return;
        }
        if (this.sprite !== sprite) {this.next.remove(sprite); return;}
        this.sprite = this.next.sprite;
        this.next = this.next.next;
        return;
    }
    forEach(f: (sprite: Sprite) => void) {
        if (this.sprite) f(this.sprite);
        if (this.next) this.next.forEach(f);
    }

    getFirst(f: (s: Sprite) => boolean): SpriteArray {
        if (!this.sprite) return null;
        if (f(this.sprite)) return this;
        if (this.next) return this.next.getFirst(f);
        return null;
    }

    static PriorityFilter: SpriteFilter = (now: Sprite, next: Sprite) => {
        return next.priority - now.priority;
    }
    static PosFilter: SpriteFilter = (now: Sprite, next: Sprite) => {
        return next.getLocation().y - now.getLocation().y;
    }
}

class TreeSprite {
    right: TreeSprite;
    left: TreeSprite;
    value: Sprite;
    constructor(sprite: Sprite) {
        this.value = sprite;
    }
    add(ts: TreeSprite){
        if (ts.value.getCenter().y < this.value.getCenter().y){
            if (this.left) this.left.add(ts);
            else this.left = ts;
        } else {
            if (this.right) this.right.add(ts);
            else this.right = ts;
        }
    }
    foreach(f: (sprite: Sprite) => void) {
        if (this.left) this.left.foreach(f);
        f(this.value);
        if (this.right) this.right.foreach(f);
    }
}

export {TreeSprite, SpriteArray}