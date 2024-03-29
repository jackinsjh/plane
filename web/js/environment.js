function addEnvironment(noisefn) {
    // This is the base class for most objects in three.js
    // and provides a set of properties and methods for manipulating objects in 3D space.
    environment = new THREE.Object3D();

    // parameter: color, intensity
    scene.add(new THREE.AmbientLight(0xfefefe, 0.8));

    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;

    // light : directional light from above the Kite.
    // parameter: color, intensity
    light = new THREE.DirectionalLight(0xfefefe, 0.7);
    light.position.set(0, 550, 0);  // starting position of the light
    light.position.multiplyScalar(1.3);
    light.target = Kite;  // faces the Kite
    light.castShadow = config.world.shadows;

    // // shadow resolution
    // light.shadow.mapSize.width = config.world.viewDistance * 6;
    // light.shadow.mapSize.height = config.world.viewDistance * 6;

    // // shadow camera size (how far away form the Kite shadows are rendered)
    // const d = config.world.viewDistance / 6;
    // light.shadow.camera.left = -d * 1.5;
    // light.shadow.camera.right = d * 1.5;
    // light.shadow.camera.top = d;
    // light.shadow.camera.bottom = -d * 2;
    // light.shadow.camera.far = config.world.viewDistance + 1000;

    // shadowcamera visualization
    // scene.add(new THREE.CameraHelper(light.shadow.camera));

    scene.add(light);

    // Position water first
    var geometry = new THREE.PlaneGeometry(config.world.viewDistance * 2, config.world.viewDistance * 2, 1);
    var material = new THREE.MeshStandardMaterial({color: 0x3490DC, roughness: 0.5});
    water = new THREE.Mesh(geometry, material);
    water.rotation.set(-toRad(90), 0, 0); // to lay it down.

    water.receiveShadow = true;
    geometry.verticesNeedUpdate = true;  // true if the vertices array has been updated
    geometry.computeVertexNormals(); // way of computing vertex normals
    environment.add(water);

    // fog -> like fog, the Kite is painted with the desigated color if the Kite is far.
    // fog params:              color, near, far
    scene.fog = new THREE.Fog(0x64c0ff, 10, config.world.viewDistance * 0.6);
    renderer.setClearColor(scene.fog.color, 1);

    // an array for storing tree positions
    let treePositions = [];
    var material = new THREE.MeshStandardMaterial({
        roughness: 0.83,
        vertexColors: THREE.VertexColors  // color for each vertex
    });

    // heightfieldMatrix where the heights will be saved for the cannonjs heightfield
    heightfieldMatrix = [];
    var matrixRow = [];


    // parameters: width=2000 , height=2000 , widthSegments=200, heightSegments=200
    // This produces a Kite whose vertices are all z=0
    var geometry = new THREE.PlaneGeometry(config.world.worldSize, config.world.worldSize, config.world.worldSize / config.world.meshSlices, config.world.worldSize / config.world.meshSlices);
    const heightScale = config.world.worldSize / 80; // =25 (2000/80)
    let maxHeight = 0;

    updateLoading(35, "Generating terrain height with noise");

    for(let i=geometry.vertices.length-1; i>=(geometry.vertices.length-1-200); i--){
        console.log("Terrain vertices: " + geometry.vertices[i].x + ", " + geometry.vertices[i].y + ", " + geometry.vertices[i].z);
    }
    // Total 40401 vertices in terrain.
    console.log("Terrain vertices length:" + geometry.vertices.length);


    // -1000 <= x <= 1000
    // y = 1000 -> -1000
    // terrain height with 5 layers of perlin noise
    for (let i = 0; i < geometry.vertices.length; i++) {

        let v = geometry.vertices[i];
        // scale down x,y
        let x = v.x * 0.42;
        let y = v.y * 0.42;
        // let x = v.x * 0.22;
        // let y = v.y * 0.32;

        // we add values to z because it is initially zero.
        v.z += noisefn(x * 0.003, y * 0.002) * heightScale + 6;
        v.z += noisefn(x * 0.005, y * 0.005) * (heightScale / 2);
        v.z += noisefn(x * 0.010, y * 0.010) * (heightScale / 4);
        v.z += noisefn(x * 0.03, y * 0.03) * 2;
        v.z += noisefn(x * 0.1, y * 0.1) * 0.7;
        v.z *= 3;

        if(i<=20){
            console.log(i+" first added z value:" + v.z);
        }
        
        // get the original x,y again
        let xpow = Math.pow(v.x, 2);
        let ypow = Math.pow(v.y, 2);
        let rpow = Math.pow(config.world.worldSize / 2, 2); // r^2 where r=l/(2.0) (length/2 of the entrie sqaure)
        let dist_sqr = xpow + ypow; // x^2 + y^2
        
        /* Modifyig Z values of vertices, to make it look like a mountain*/ 

        // lower area outside of island circle
        if (dist_sqr/rpow  > 1 ) {
            v.z = 0;
        } else {
            v.z *= Math.pow(Math.cos((dist_sqr / (rpow * 2)) * Math.PI), 2);
        }

        // make center of island higher
        if (dist_sqr / rpow < 0.5) { // less than PI/2
            v.z += Math.pow(Math.cos((dist_sqr / rpow) * Math.PI), 5) * (heightScale * 4);
        }
        if (dist_sqr / rpow < 0.05) { // even higher 
            v.z += Math.pow(Math.cos((dist_sqr / (rpow / 10)) * Math.PI), 2) * (heightScale * 2);
        }

        // water level
        if (v.z < 0) {
            v.z = 0;
        }

        v.z -= 10;

        // v.z = 100;

        // finding the highest point of terrain (for coloring)
        if (v.z > maxHeight) {
            maxHeight = v.z;
        }

        // definition of === in javascript: comparison without type change
        // adding elements to heightfield
        if (i % config.world.slices === 0) {
            matrixRow.push(200 + v.z);
        }
        if ((i + 1) % (config.world.worldSize / config.world.meshSlices + 1) === 0) {
            if (i % config.world.slices === 0) {
                heightfieldMatrix.push(matrixRow);
            }
            matrixRow = []
        }

        // adding positions for trees
        const rand = Math.random();
        // Approximately 1/2 * 1/10 = 1/20 of entrie terrain vertices are chosen as tree locations
        // because treeAmount == 0.1
        if (i % 2 === 0 && rand < config.world.treeAmount) {
            treePositions.push(v);
        }
    }

    updateLoading(45, "Coloring vertices by height");

    // coloring faces by height
    for (let i = 0; i < geometry.faces.length; i++) {
        let f = geometry.faces[i];
        console.log("terrain face:", geometry.faces[i]);

        for (let j = 0; j < 3; j++) {
            let vertexId;
            if (j < 1) {
                vertexId = f.a;
            } else if (j < 2) {
                vertexId = f.b;
            } else {
                vertexId = f.c;
            }

            // vertexHeight in range 0...1
            let vertexHeight = geometry.vertices[vertexId].z / maxHeight;
            let h = 0;
            let s = 0;
            let l = 100;

            // gradient from yellow -> green -> grey -> white
            if (vertexHeight < 0.1) {
                h = 55 + 25 * ((vertexHeight - 0.01) * 11.111);
                s = 55 - 10 * ((vertexHeight - 0.01) * 11.111);
                l = 75 - 15 * ((vertexHeight - 0.01) * 11.111);
            } else if (vertexHeight < 0.3) {
                h = 80 - 25 * ((vertexHeight - 0.1) * 5);
                s = 45 - 25 * ((vertexHeight - 0.1) * 5);
                l = 60 - 20 * ((vertexHeight - 0.1) * 5);
            } else if (vertexHeight < 0.8) {
                h = 55;
                s = 20 - 20 * ((vertexHeight - 0.3) * 2);
                l = 40 + 60 * ((vertexHeight - 0.3) * 2);
            }

           
            s = Math.round(s);
            l = Math.round(l);
            f.vertexColors[j] = new THREE.Color("hsl(" + h + "," + s + "%," + l + "%)");
        }
    }

    geometry.verticesNeedUpdate = true;  // vertices have been updated
    geometry.computeVertexNormals();

    var terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.set(-toRad(90), 0, 0);
    terrain.name = "Terrain";
    // terrain.castShadow = true;
    terrain.receiveShadow = true;
    environment.add(terrain);

    // physical representation of the terrain using a cannonjs heightfield
    // rotating the heightfieldMatrix is necessary to line it up with the terrain
    
    heightfieldMatrix = rotateMatrix(heightfieldMatrix);
    var hfShape = new CANNON.Heightfield(heightfieldMatrix, {
        elementSize: config.world.slices * config.world.meshSlices
    });

    var hfBody = new CANNON.Body({  // base class for all body types
        mass: 0
    });
    hfBody.addShape(hfShape);
    hfBody.position.set(-(config.world.worldSize / 2), -200, config.world.worldSize / 2);
    hfBody.quaternion.setFromEuler(-(Math.PI / 2), 0, 0);
    world.addBody(hfBody);

    updateLoading(75, "Growing trees");

    // trees
    const treeSize = 40;
    let trees = new THREE.Object3D;

    const treegeometry = new THREE.Geometry();
    // A simple pyramid object
    treegeometry.vertices = [
        new THREE.Vector3(-0.5, -0.5, -0.5), //0
        new THREE.Vector3(-0.5, 0.5, -0.5), // 1
        new THREE.Vector3(0.5, 0.5, -0.5), // 2
        new THREE.Vector3(0.5, -0.5, -0.5), // 3
        new THREE.Vector3(0, 0, 0.5) // 4
    ];
    treegeometry.faces = [
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3),
        new THREE.Face3(1, 0, 4),
        new THREE.Face3(2, 1, 4),
        new THREE.Face3(3, 2, 4),
        new THREE.Face3(0, 3, 4)
    ];
    // Apply scaling
    treegeometry.applyMatrix(new THREE.Matrix4().makeScale(0.3, 0.3, 1));
    treegeometry.verticesNeedUpdate = true;
    treegeometry.computeVertexNormals();
    // const treematerial = new THREE.MeshStandardMaterial({color: 0x337a58, roughness: 0.8, wireframe: true});
    const treematerial = new THREE.MeshStandardMaterial({color: 0x337a58, roughness: 0.8});
    const treemesh = new THREE.Mesh(treegeometry, treematerial);
    treemesh.castShadow = true;
    treemesh.receiveShadow = true;

    // rectangular cube geometry: a long box
    const trunkgeometry = new THREE.BoxGeometry(0.06, 0.06, 0.6);
    const trunkmaterial = new THREE.MeshStandardMaterial({color: 0xff7a58, roughness: 0.8});
    const trunkmesh = new THREE.Mesh(trunkgeometry, trunkmaterial);
    trunkmesh.castShadow = true;
    trunkmesh.receiveShadow = true;
    trunkmesh.position.set(0, 0, -0.8);

    // Unite treemesh and trunkmesh
    const tree = new THREE.Object3D;
    tree.add(treemesh);
    tree.add(trunkmesh);
    // scale tree to an adequate size
    tree.scale.set(treeSize, treeSize, treeSize);

    for (let i = 0; i < treePositions.length; i++) {

        const v = treePositions[i];
        const x = v.x + Math.round(Math.random() * 10);
        const y = v.y + Math.round(Math.random() * 10);
        const z = v.z + 25; 
        const noise = noisefn(x * 0.005, y * 0.005) + noisefn(x * 0.01, y * 0.01);
        const height = v.z / maxHeight;

        // trees by terrain height and perlin noise
        if (0.1 < height && height < 0.5 && noise < 0) {

            // tree density by height
            const toRange = ((height - 0.05) * (2 / 0.45)) - 1; // to range -1...1
            const density = Math.sin(toRange * Math.PI / 2) + Math.random(); // curves + curve strenght
            const rand = Math.random();
            if (rand > Math.abs(density)) {
                const treeinstance = tree.clone();
                treeinstance.position.set(x, y, z);
                treeinstance.rotation.set(toRad(noise * 10), toRad(noise * 10), toRad(noise * 360));
                trees.add(treeinstance);
            }
        }
    }
    trees.rotation.set(-toRad(90), 0, 0);
    environment.add(trees);

    // collision for tree trunks
    for (let i = 0; i < trees.children.length; i++) {
        const position = trees.children[i].position;
        const x = position.x;
        const y = position.z - ((treeSize - 10) / 2);
        const z = position.y * -1;

        var runwayBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.2, (treeSize - 10) / 2, 0.2)),
            position: new CANNON.Vec3(x, y, z),
            material: new CANNON.Material({friction: 0.0})
        });
        world.addBody(runwayBody);
    }

    updateLoading(85, "Making clouds");

    // clouds TODO: improve, maybe two combined perlin Kites
    const spacing = 1.5 * config.world.worldSize / (config.world.cloudAmount * 2);
    for (let i = -config.world.cloudAmount; i < config.world.cloudAmount; i++) {
        for (let j = -config.world.cloudAmount; j < config.world.cloudAmount; j++) {
            var cloud = new THREE.Object3D();

            var geometry = new THREE.BoxGeometry(2, 1, 1);
            var material = new THREE.MeshBasicMaterial({color: 0xefefff, side: THREE.DoubleSide});
            // var material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.3, transparent: true});
            material.opacity = 0.5;
            var base = new THREE.Mesh(geometry, material);
            base.position.set(0, 0, 0);
            // base.castShadow = true;
            cloud.add(base);

            var geometry = new THREE.BoxGeometry(1, 1, 1);
            var material = new THREE.MeshBasicMaterial({color: 0xefefff, side: THREE.DoubleSide});
            // var material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.3, transparent: true});
            var fluff = new THREE.Mesh(geometry, material);
            fluff.position.set(0, 1, 0);
            // fluff.castShadow = true;
            cloud.add(fluff);

            cloud.rotation.y = Math.random() * 6.3;
            cloud.scale.set(Math.random() * 40 + 30, Math.random() * 10 + 20, Math.random() * 60 + 30);
            cloud.position.set(i * spacing + Math.random() * spacing / 2, Math.random() * 100 + 300, j * spacing + Math.random() * spacing / 2);

            environment.add(cloud);
        }
    }
    scene.add(environment);
    if (--toLoad == 0) {
        draw();
    }
}

function moveWaterAndLight() {
    water.position.x = Kite.position.x;
    water.position.z = Kite.position.z;
    light.position.x = Kite.position.x + 0;
    light.position.z = Kite.position.z - 300;
    light.position.y = Kite.position.y + 300;
}