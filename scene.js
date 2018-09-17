let renderer = null;
let scene = null;
let camera = null;
let orbitControls = null;

let duration = 5000;
let steps = 50;
let objLoader;

function run() {
    requestAnimationFrame(function() { run(); });

    // Render the scene
    renderer.render(scene, camera);

    // Update the animations
    KF.update();

    // Update the camera controller
    orbitControls.update();
}

/*
 * Calculate the values of the keys given a number of steps.
 */
function getKeys(steps) {
    let keys = [];
    let step = 1.0/steps;
    let i = 0;
    while(i<=steps) {
        keys.push(step*i);
        i++;
    }
    return keys;
}

/* 
 * Calculate the position values to move in a circle.
 */
function getPositionValues(steps) {
    let vertices = [];
    let radius = 10;
    for(let i = 0; i <= 360; i+=360/steps){
        let angle_in_radians = i*Math.PI/180;
        vertices.push({
            x: radius*Math.cos(angle_in_radians),
            y: 0.0,
            z: radius*Math.sin(angle_in_radians)
        });
    }
    return vertices;
}

/* 
 * Calculate the rotation value to look in the direction.
 */
function getRotationValues(steps) {
    let vertices = [];
    let val = 0.3;
    while(vertices.length <= steps) {
        vertices.push({y: val});
        val -= 0.13;
    }
    return vertices;
}

/* 
 * Animates an object in a circle.
 */
function animateObject(object) {
    object.scale.set(0.1,0.1,0.1);

    let animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps: [
            {
                keys: getKeys(steps),
                values: getPositionValues(steps),
                target: object.position
            },
            {
                keys: getKeys(steps),
                values: getRotationValues(steps),
                target: object.rotation
            }
        ],
        loop: true,
        duration:duration,
        easing:TWEEN.Easing.None,
    });

    animator.start();
    scene.add(object);
}

/*
 * Loads object and calls callback
 */
function loadObj() {
    if(!objLoader) {
        objLoader = new THREE.OBJLoader();
    }
    objLoader.load(
        '../models/stickman.obj',
        function(object) {
            animateObject(object);
        },
        function (xhr) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened');
    
        }
    );
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true });

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.15, 0.1, 0.3);

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 1, 4000 );
    camera.position.set(0, 30, 30);
    scene.add(camera);

    // Add controls
    orbitControls = new THREE.OrbitControls(camera, canvas);

    // Create and add all the lights
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 2);
    scene.add(directionalLight);

    // Create a texture map
    var map = new THREE.TextureLoader().load('../images/checker_large.gif');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    scene.add(mesh);

    loadObj();
}

function main() {
    let canvas = document.getElementById("webglcanvas");

    // create the scene
    createScene(canvas);

    // Run the run loop
    run();
}