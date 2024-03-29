﻿var audio = new Audio('background.ogg'); // BGM
var audio2 = new Audio('getItem.ogg') // get item
var audio3 = new Audio('getTrap.ogg') // get item


var renderer, scene, camera, listener;
var lookAt = new THREE.Vector3(0.0, 0.0, 0.0);

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

var Kite, environment, ring, nextRing, heightfieldMatrix, light, water;
var item,nextItem;
var trap,nextTrap; // GC add 
var world, physicsKite, physicsGround; // cannonjs stuff

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
	loadKite,
	loadEnvironment,
	loadDone,
	draw
];

var world_time=60;


function initialImageClicked() {
    document.getElementById('initialImage').style.display = "none";
    document.getElementById('myCanvasContainer').style.display = "block";
}

 
function loadGame() {        // 로드 게임 함수 기본 => loadOneLoader(0);  만약 0 대신 딴걸 넣으면 ? 로딩창에서 영원히 진행안됨 흑흑
	loadOneLoader(0);
}



function loadOneLoader(i) {              // 이거 기본 loadOneLoader(i+1) , 만약 값을 바꾸면 응 터져 
	loaders[i](function() {
		loadOneLoader(i+1)
	});
}

function loadWorld(callback) {                 // 함수 loadWorld  callback은 되돌아오는 함수죠? 그렇죠 ? 그렇죠?
	//  updateLoading(5, "Setting up Three.js");      // 앙 세팅 완료 띠 

    renderer = new THREE.WebGLRenderer({canvas: document.querySelector("canvas")});   // THREE 라이브러리 인스턴스 생성
    renderer.setClearColor(0x35bbff); // background colour : sky-color
    scene = new THREE.Scene();        // 화면 만듬 
    camera = new THREE.PerspectiveCamera(100, 1337, 1, config.world.viewDistance);  // 기본값 : 100, 1337, 1, config.world.viewDistance
                                                                                    // 값을 막 바꾸면 비행기가 화면에 꺼꾸로 달려잇음 띠옹
    updateLoading(10, "Setting up Cannon.js");                

    // creating the cannonjs world         
    world = new CANNON.World();                                               // 여기있는 코드 없으면 실행자체가 안되요     
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, config.world.gravityConstant, 0);
             
	callback(); // 앙 컬백띠 
}

function loadKite(callback) {             
	updateLoading(15, "Making Kite");  

    // Kite.js
    addKite(camera, callback);                 // 비행기를 추가해오 없으면 로딩창에서 멈춰요
}

function loadEnvironment(callback) {              // 이것도 컬백이 인자로 들어감 
	 updateLoading(25, "Making environment");          // 아하 이거 로딩창 화면 보여주는거임 

    // environment.js 
    if (config.world.randomSeed) {                           // 앙 랜덤 설정띠 
        config.world.seed = Math.random();
    }
    console.log("Seed: " + config.world.seed);          // 앙 콘솔로 보여주는 거시야
    noise.seed(config.world.seed);                     // 이거 없으면 로딩에서 멈춤 
    addEnvironment(noisefn);

    updateLoading(95, "Making rings");        // 앙 링 만들었띠 통보 

    // ring.js 

    
    ring = getRing(true);                      // 링을 만드는 파트임 
    scene.add(ring);
    prevRingTime = Date.now();
    ring.position.copy(ringDetector.position);
    nextRing = getRing(false);
    nextRing.position.set(-10, 410, -110);
    scene.add(nextRing);


    // drawing trap

    trap = getTrap(true);                      // 링을 만드는 파트임 
    scene.add(trap);
    prevTrapTime = Date.now();
    trap.position.copy(trapDetector.position);
    nextTrap = getTrap(false);
    nextTrap.position.set(-10, 410, -110);
    scene.add(nextTrap);


    // drawing item

    item = getItem(true);                      // 아이템만듬
    scene.add(item);
    prevItemTime = Date.now();
    item.position.copy(itemDetector.position);
    nextItem = getItem(false);
    nextItem.position.set(-10, 410, -110);
    scene.add(nextItem);


	callback();          // 앙 컬백띠 " 콜백 함수란 어떤 이벤트가 발생한 후, 수행될 함수를 의미합니다. "
}
 
function loadDone(callback) {      
    updateLoading(100, "Done");       
    gameState = gameStates.playing;	            
	
	callback();
}

function draw() {                                // 드로우하는 부분임 

    audio.play();  // BGM 재생시작

    let dt = clock.getDelta();
    world.step(dt);                          // 이거 없애면 비행기 못움직임 

    // linking the threejs and cannonjs Kites
    Kite.position.copy(physicsKite.position);         
    //console.log(Kite);
    Kite.quaternion.copy(physicsKite.quaternion);

    // controls.js
    parseControls();

    // Kite.js
    moveKite(dt);
    //moveKite(dt, speed);

    // detecting when Kite flies through loop
    ringDetector.addEventListener('collide', function () {
        if (Date.now() - prevRingTime > 100) {
            audio2.play(); 
            handleKiteThroughRing();
        }
    });

    // detecting when Kite flies through trap
    trapDetector.addEventListener('collide', function () {
        if (Date.now() - prevTrapTime > 100) {
            audio3.play(); 
            handleKiteThroughTrap();
        }
    });

    itemDetector.addEventListener('collide', function () {
        if (Date.now() - prevItemTime > 100) {
            audio2.play(); 
            handleKiteThroughItem();
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