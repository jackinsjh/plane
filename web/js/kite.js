var throttle = 0;
var score = 0;


var aileronPosition = 0; // used to rotate the Kite (when rolling, change this to roll the Kite left and right)
var elevatorPosition = 0;
var rudderPosition = 0;

function addKite(camera, callback) {

    var colladaLoader = new THREE.ColladaLoader();
    colladaLoader.crossOrigin = "Anonymous";
    colladaLoader.options.convertUpAxis = true;
    colladaLoader.options.upAxis = "Y";

    // My new model: kite 
    // Need "web-security" configured on the classroom's computer or loading this model won't work.
    colladaLoader.load("https://raw.githubusercontent.com/rpt5366/Myproject/master/kite_17.dae", obj => {

        var colladaKite = obj.scene;
        colladaKite.name = "Kite";
        colladaKite.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

        Kite = colladaKite;
        scene.add(Kite);
        
        // Camera
        camera.position.set(0, 6, 15);
        // camera.position.set(15, 6, -15); // camera for background shot
        // camera.position.set(15, 15, 2); // camera for screen shot
        camera.lookAt(colladaKite.position);
        colladaKite.add(camera);

        // physical representation of the Kite for cannonjs
        var cannonBody = new CANNON.Body({
            mass: 1000, // kg
            position: new CANNON.Vec3(0, 0, -0.5),
            shape: new CANNON.Box(new CANNON.Vec3(1, 1, 7)),
            material: new CANNON.Material({friction: 0.0})
        });
        cannonBody.addShape(new CANNON.Box(new CANNON.Vec3(9.5, 0.25, 1.5)), new CANNON.Vec3(0, -0.2, -1.75));
        cannonBody.addShape(new CANNON.Box(new CANNON.Vec3(3.25, 0.25, 0.9)), new CANNON.Vec3(0, 0.8, 5.75));
        physicsKite = cannonBody;
        physicsKite.linearDamping = 0.81;
        physicsKite.angularDamping = 0.0;

        // setting the cannonjs Kite position
        // the threejs Kite's position will be set equal to this in the draw() function
        physicsKite.position.set(config.Kite.startPosX, config.Kite.startPosY, config.Kite.startPosZ);
        physicsKite.quaternion.copy(Kite.quaternion);

        world.addBody(physicsKite);

		callback();
    });
}

function activateShading(mesh) {
    for (let i = 0; i < mesh.children.length; i++) {
        let child = mesh.children[i];
        if (child.type === "Mesh") {
            child.geometry.verticesNeedUpdate = true;
            child.geometry.computeVertexNormals();
            child.castShadow = true;
            // child.recieveShadow = true;
            // console.log(child);

            if (child.children.length > 0) {
                activateShading(child);
            }
        }
    }
}

// dt : delta amount
function moveKite(dt) {
    var accelerationImpulse = new CANNON.Vec3(0, 0, -throttle * config.Kite.throttlePower * dt);
    accelerationImpulse = physicsKite.quaternion.vmult(accelerationImpulse);

    if (physicsKite.position.y < 0) {
        physicsKite.position.y = 0
    }

    var KiteCenter = new CANNON.Vec3(
        physicsKite.position.x,
        physicsKite.position.y,
        physicsKite.position.z
    );
    physicsKite.applyImpulse(accelerationImpulse, KiteCenter);

    var directionVector = new CANNON.Vec3(
        elevatorPosition * config.Kite.elevatorPower * dt,
        rudderPosition * config.Kite.rudderPower * dt,
        aileronPosition * config.Kite.aileronPower * dt
    );
    directionVector = physicsKite.quaternion.vmult(directionVector);

    physicsKite.angularVelocity.set(
        directionVector.x, directionVector.y, directionVector.z
    );

    physicsKite.linearDamping = config.Kite.linearDamping;
    physicsKite.angularDamping = config.Kite.angularDamping;
}
