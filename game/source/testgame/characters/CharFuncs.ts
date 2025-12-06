import { Color } from "../../engine/Color";
import { Game } from "../../engine/Game";
import { Size } from "../../engine/Location";
import { SplitingTexture, Texture } from "../../engine/Texture";

type CharacterColor = {mask:Color, foreground: Color, background: Color};
type AmogusTextures = {
    idle: Texture,
    eject: Texture,
    static: Texture,
    walk: SplitingTexture,
    dead: SplitingTexture,
    vent: Array<Texture>,
    meeting: SplitingTexture,
    killanimations: {
        alien: Texture
    }
}

let CharacterFuncs = {
    cloneTexture(textures: Array<Texture>, color: CharacterColor): Array<Texture> {
        let newarr: Array<Texture> = new Array();
        for (let i = 0; i < textures.length; i++){
            newarr.push(CharacterFuncs.cloneFiltering(textures[i], color));
        }
        return newarr;
    },
    cloneFiltering(texture: Texture, colors: CharacterColor): Texture {
        texture = new Texture(texture.getPath());
        texture.setImage(Game.getScene().filterImage(texture.getImage(), (imgdata: any) => {
            const data = imgdata.data;
            let r:number,g:number,b:number;
            for (let i = 0; i < data.length; i += 4) {
                r = data[i]; g = data[i + 1]; b = data[i + 2];
                if (Math.abs(r-g) < 25 && Math.abs(r-b) < 25 && Math.abs(b-g) < 25) continue;
                data[i] = (colors.foreground.r * r +  colors.background.r * b +  colors.mask.r * g)/255;
                data[i+1] = (colors.foreground.g * r +  colors.background.g * b +  colors.mask.g * g)/255;
                data[i+2] = (colors.foreground.b * r +  colors.background.b * b +  colors.mask.b * g)/255;
            }
            return imgdata;
        }));
        return texture;
    },
    cloneFilteringS(st: SplitingTexture, colors: CharacterColor): SplitingTexture {
        return {
            texture: CharacterFuncs.cloneFiltering(st.texture, colors),
            width: st.width,
            height: st.height,
            amount: st.amount,
            amount_per_line: st.amount_per_line
        };
    }
};

export {CharacterFuncs, CharacterColor, AmogusTextures}