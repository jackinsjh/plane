/*
GGC 의 노트 필기 
*/


// Enum class for controller types
const controllerType = {
    keyboard: 1,
    gamepad: 2
};
/*

설명하러왓서오
controllerType.keyboard는 1을 의미하고
controllerType.gamepad는 2를 의미함 

*/


// Enum class for game state
const gameStates = {
    mainMenu: 1,
    playing: 2,
    paused: 3
};
/*

설명하러왓서오
gameStates.mainMenu는 1을 의미하고
gameStates.playing는 2을 의미하고
gameStates.paused는 3을 의미해오 

*/



// Config object

/*
let과 const의 차이점은 변수의 변경 가능 여부이다.
let은 변수에 변수의 재선언은 불가능하고 재할당이 가능하지만,const는 변수 재선언, 재할당 모두 불가능하다.
*/
let config = {

    // Plane
    plane: {
        startPosX: 0,         // 시작하는 x좌표
        startPosY: 100,       // 시작하는 y좌표
        startPosZ: 800,      // 시작하는 z좌표

        aileronPower: 100,    //이거 값을 낮추면 양옆 방향 조절이 안됨         
        elevatorPower: 100,  // 이거 낮추면 고도 조절이 안됨
        rudderPower: 50,     // 값을 바꿔도 뭐가 변하는지 잘 모르겟음 ㅎㅎ
        throttlePower: 500000,    // 기본값 : 500000 , 이거 낮추면 비행기 거북이됨 

        linearDamping: 0.95,   // 기본값 : 0.95 낮추면 비행기의 질량이 사라짐 엄청 촐랑댐 (저항값을 의미하는 것 같음)
        angularDamping: 0,   // 기본값 : 0 , 이거 올리면 비행기가 시야에서 사라짐 

        // Keyboard controls
        acceleration: 0.5, // How much throttle holding down W does (dynamic for controller with sticks) - 설명 해놓으심
        maxAileronPosition: 0.8, // Aileron position limit for the keyboard (1.0 for controller) - 설명 해놓으심
        aileronSpeed: 0.05, // How fast the aileron moves to the limit per tick if the key is held down - 앙 설명해놓았띠 
        maxElevatorPosition: 0.8, // 기본값 0.8  이거 높이면 컨트롤할때 존나 어지러움 건드리지 않는게 좋을듯 
        elevatorSpeed: 0.05, // 고도 속도값
        maxRudderPosition: 0.8, // rudder(q,e)의 위치관련값 기본값 0.8 값 값을 올리면 q,e로 전환되는거 ㅈㄴ 빨라짐 
        rudderSpeed: 0.05 // 앙 rudder 속도띠  , 기본값 : 0.05 올리면  q,e 작동이 부자연스러워짐 -> 건들지 말 것 
    },

    // Controls 앙 컨트롤띠 
    controls: {
        // which controller type is currently being used (keyboard or gamepad)
        type: controllerType.keyboard,

        // Keyboard control keys    - 앙 설명띠 
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

        // Gamepad control axes       - 앙 기모띠 
        gamepad: {
            aileronAxis: 0,
            elevatorAxis: 1,
            rudderAxis: 4,
            throttleAxis: 2
        }
    },

    // World  TODO: doesn't work with some values. fix or value guide
    world: {
        worldSize: 2000, // Side length of the square world  맵 크기 
        meshSlices: 10,                  // 기본값 10 값 올리면 맵이 병신됨
        slices: 1, // 기본값 1 , 값을 올리면 Coloring vertices by height 부분에서 멈춰버림
        viewDistance: 1800,   // 기본값 1800 , 값 올리면 더 넓은 화면 , 난 full hd에서 즐긴다!
        treeAmount: 0.1, // 0=min, 1=max     - 설명 완료 
        cloudAmount: 7, // (2*cloudAmount)^2 clouds will be created 
        shadows: false,   // 기본값 : false , 절대 바꾸지 말것 바꾸면 렉 지리게 걸리면서 맵 터짐
        gravityConstant: -9.82, // 기본값 :-9.82 , 중력값인데 올리면 비행기가 우주로 올라감 
        randomSeed: true,    // 기본값 : true (랜덤 관련 값)
        seed: 0.8519260220310276  // 랜덤 관련 값 
    },

    // Debug text        디버그 관련 수치 
    debug: {
        fps: true,
        time:true, //gc add
        score: true,
        aileronPosition: false,
        elevatorPosition: false,
        rudderPosition: false,
        throttle: false
    }
};



// Information about config variables

// metaconfig라는 상수 설정하는 곳 

const metaconfig = {
    test: {
        type: "number",
        step: 1   // 기본값 1 바꾸면 맵이 사라짐
    },

    plane: {
        startPosX: {
            type: "number",
            step: 1  // 기본값 1, 바꿔도 큰 변화는 없음 
        },
        startPosY: {
            type: "number",
            step: 1          // 기본값 1, 바꾸면 위치 이상한대로감  
        },
        startPosZ: { 
            type: "number",   
            step: 1         // 기본값 1 , 이하동문 
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
            step: 0.01,        // 기본값 0.01인데 값올려도 큰 변화 못 느끼겟음
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

        gamepad: {
            aileronAxis: {
                type: "number",
                step: 1
            },
            elevatorAxis: {
                type: "number",
                step: 1
            },
            rudderAxis: {
                type: "number",
                step: 1
            },
            throttleAxis: {
                type: "number",
                step: 1
            }
        }
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