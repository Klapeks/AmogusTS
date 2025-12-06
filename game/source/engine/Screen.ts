let Screen = {
    width: 1920,
    height: 1080,
    half_width: 960,
    half_height: 540,
    get size() {
        return {width: Screen.width, height: Screen.height}
    },
    get box() {
        return {width: Screen.height, height: Screen.height}
    }
};

export { Screen };