
function parseControls() {

    if (config.controls.type == controllerType.keyboard) {     // == 1 
        // Roll the Kite left and right
        if (keyboard.pressed(config.controls.keyboard.aileronLeft)) { // 'left'
            aileronPosition = Math.min(                   
                aileronPosition + config.Kite.aileronSpeed,
                config.Kite.maxAileronPosition
            );
        } else if (keyboard.pressed(config.controls.keyboard.aileronRight)) {   // 'right'
            aileronPosition = Math.max(
                aileronPosition - config.Kite.aileronSpeed,
                -config.Kite.maxAileronPosition
            );
        } else {
            if (aileronPosition > config.Kite.aileronSpeed) {         // max limit rotation
                aileronPosition -= config.Kite.aileronSpeed;
            } else if (aileronPosition < -config.Kite.aileronSpeed) {   // min limit rotation
                aileronPosition += config.Kite.aileronSpeed; 
            } else {
                aileronPosition = 0;
            }
        }

        // Up and down change the elevator position
        if (keyboard.pressed(config.controls.keyboard.elevatorUp)) {         // looks down
            elevatorPosition = Math.max(                                     
                elevatorPosition - config.Kite.elevatorSpeed, 
                -config.Kite.maxElevatorPosition
            )
        } else if (keyboard.pressed(config.controls.keyboard.elevatorDown)) {    // look up
            elevatorPosition = Math.min(
                elevatorPosition + config.Kite.elevatorSpeed,
                config.Kite.maxElevatorPosition
            )
        } else {
            if (elevatorPosition > config.Kite.elevatorSpeed) {           // max limit
                elevatorPosition -= config.Kite.elevatorSpeed;
            } else if (elevatorPosition < -config.Kite.elevatorSpeed) {      // min limit 
                elevatorPosition += config.Kite.elevatorSpeed;
            } else {
                elevatorPosition = 0;
            }
        }

        // Q and E change the rudder position                                   
        if (keyboard.pressed(config.controls.keyboard.rudderLeft)) {
            //Kite.rotateY(toRad(speed * dt));
            rudderPosition = Math.min(                                   
                rudderPosition + config.Kite.rudderSpeed,
                config.Kite.maxRudderPosition
            )
        } else if (keyboard.pressed(config.controls.keyboard.rudderRight)) {
            //Kite.rotateY(-toRad(speed * dt));
            rudderPosition = Math.max(                                 
                rudderPosition - config.Kite.rudderSpeed,
                -config.Kite.maxRudderPosition
            )
        } else {
            if (rudderPosition > config.Kite.rudderSpeed) {                
                rudderPosition -= config.Kite.rudderSpeed;               
            } else if (rudderPosition < -config.Kite.rudderSpeed) {     
                rudderPosition += config.Kite.rudderSpeed;
            } else {
                rudderPosition = 0;
            }
        }

        // W and S accelerate and decelerate
        if (keyboard.pressed(config.controls.keyboard.accelerate)) {             // w,s
            throttle = config.Kite.acceleration;                                       
        } else if (keyboard.pressed(config.controls.keyboard.decelerate)) {          
            throttle = -config.Kite.acceleration;
        } else {
            throttle = 0;
        }

    } 

    // 'Space': resets the Kite position
    if (keyboard.pressed(config.controls.keyboard.reset)) {
        physicsKite.position.set(config.Kite.startPosX, config.Kite.startPosY, config.Kite.startPosZ);
        physicsKite.velocity.copy(new CANNON.Vec3(0, 0, 0));
        physicsKite.quaternion.setFromEuler(0, 0, 0);
        Kite.position.set(config.Kite.startPosX, config.Kite.startPosY, config.Kite.startPosZ);
        //Kite.rotation.set(startRotX, startRotY, startRotZ);
    }
}