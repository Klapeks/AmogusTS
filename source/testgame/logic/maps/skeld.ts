import { Screen } from "../../../engine/Screen";
import { NullSprite, Sprite } from "../../../engine/Sprite";
import { Texture } from "../../../engine/Texture";
import { logic_map } from "./maplogic";
import { DiverPowerTask } from "../items/tasks/diverpower";
import { Map, MapBuilder } from "./map";
import { Location } from "../../../engine/Location";
import { Game } from "../../../engine/Game";
import { Characters } from "../charslog";
import { Vents } from "../items/vents";
import { EmergencyButton } from "../meeting/emergencybutton";
import { Retexturing } from "../../../engine/utils/Retexturing";

let skeldmap: Map;

let mapsize = 5;


let animItem = {
    adminMap: {
        sprite: NullSprite,
        uppersprite: NullSprite,
        dy: [475, 460],
        animation: 0,
        lerp: 0.1
    },
    secretWall: NullSprite
}

let skeld = {
    load() {
        let builder = new MapBuilder()
            .setTexture(new Texture('maps/skeld/map.png'))
            .setUpperTexture(new Texture('maps/skeld/upper.png'))
            .setHitboxfile('maps/skeld/hitbox.png')
            .setSize({width: Screen.width*mapsize, height: Screen.height*mapsize});

        let f = (x:number, y:number, width:number=64, height:number=64) => {
            return {x, y, width:width*mapsize/2, height:height*mapsize/2};
        };

        builder.addTask(new DiverPowerTask(f(-1503,306,34,22)))

        builder.addVents(
            ...MapBuilder.union(new Vents(f(-1703, 367)), new Vents(f(-1820, -263)), new Vents(f(-2275, 150))),
            ...MapBuilder.union(new Vents(f(1283, -1226)), new Vents(f(930, 749)), new Vents(f(2371, 57))),
            ...MapBuilder.union(new Vents(f(-2855, -1797)), new Vents(f(-3780, -510))),
            ...MapBuilder.union(new Vents(f(-2855, 1520)), new Vents(f(-3780, 170))),
            ...MapBuilder.union(new Vents(f(2380, -1970)), new Vents(f(3820, -638))),
            ...MapBuilder.union(new Vents(f(2380, 1710)), new Vents(f(3820, 50)))
        );

        builder.setEmergencyButton(new EmergencyButton(
            f(230, -1446, 48, 48), {
            x: -116, y: -1657,
            dx: 700, dy: -1078,
            fromto: true
        }));

        skeldmap = builder.build();

        animItem.adminMap.sprite = new Sprite(new Texture('maps/skeld/items/adminmap.png'), new Location(1296, 475))
            .setSize(120*mapsize/2, 64*mapsize/2);
        animItem.adminMap.uppersprite = new Sprite(new Texture('maps/skeld/items/adminmap_upper.png'), new Location(1296, 475))
            .setSize(120*mapsize/2, 64*mapsize/2);
        
        animItem.secretWall = new Sprite(new Texture('maps/skeld/items/thewall.png'), new Location(-2463, -2392))
            .setSize(2463-842, 2392-1639);

        skeldmap.onVisibleChange = (isVisibleNow) => {
            animItem.adminMap.sprite.hidden = !isVisibleNow;
            animItem.secretWall.hidden = !isVisibleNow;
        }

        skeldmap.hidden = false;
        skeldmap.update = skeld.update;
        logic_map.setMap(skeldmap);

        // Game.getScene().addBackSprite();
        Game.getScene().addBackSprite(animItem.adminMap.sprite);
        Game.getScene().LayerUpper.add(animItem.secretWall, animItem.adminMap.uppersprite);

        let darkness_map: Texture = new Texture('maps/skeld/shadows.png',null,()=>{
            Game.getScene().filterImage(darkness_map.getImage(), (imgdata) => {
                const data = imgdata.data;
                // for (let i = 0; i < data.length; i += 4) {
                //     // if (data[i+3]>200){
                //     //     data[i]=data[i+1]=data[i+2]=0;
                //     // }
                //     if (data[i] < 20 && data[i+1] < 20 && data[i+2] < 20){}
                //     else data[i]=data[i+1]=data[i+2]=data[i+3]=0;
                // }
                Game.getScene().setDarknessMap({
                    data: imgdata,
                    location: skeldmap.getLocation(),
                    size: {
                        width: skeldmap.getSprite().width,
                        height: skeldmap.getSprite().height
                    }
                });
                return imgdata
            });
        });
    },
    update() {
        _charcenter = Characters.main.getCenter();
        
        if (_charcenter.x > -2232 && _charcenter.x < -872 && _charcenter.y > -2352 && _charcenter.y < -1757) {
            animItem.secretWall.hidden = true;  
        } else {
            animItem.secretWall.hidden = false;
        }
        animItem.adminMap.sprite.getLocation().y = animItem.adminMap.dy[1] + (animItem.adminMap.dy[0]-animItem.adminMap.dy[1])
                *Math.sin(++animItem.adminMap.animation*animItem.adminMap.lerp/Math.PI);
        animItem.adminMap.uppersprite.getLocation().y = animItem.adminMap.sprite.getLocation().y;

        if (animItem.adminMap.animation>200*20/animItem.adminMap.lerp) animItem.adminMap.animation = 0;
    }
    // mapSprite
}

let _charcenter: {x: number, y:number};

export { skeld };