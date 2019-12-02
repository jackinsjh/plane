
var audio = new Audio('background.ogg'); // BGM
var audio2 = new Audio('getItem.ogg') // get item
var audio3 = new Audio('getTrap.ogg') // get item


var renderer, scene, camera, listener;
var lookAt = new THREE.Vector3(0.0, 0.0, 0.0);

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

var plane, environment, ring, nextRing, heightfieldMatrix, light, water;
var item,nextItem;
var trap,nextTrap; // GC add 
var world, physicsPlane, physicsGround; // cannonjs stuff

var prevRingTime;
var prevTrapTime;
var prevItemTime;

var propellerspeed = 0;
var noisefn = noise.simplex2;

console.log("noise:" + typeof noise + ", noise.simplex2:" + noise.simplex2)
console.log("noise:" + noise + ", " + noisefn)

var toLoad = 2;

let gameState;

// Loading order
var loaders = [
	loadWorld,
	loadPlane,
	loadEnvironment,
	loadDone,
	draw
];

var world_time=60;


function initialImageClicked() {
    document.getElementById('initialImage').style.display = "none";
    document.getElementById('myCanvasContainer').style.display = "block";
}

 
function loadGame() {        // loadOneLoader(0);  
	loadOneLoader(0);
}



function loadOneLoader(i) {              //  loadOneLoader(i+1) 
	loaders[i](function() {
		loadOneLoader(i+1)
	});
}

function loadWorld(callback) {                 // loadWorld  callback
	 updateLoading(5, "Setting up Three.js");      

    renderer = new THREE.WebGLRenderer({canvas: document.querySelector("canvas")});   // THREE 
    renderer.setClearColor(0x35bbff); // background colour 
    scene = new THREE.Scene();        
    camera = new THREE.PerspectiveCamera(100, 1337, 1, config.world.viewDistance);  //100, 1337, 1, config.world.viewDistance
                                                                                    // 
    updateLoading(10, "Setting up Cannon.js");                

    // creating the cannonjs world         
    world = new CANNON.World();                                                
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, config.world.gravityConstant, 0);
             
	callback(); 
}

function loadPlane(callback) {             
	updateLoading(15, "Making plane");  

    // plane.js
    addPlane(camera, callback);                
}

function loadEnvironment(callback) {           
	 updateLoading(25, "Making environment");          

    // environment.js 
    if (config.world.randomSeed) {                           
        config.world.seed = Math.random();
    }
    console.log("Seed: " + config.world.seed);        
    noise.seed(config.world.seed);                     
    addEnvironment(noisefn);

    updateLoading(95, "Making rings");        

    // ring.js 

    
    ring = getRing(true);                      
    scene.add(ring);
    prevRingTime = Date.now();
    ring.position.copy(ringDetector.position);
    nextRing = getRing(false);
    nextRing.position.set(-10, 410, -110);
    scene.add(nextRing);


    // drawing trap

    trap = getTrap(true);                   
    scene.add(trap);
    prevTrapTime = Date.now();
    trap.position.copy(trapDetector.position);
    nextTrap = getTrap(false);
    nextTrap.position.set(-10, 410, -110);
    scene.add(nextTrap);


    // drawing item

    item = getItem(true);                    
    scene.add(item);
    prevItemTime = Date.now();
    item.position.copy(itemDetector.position);
    nextItem = getItem(false);
    nextItem.position.set(-10, 410, -110);
    scene.add(nextItem);


	callback();          
}
 
function loadDone(callback) {               
    updateLoading(100, "Done");                
    gameState = gameStates.playing;	           
	
	callback();
}

function draw() {                                

    audio.play();  

    let dt = clock.getDelta();
    world.step(dt);                          

    // linking the threejs and cannonjs planes
    plane.position.copy(physicsPlane.position);         
    //console.log(plane);
    plane.quaternion.copy(physicsPlane.quaternion);

    // controls.js
    parseControls();

    // plane.js
    movePlane(dt);
    //movePlane(dt, speed);

    // detecting when plane flies through loop
    ringDetector.addEventListener('collide', function () {
        if (Date.now() - prevRingTime > 100) {
            audio2.play(); 
            handlePlaneThroughRing();
        }
    });

    // detecting when plane flies through trap
    trapDetector.addEventListener('collide', function () {
        if (Date.now() - prevTrapTime > 100) {
            audio3.play(); 
            handlePlaneThroughTrap();
        }
    });

    itemDetector.addEventListener('collide', function () {
        if (Date.now() - prevItemTime > 100) {
            audio2.play(); 
            handlePlaneThroughItem();
        }
    });



    moveWaterAndLight();

    // change the DOM elements 
    document.getElementById("fps").innerHTML = round(1 / dt);
    if(world_time>0) {
    world_time -= dt;
    }
    else {
        world_time = 0;
    }
    document.getElementById("time").innerHTML = world_time;  // gc add
    document.getElementById("score").innerHTML = score;
    document.getElementById("aileronPosition").innerHTML = round(aileronPosition);
    document.getElementById("elevatorPosition").innerHTML = round(elevatorPosition);
    document.getElementById("rudderPosition").innerHTML = round(rudderPosition);
    document.getElementById("throttle").innerHTML = round(throttle);
    resizeCanvasToDisplaySize();
    renderer.render(scene, camera);

    if(world_time <= 0) {
        backToMainMenuClicked();
    }


    requestAnimationFrame(draw);
}

// Resizing window
function resizeCanvasToDisplaySize() {                    
    const canvas = renderer.domElement;      
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();                     
    }
}

// Math functions
// Converts degrees to radians
function toRad(degree) {
    return Math.PI * 2 * degree / 360;     
}

// Rounds float to 2 decimal places                   
function round(n) { 
    return Math.round(n * 100) / 100;                  
}

// Rotates a matrix (anti-clock)                
function rotateMatrix(matrix) {
    const n = matrix.length;
    let res = [];
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
            if (!res[j])
                res[j] = [];
            res[j][i] = matrix[n - 1 - i][j];
        }
    }
    return res;
}