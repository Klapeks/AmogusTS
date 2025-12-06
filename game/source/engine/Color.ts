
type Color = {r:number, g:number, b:number};
// type AlphaColor = Color & {alpha?:number};


let HexColor = (hex: string): Color => {
    if (hex.charAt(0) == '#') hex = hex.substr(1);
    return {
        r: parseInt(`${hex.charAt(0)}${hex.charAt(1)}`, 16),
        g: parseInt(`${hex.charAt(2)}${hex.charAt(3)}`, 16),
        b: parseInt(`${hex.charAt(4)}${hex.charAt(5)}`, 16)
    };
}
let RgbColor = (r: number, g: number, b: number): Color => {
    return {r,g,b};
}

export {Color, HexColor, RgbColor}