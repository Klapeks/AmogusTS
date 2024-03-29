let config = {
    killrange: 250,
    speed: 9,
    deadrange: 300,
    taskrange: 200,
    killcooldown: 5, // in sec
    starting_time: {
        apear_main_iteration_time: 25,
        apear_main: 600,
        apear_iteration_time: 25,
        apear: 1000,
        sum: 4000 // in ms
    },
    roles: {
        imposters: 2,
        neutral: 1,
        neutral_chance: 0.4,
        vanisher: {
            vanish_time: 500,
            vanish_opacity: 0.3
        }
    }
}

export {config};