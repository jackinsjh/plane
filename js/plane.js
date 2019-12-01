var throttle = 0;
var score = 0;


var aileronPosition = 0; // used to rotate the plane (when rolling, change this to roll the plane left and right)
var elevatorPosition = 0;
var rudderPosition = 0;

function addPlane(camera, callback) {

    var colladaLoader = new THREE.ColladaLoader();
    colladaLoader.crossOrigin = "Anonymous";
    colladaLoader.options.convertUpAxis = true;
    colladaLoader.options.upAxis = "Y";

    // My new model: kite 
    // Need "web-security" configured on the classroom's computer or loading this model won't work.
    colladaLoader.load("https://raw.githubusercontent.com/rpt5366/Myproject/master/kite_17.dae", obj => {

        var colladaPlane = obj.scene;
        colladaPlane.name = "Plane";
        colladaPlane.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

        plane = colladaPlane;
        scene.add(plane);
        
        // Camera
        camera.position.set(0, 6, 15);
        // camera.position.set(15, 6, -15); // camera for background shot
        // camera.position.set(15, 15, 2); // camera for screen shot
        camera.lookAt(colladaPlane.position);
        colladaPlane.add(camera);

        // physical representation of the plane for cannonjs
        var cannonBody = new CANNON.Body({
            mass: 1000, // kg
            position: new CANNON.Vec3(0, 0, -0.5),
            shape: new CANNON.Box(new CANNON.Vec3(1, 1, 7)),
            material: new CANNON.Material({friction: 0.0})
        });
        cannonBody.addShape(new CANNON.Box(new CANNON.Vec3(9.5, 0.25, 1.5)), new CANNON.Vec3(0, -0.2, -1.75));
        cannonBody.addShape(new CANNON.Box(new CANNON.Vec3(3.25, 0.25, 0.9)), new CANNON.Vec3(0, 0.8, 5.75));
        physicsPlane = cannonBody;
        physicsPlane.linearDamping = 0.81;
        physicsPlane.angularDamping = 0.0;

        // setting the cannonjs plane position
        // the threejs plane's position will be set equal to this in the draw() function
        physicsPlane.position.set(config.plane.startPosX, config.plane.startPosY, config.plane.startPosZ);
        physicsPlane.quaternion.copy(plane.quaternion);

        world.addBody(physicsPlane);

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
function movePlane(dt) {
    var accelerationImpulse = new CANNON.Vec3(0, 0, -throttle * config.plane.throttlePower * dt);
    accelerationImpulse = physicsPlane.quaternion.vmult(accelerationImpulse);

    if (physicsPlane.position.y < 0) {
        physicsPlane.position.y = 0
    }

    var planeCenter = new CANNON.Vec3(
        physicsPlane.position.x,
        physicsPlane.position.y,
        physicsPlane.position.z
    );
    physicsPlane.applyImpulse(accelerationImpulse, planeCenter);

    var directionVector = new CANNON.Vec3(
        elevatorPosition * config.plane.elevatorPower * dt,
        rudderPosition * config.plane.rudderPower * dt,
        aileronPosition * config.plane.aileronPower * dt
    );
    directionVector = physicsPlane.quaternion.vmult(directionVector);

    physicsPlane.angularVelocity.set(
        directionVector.x, directionVector.y, directionVector.z
    );

    physicsPlane.linearDamping = config.plane.linearDamping;
    physicsPlane.angularDamping = config.plane.angularDamping;
}
