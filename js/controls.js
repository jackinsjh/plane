
/*

GCC Note

*/


function parseControls() {

    if (config.controls.type == controllerType.keyboard) {     // == 1 
        // Left and right change the aileron position
        if (keyboard.pressed(config.controls.keyboard.aileronLeft)) { // 'q'
            aileronPosition = Math.min(                
                aileronPosition + config.plane.aileronSpeed,
                config.plane.maxAileronPosition
            );
        } else if (keyboard.pressed(config.controls.keyboard.aileronRight)) {       // 수학을 활용해서 오른쪽 위치 조정함 , 바꾸면 ㅈ됨 
            aileronPosition = Math.max(
                aileronPosition - config.plane.aileronSpeed,
                -config.plane.maxAileronPosition
            );
        } else {
            if (aileronPosition > config.plane.aileronSpeed) {         // 특정 속도 초과하지 못하게 만듬 
                aileronPosition -= config.plane.aileronSpeed;
            } else if (aileronPosition < -config.plane.aileronSpeed) {   // 그 전까진 속도 올라간드아아아
                aileronPosition += config.plane.aileronSpeed;
            } else {
                aileronPosition = 0;
            }
        }

        // Up and down change the elevator position
        if (keyboard.pressed(config.controls.keyboard.elevatorUp)) {         // 고도 
            elevatorPosition = Math.max(                                     // 수학을 활용해서 고도 위치 조정함 , 바꾸면 ㅈ됨 
                elevatorPosition - config.plane.elevatorSpeed, 
                -config.plane.maxElevatorPosition
            )
        } else if (keyboard.pressed(config.controls.keyboard.elevatorDown)) {       // 수학을 활용해서 고도 위치 조정함 , 바꾸면 ㅈ됨 
            elevatorPosition = Math.min(
                elevatorPosition + config.plane.elevatorSpeed,
                config.plane.maxElevatorPosition
            )
        } else {
            if (elevatorPosition > config.plane.elevatorSpeed) {           // 고도 속도가 일정 이상 넘지 않게 만듬
                elevatorPosition -= config.plane.elevatorSpeed;
            } else if (elevatorPosition < -config.plane.elevatorSpeed) {      // 그 전까진 고도 속도 올라간드아 
                elevatorPosition += config.plane.elevatorSpeed;
            } else {
                elevatorPosition = 0;
            }
        }

        // Q and E change the rudder position                                   // 홀리 쉿 rudder은 q와 e키 관련 설정을 조절하는거임 
        if (keyboard.pressed(config.controls.keyboard.rudderLeft)) {
            //plane.rotateY(toRad(speed * dt));
            rudderPosition = Math.min(                                   // 수학을 활용해서 rudder 바꾸는 것이야 건드리지말것
                rudderPosition + config.plane.rudderSpeed,
                config.plane.maxRudderPosition
            )
        } else if (keyboard.pressed(config.controls.keyboard.rudderRight)) {
            //plane.rotateY(-toRad(speed * dt));
            rudderPosition = Math.max(                                  // 수학을 활용해서 rudder 바꾸는 것이야 건드리지말것
                rudderPosition - config.plane.rudderSpeed,
                -config.plane.maxRudderPosition
            )
        } else {
            if (rudderPosition > config.plane.rudderSpeed) {               // q랑 e를 통한 rudder 속도 조절하는 것이야     
                rudderPosition -= config.plane.rudderSpeed;                // 특정속도 못넘어가게 만듬
            } else if (rudderPosition < -config.plane.rudderSpeed) {       // 그 전까진 속도 올라 간드아 
                rudderPosition += config.plane.rudderSpeed;
            } else {
                rudderPosition = 0;
            }
        }

        // W and S accelerate and decelerate
        if (keyboard.pressed(config.controls.keyboard.accelerate)) {             // w랑 s를 통한 속도 조절 파트 
            throttle = config.plane.acceleration;                                       
        } else if (keyboard.pressed(config.controls.keyboard.decelerate)) {          
            throttle = -config.plane.acceleration;
        } else {
            throttle = 0;
        }

    } 
    // else if (config.controls.type == controllerType.gamepad) {       // 게임패드 관련 사항 우리는 알 필요 없다 



    //     var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    //     //console.log(gamepads);

    //     if (!gamepads || !gamepads[0]) {
    //         alert("No gamepad found! Switching to keyboard mode.");
    //         config.controls.type = controllerType.keyboard;
    //     } else {
    //         let gp = gamepads[0];

    //         throttle = gp.axes[config.controls.gamepad.throttleAxis];
    //         aileronPosition = -gp.axes[config.controls.gamepad.aileronAxis];
    //         elevatorPosition = -gp.axes[config.controls.gamepad.elevatorAxis];
    //         rudderPosition = -gp.axes[config.controls.gamepad.rudderAxis];
    //     }
    // }

    // 'Space': resets the plane position
    if (keyboard.pressed(config.controls.keyboard.reset)) {
        physicsPlane.position.set(config.plane.startPosX, config.plane.startPosY, config.plane.startPosZ);
        physicsPlane.velocity.copy(new CANNON.Vec3(0, 0, 0));
        physicsPlane.quaternion.setFromEuler(0, 0, 0);
        plane.position.set(config.plane.startPosX, config.plane.startPosY, config.plane.startPosZ);
        //plane.rotation.set(startRotX, startRotY, startRotZ);
    }
}