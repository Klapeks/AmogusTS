import { Game } from "../../engine/Game";
import { Joystick } from "../../engine/Joystick";
import { Light } from "../../engine/Light";
import { LinkedLocation, Location } from "../../engine/Location";
import { Sprite } from "../../engine/Sprite";
import { TextTexture, Texture } from "../../engine/Texture";
import { Character } from "../characters/Character";
import { Color, HexColor } from "../characters/CharFuncs";
import { SelectedCharacter } from "../characters/ExtraCharacters";
import { MainCharacter } from "../characters/MainCharacter";
import { config } from "../config";
import { textures } from "../textures";
import { gamelogic } from "./gamelogic";
import { Vents, vent_logic } from "./items/vents";
import { killanimation_logic } from "./kill/ka_logic";
import { logic_map } from "./maps/maplogic";
import { voting } from "./meeting/voting";

let Characters: {
    main: MainCharacter,
    another: Array<Character>
} = {main:null, another:new Array()};

let selection: SelectedCharacter;

let cooldownVladDown = false;

let logic_character = {
    update() {
        if (voting.isVoting) return;
        if (killanimation_logic.isAnimationPlaying) return;
        if (Characters.main.ventilation?.directions) {
            if (cooldownVladDown) return;
            let ventto: Vents = null;
            if (Game.hasKey('keyw')) ventto = vent_logic.getMinVentByCharacterVent(Characters.main, "up");
            if (Game.hasKey('keya')) ventto = vent_logic.getMinVentByCharacterVent(Characters.main, "left");
            if (Game.hasKey('keys')) ventto = vent_logic.getMinVentByCharacterVent(Characters.main, "down");
            if (Game.hasKey('keyd')) ventto = vent_logic.getMinVentByCharacterVent(Characters.main, "right");
            if (ventto) {
                cooldownVladDown = true;
                setTimeout(() => { cooldownVladDown = false; }, 500);
                Characters.main.jumpVent(ventto);
            }
        } else {
            if (!Joystick.isJoystickOpen()) logic_character.updateMoveCharacter(Characters.main, {
                x: (Game.hasKey('keyd')?1:0) - (Game.hasKey('keya')?1:0),
                y: (Game.hasKey('keys')?1:0) - (Game.hasKey('keyw')?1:0)
            });
        }
        logic_character.updateMoveCharacter(Characters.another[0] as MainCharacter, {
            x: (Game.hasKey('numpad6')?1:0) - (Game.hasKey('numpad4')?1:0),
            y: (Game.hasKey('numpad5')?1:0) - (Game.hasKey('numpad8')?1:0)
        });
        // logic_character.updateMoveCharacter(Characters.another[0] as MainCharacter, {
        //     x: (Game.hasKey('keyj')?1:0) - (Game.hasKey('keyg')?1:0),
        //     y: (Game.hasKey('keyh')?1:0) - (Game.hasKey('keyy')?1:0)
        // });
        logic_character.updateSelect();

        //delete it !!
        // for (let ch of Characters.another) {
        //     if (ch.getLocation().distanceSquared(Characters.main.getLocation()) < 500*500) {
        //         if (ch.getLocation().x < Characters.main.getLocation().x) ch.getSprite().width = Math.abs(ch.getSprite().width)
        //         else ch.getSprite().width = -Math.abs(ch.getSprite().width)
        //     }
        // }
    },
    load() {
        Characters.main = new MainCharacter(0, new Location(189, -806));
        Characters.main.setColor({r:3,g:255,b:220},{r:0,g:172,b:190});
        Characters.main.role = "impostor";
        Characters.main.setNickname("Klapeks");
        // Characters.main.getSprite().width/=2;
        // Characters.main.getSprite().height/=2;
        selection = new SelectedCharacter();
        selection.hidden = true;

        
        Characters.another.push(new MainCharacter(1, new Location(200,-1300)).setColor({r:0,g:0,b:0},{r:0,g:0,b:0}));
        Characters.another.push(new Character(2, new Location(-300,-1550)).setColor({r:0,g:0,b:0},{r:255,g:255,b:255}).setNickname("Skepalk"));
        Characters.another.push(new Character(3, new Location(200,-1800)).setColor({r:255,g:0,b:0},{r:255,g:0,b:0}).setNickname("1234"));
        Characters.another.push(new Character(4, new Location(500,-1800)).setColor({r:255,g:255,b:255},{r:255,g:255,b:255}).setNickname("aaaaaaaaaaaaaaaaaaaaaa"));
        Characters.another.push(new Character(5, new Location(700,-1550)).setColor({r:0,g:255,b:0},{r:0,g:255,b:0}).setNickname("huy"));
        Characters.another.push(new Character(6, new Location(500,-1300)).setColor({r:0,g:0,b:255},{r:0,g:0,b:255}));
        Characters.another.push(new Character(7, new Location(800,-1300)).setColor(HexColor("C51111"),HexColor("7A0838")).setNickname("Vladik"));


        Characters.another.forEach(i => Game.getScene().addDynamicSprite(i.getSprite()));
        Game.getScene().addDynamicSprite(selection.getSprite());
        Game.getScene().addDynamicSprite(Characters.main.getSprite());
        
        Game.getScene().addLight(new Light(
            new LinkedLocation(
                Characters.main.getLocation(), {
                dx: Math.abs(Characters.main.getSprite().width/2),
                dy: Math.abs(Characters.main.getSprite().height/2)
            }), 700)
        );


        Joystick.onJoystick = (x, y) => {
            if (voting.isVoting) return;
            if (Math.abs(x) < 20 && Math.abs(y) < 20) [x, y] = [0, 0];
            logic_character.updateMoveCharacter(Characters.main, {x:x/100, y:y/100});
        }

    },
    updateSelect() {
        let character = logic_character.trySelectCharacter();
        if (character) logic_character.selectCharacter(character);
        else logic_character.unSelectCharacter();
    },
    trySelectCharacter(onlyAlive: boolean = true) {
        let character: Character = undefined;
        for (let ch of Characters.another) {
            if (!character || Characters.main.distanceSquared(ch) < Characters.main.distanceSquared(character)) {
                if (!onlyAlive) character = ch;
                else if (!ch.hidden) character = ch;
            }
        }
        if (character && Characters.main.getLocation().distanceSquared(character.getLocation()) < config.killrange*config.killrange) return character;
        return undefined;
    },
    selectCharacter(character: Character) {
        // selection.getSprite().l
        selection.getSprite().setLocation(character.getLocation().x, character.getLocation().y);
        selection.getSprite().setSize(character.getSprite().width,character.getSprite().height);
        selection.walkAnimationFrame = character.walkAnimationFrame;
        selection.getSprite().width = character.getSprite().width;
        // selection.changeState(character.state);
        selection.hidden = false;
    },
    unSelectCharacter() {
        selection.hidden = true;
    },
    isSelectedCharacter(){
        return !selection.getSprite().hidden;
    },
    isWall(iteration: number, addx:number, addy:number) {
        // return false;
        _colorofmap = logic_map.getMap().getHitboxColor({
            x: _charloc.x + _hitbox[iteration] + addx,
            y: _charloc.y + _hitbox[iteration+1] + addy
        });
        return _colorofmap && _colorofmap[3] > 250;
    },
    updateMoveCharacter(character: MainCharacter, direction: {x: number, y:number}) {
        if (character.isVentedAnim) return;
        if (!gamelogic.eventListeners.onmove.check(character)) return;
        // if (character.state === "vent") return;
        const deltaSpeed = config.speed * Game.deltaTime*58.8;
        direction.x *= deltaSpeed;
        direction.y *= deltaSpeed;
        // if (game.hasKey('keyr')) console.log(game.getScene().getSprites());
        // if (Game.hasKey('shiftleft')) { direction.x/=2; direction.y/=2; }
        if (direction.x!=0 || direction.y!=0) {
            if ((direction.x < 0 && character.getSprite().width > 0) || (direction.x > 0 && character.getSprite().width < 0)) {
                character.getSprite().width = -character.getSprite().width;
            }
            _hitbox = character.getHitboxPoints();
            _charloc = character.getLocation();
            
            for (let i = 0; i < _hitbox.length; i+=2) {
                if (direction.y===0) {
                    if (logic_character.isWall(i, direction.x, 0)) {
                        if (logic_character.isWall(i, direction.x, deltaSpeed*1.25)) {
                            if (logic_character.isWall(i, direction.x, -deltaSpeed*1.25)) {
                                direction.x = 0;
                            } else {
                                direction.y = -deltaSpeed*1.25;
                            }
                        } else {
                            direction.y = deltaSpeed*1.25;
                        }
                    }
                }
                else if (direction.x===0) {
                    if (logic_character.isWall(i, 0, direction.y)) {
                        if (logic_character.isWall(i, deltaSpeed*1.25, direction.y)) {
                            if (logic_character.isWall(i, -deltaSpeed*1.25, direction.y)) {
                                direction.y = 0;
                            } else {
                                direction.x = -deltaSpeed*1.25;
                            }
                        } else {
                            direction.x = deltaSpeed*1.25;
                        }
                    }
                } else if (logic_character.isWall(i, direction.x, direction.y)) {
                    if (logic_character.isWall(i, direction.x, 0)) direction.x = 0;
                    if (logic_character.isWall(i, 0, direction.y)) direction.y = 0;
                }
            }

            if (direction.x!=0 || direction.y!=0) {
                character.getLocation().add(direction.x, direction.y);
                character.playWalkAnimation(23.5*Game.deltaTime);
            } else {
                character.idle();
            }
        } else {
            character.idle();
            // impostor.setTexture(textures.amogus.idle);
        }
    },
}
let _hitbox: number[];
let _charloc: Location;
let _colorofmap: number[];

export {logic_character, Characters}