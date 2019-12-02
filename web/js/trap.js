function getTrap(isActive) {
    var geometry = new THREE.TorusGeometry(20, 1, 16, 100);
    var material = new THREE.MeshBasicMaterial({ color: 0x323232 });
    var torus = new THREE.Mesh(geometry, material);

    if (isActive) {
        // invisbile Cylinder, used to detect when the Kite flies through the Trap
        trapDetector = new CANNON.Body({                       // TrapDetector
            shape: new CANNON.Cylinder(20, 20, 0.1, 5),
            material: new CANNON.Material(),
            mass: 0
        });
        trapDetector.collisionResponse = 0;
        trapDetector.position.set(-10, 450, -100);
        world.add(trapDetector);
    } else {
        material.transparent = true;
        material.opacity = 0.3;
    }
    return torus; 
}

/**
 * called when Kite flies through Trap
 */
function handleKiteThroughTrap() {
    score--;
    const worldSize = config.world.worldSize;
    const slices = config.world.slices;
    const meshSlices = config.world.meshSlices;

    // the Trap should appear where the semi-transparent Trap was
    trap.position.copy(nextTrap.position);
    trap.rotation.y = nextTrap.rotation.y;
    trapDetector.position.copy(trap.position);
    trapDetector.quaternion.copy(trap.quaternion);

    // the semi-transparent Trap should be relocated somewhere in the FOV of the Kite
    var nextTrapSpacing = new CANNON.Vec3();
    
    nextTrapSpacing.x = Math.random() * 90 - 90;
    nextTrapSpacing.y = Math.random() * 15 - 15;
    nextTrapSpacing.z = -(Math.random() * 360 + 90);
    
    var nextTrapPosition = nextTrap.position.clone();

    // to avoid the loops from spawning outside the world, an additional factor for quaternion is applied
    var quaternionFactor = (Math.abs(nextTrapPosition.x) + Math.abs(nextTrapPosition.z)) / worldSize;
    var quat = new CANNON.Quaternion()
    quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), quaternionFactor * Math.PI / 2);
    quat.mult(physicsKite.quaternion, quat);
    
    nextTrapSpacing = quat.vmult(nextTrapSpacing);

    nextTrapPosition.add(nextTrapSpacing);

    // to avoid the Trap from clipping into the ground, the height data has to be found for the xz-position
    if (Math.abs(nextTrapPosition.x) < worldSize / 2 && Math.abs(nextTrapPosition.z) < worldSize / 2) {
        const nextTrapX = Math.round((worldSize / 2 + nextTrapPosition.x) / (slices * meshSlices));
        const nextTrapZ = Math.round((worldSize / 2 - nextTrapPosition.z) / (slices * meshSlices));

        var heightAtNextTrap = heightfieldMatrix[nextTrapX][nextTrapZ] - 200;

        nextTrapPosition.y = Math.max(heightAtNextTrap + 35, nextTrapPosition.y);
        nextTrapPosition.y = Math.min(300, nextTrapPosition.y);
    }
    nextTrap.position.copy(nextTrapPosition);

    // rotating the Trap randomly
    var r = Math.random() * 9 + 1
    nextTrap.rotation.y = Math.PI / r;
    
    prevTrapTime = Date.now();
}

