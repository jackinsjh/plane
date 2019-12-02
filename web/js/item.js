function getItem(isActive) {
    var geometry = new THREE.TorusGeometry(3, 3, 16, 100);  // torus 
    var material = new THREE.MeshBasicMaterial({ color: 0x3A3AFF });
    var torus = new THREE.Mesh(geometry, material);

    if (isActive) {
        // invisbile Cylinder, used to detect when the Kite flies through the Item
        itemDetector = new CANNON.Body({
            shape: new CANNON.Cylinder(1, 1, 0.1, 5),
            material: new CANNON.Material(),
            mass: 0
        });
        itemDetector.collisionResponse = 0;
        itemDetector.position.set(-40, 420, -130);
        world.add(itemDetector);
    } else {
        material.transparent = true;
        material.opacity = 0.3;  // opacity 
    }
    return torus; 
}

/**
 * called when Kite flies through Item
 */
function handleKiteThroughItem() {
    score++;
    score++;
    const worldSize = config.world.worldSize;
    const slices = config.world.slices;
    const meshSlices = config.world.meshSlices;

    // the Item should appear where the semi-transparent Item was
    item.position.copy(nextItem.position);
    item.rotation.y = nextItem.rotation.y;
    itemDetector.position.copy(item.position);
    itemDetector.quaternion.copy(item.quaternion);

    // the semi-transparent Item should be relocated somewhere in the FOV of the Kite
    var nextItemSpacing = new CANNON.Vec3();
    
    nextItemSpacing.x = Math.random() * 90 - 90;
    nextItemSpacing.y = Math.random() * 15 - 15;
    nextItemSpacing.z = -(Math.random() * 360 + 90);
    
    var nextItemPosition = nextItem.position.clone();

    // to avoid the loops from spawning outside the world, an additional factor for quaternion is applied
    var quaternionFactor = (Math.abs(nextItemPosition.x) + Math.abs(nextItemPosition.z)) / worldSize;
    var quat = new CANNON.Quaternion()
    quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), quaternionFactor * Math.PI / 2);
    quat.mult(physicsKite.quaternion, quat);
    
    nextItemSpacing = quat.vmult(nextItemSpacing);

    nextItemPosition.add(nextItemSpacing);

    // to avoid the Item from clipping into the ground, the height data has to be found for the xz-position
    if (Math.abs(nextItemPosition.x) < worldSize / 2 && Math.abs(nextItemPosition.z) < worldSize / 2) {
        const nextItemX = Math.round((worldSize / 2 + nextItemPosition.x) / (slices * meshSlices));
        const nextItemZ = Math.round((worldSize / 2 - nextItemPosition.z) / (slices * meshSlices));

        var heightAtNextItem = heightfieldMatrix[nextItemX][nextItemZ] - 200;

        nextItemPosition.y = Math.max(heightAtNextItem + 35, nextItemPosition.y);
        nextItemPosition.y = Math.min(300, nextItemPosition.y);
    }
    nextItem.position.copy(nextItemPosition);

    // rotating the Item randomly
    var r = Math.random() * 9 + 1
    nextItem.rotation.y = Math.PI / r;
    
    prevItemTime = Date.now();
}

