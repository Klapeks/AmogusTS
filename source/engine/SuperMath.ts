
let super_cos: any = {}
let super_sin: any = {}
let super_pint: any = {}

let SuperMath = {
    clearMath() {
        super_cos = {};
        super_sin = {};
        super_pint = {};
    },
    PI_int(multiplier: number){
        const t = `${multiplier}`;
        if (!super_pint[t]){
            super_pint[t] = Math.round(Math.PI*multiplier);
        }
        return super_pint[t];
    },
    cos(degr: number, multiplier: number){
        // return Math.cos(degr/multiplier);
        const t = `${degr}_${multiplier}`;
        if (!super_cos[t]){
            super_cos[t] = Math.cos(degr/multiplier);
        }
        return super_cos[t];
    },
    sin(degr: number, multiplier: number){
        // return Math.sin(degr/multiplier);
        const t = `${degr}_${multiplier}`;
        if (!super_sin[t]){
            super_sin[t] = Math.sin(degr/multiplier);
        }
        return super_sin[t];
    },
}

export {SuperMath}