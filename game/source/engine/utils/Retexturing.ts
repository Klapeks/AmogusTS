import { Game } from "../../engine/Game";
import { Texture } from "../../engine/Texture";

let Retexturing = {
    oneColor(image: any, color: {r:number, g:number,b:number}, alpha?:number){
        return Game.getScene().filterImage(image, (imgdata: any) => {
            const data = imgdata.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i+3]<=20) continue;
                data[i] = color.r;
                data[i+1] = color.g;
                data[i+2] = color.b;
                if (alpha) data[i+3] = alpha;
                // data[i] = (r*r/sum*colors.foreground.r + b*b/sum*colors.background.r + g*g/sum*colors.mask.r);
                // data[i+1] = (r*r/sum*colors.foreground.g + b*b/sum*colors.background.g + g*g/sum*colors.mask.g);
                // data[i+2] = (r*r/sum*colors.foreground.b + b*b/sum*colors.background.b + g*g/sum*colors.mask.b);
            }
            return imgdata;
        });
    },
    gray(image: any){
        return Game.getScene().filterImage(image, (imgdata: any) => {
            const data = imgdata.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i+3] == 0) continue;
                // data[i] = data[i+1] = data[i+2] = 0;
                data[i] = data[i+1] = data[i+2] 
                    = Math.round((data[i]+data[i+1]+data[i+2])/3);
            }
            return imgdata;
        });
    }
}

export { Retexturing }