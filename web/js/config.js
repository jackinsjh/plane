
// Enum class for controller types
const controllerType = {
    keyboard: 1,
};


// Enum class for game state
const gameStates = {
    mainMenu: 1,
    playing: 2,
    paused: 3
};
/*
gameStates.mainMenu
gameStates.playing
gameStates.paused
*/



// Config object

let config = {

    // Plane
    plane: {
        // start position
        startPosX: 0,       
        startPosY: 100,       
        startPosZ: 800,   

        aileronPower: 100,      
        elevatorPower: 100, 
        rudderPower: 50,     
        throttlePower: 500000,    // 500000

        linearDamping: 0.95,   // 0.95 
        angularDamping: 0,   // 0 

        // Keyboard controls
        acceleration: 0.5, // How much holding down W does to forward-acceleration- 
        maxAileronPosition: 0.8, // Aileron position limit for the keyboard

        aileronSpeed: 0.05, // How fast the aileron moves to the limit per tick if the key is held down 
         
        maxElevatorPosition: 0.8, //  0.8  
        elevatorSpeed: 0.05, // 
        maxRudderPosition: 0.8, // rudder(q,e)
        rudderSpeed: 0.05 // rotate the body left and right horizontally.
    },

    // Controls
    controls: {

        type: controllerType.keyboard,

        // Keyboard control keys
        keyboard: {
            aileronLeft: "left",
            aileronRight: "right",
            elevatorUp: "up",
            elevatorDown: "down",
            rudderLeft: "q",
            rudderRight: "e",
            accelerate: "w",
            decelerate: "s",
            reset: "space"
        },
    },

    // World  TODO: doesn't work with some values. fix or value guide
    world: {
        worldSize: 2000, // Side length of the square world  
        meshSlices: 10,                  
        slices: 1, //  Coloring vertices by height 
        viewDistance: 1800,   
        treeAmount: 0.1, // 0=min, 1=max   
        cloudAmount: 7, // (2*cloudAmount)^2 clouds will be created 
        shadows: false,   //  false 
        gravityConstant: -9.82, // -9.82 
        randomSeed: true,    // true 
        seed: 0.8519260220310276  
    },

    // Debug text        
    debug: {
        fps: true,
        time:true, 
        score: true,
        aileronPosition: false,
        elevatorPosition: false,
        rudderPosition: false,
        throttle: false
    }
};



// Information about config variables

// metaconfig

const metaconfig = {
    test: {
        type: "number",
        step: 1   
    },

    plane: {
        startPosX: {
            type: "number",
            step: 1  // 1
        },
        startPosY: {
            type: "number",
            step: 1          // 1
        },
        startPosZ: { 
            type: "number",   
            step: 1         // 1
        },


        aileronPower: {
            type: "number",
            step: 1
        },
        elevatorPower: {
            type: "number",
            step: 1
        },
        rudderPower: {
            type: "number",
            step: 1
        },
        throttlePower: {
            type: "number",
            step: 1000
        },

        linearDamping: {
            type: "number",
            step: 0.01,
            min: 0,
            max: 1
        },
        angularDamping: {
            type: "number",
            step: 0.01,
            min: 0,
            max: 1
        },

        acceleration: {
            type: "number",
            step: 0.01,        // 0.01
            min: 0.01,
            max: 1.00,
        },
        maxAileronPosition: {
            type: "number",
            step: 0.01,
            min: 0.01,
            max: 1.00,
        },
        aileronSpeed: {
            type: "number",
            step: 0.01,
            min: 0.01,
            max: 1.00,
        },
        maxElevatorPosition: {
            type: "number",
            step: 0.01,
            min: 0.01,
            max: 1.00,
        },
        elevatorSpeed: {
            type: "number",
            step: 0.01,
            min: 0.01,
            max: 1.00,
        },
        maxRudderPosition: {
            type: "number",
            step: 0.01,
            min: 0.01,
            max: 1.00,
        },
        rudderSpeed: {
            type: "number",
            step: 0.01,
            min: 0.01,
            max: 1.00,
        }
    },

    controls: {
        type: {
            type: "enum",
            enumObject: controllerType
        },

        keyboard: {
            aileronLeft: {
                type: "text",
            },
            aileronRight: {
                type: "text",
            },
            elevatorUp: {
                type: "text",
            },
            elevatorDown: {
                type: "text",
            },
            rudderLeft: {
                type: "text",
            },
            rudderRight: {
                type: "text",
            },
            accelerate: {
                type: "text",
            },
            decelerate: {
                type: "text",
            },
            reset: {
                type: "text",
            }
        },
    },

    world: {
        worldSize: {
            type: "number",
            step: 1
        },
        meshSlices: {
            type: "number",
            step: 1
        },
        slices: {
            type: "number",
            step: 1
        },
        viewDistance: {
            type: "number",
            step: 1
        },
        treeAmount: {
            type: "number",
            step: 0.01,
            min: 0,
            max: 1
        },
        cloudAmount: {
            type: "number",
            step: 1
        },
        shadows: {
            type: "boolean"
        },
        gravityConstant: {
            type: "number",
            step: 0.01
        },
        randomSeed: {
            type: "boolean"
        },
        seed: {
            type: "text"
        }
    },

    // Debug text
    debug: {
        time : {
            type:"boolean"
        },
        fps: {
            type: "boolean"
        },
        score: {
            type: "boolean"
        },
        aileronPosition: {
            type: "boolean"
        },
        elevatorPosition: {
            type: "boolean"
        },
        rudderPosition: {
            type: "boolean"
        },
        throttle: {
            type: "boolean"
        }
    }

};


// . . . END 