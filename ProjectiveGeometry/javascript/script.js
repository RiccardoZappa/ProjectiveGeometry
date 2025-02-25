import * as THREE from 'three';
import { FlyControls } from "three/addons/controls/FlyControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const container = document.getElementById('three-container'); // Get the container element
renderer.setSize( 600, 450 );
renderer.setAnimationLoop( animate );
container.appendChild( renderer.domElement ); 

// Lighting for better visibility
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);

const geometry = new THREE.BoxGeometry( 3, 3, 3 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Function to Create Projection Lines
function createLine(color) {
    const material = new THREE.LineBasicMaterial({ color });
    const geometry = new THREE.BufferGeometry();
    return new THREE.Line(geometry, material);
}

// Projection Lines from Cube to Camera
const projectionLines = [];
for (let i = 0; i < 8; i++) {
    const line = createLine(0xff0000); // Red lines
    scene.add(line);
    projectionLines.push(line);
}

// Function to Update Projection Lines
function updateProjectionLines() {
    const vertices = geometry.attributes.position;
    const cubeWorldMatrix = cube.matrixWorld;

    for (let i = 0; i < 8; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        vertex.applyMatrix4(cubeWorldMatrix); // Convert local to world position

        const points = [vertex, camera.position.clone()];
        projectionLines[i].geometry.setFromPoints(points);
    }
}
// Update the Epipolar Line
function updateEpipolarLine() {
    const points = [cube.position, camera.position];
    lineGeometry.setFromPoints(points);
}  


// 2nd Camera (Overview Camera)
const overviewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
overviewCamera.position.set(15, 15, 15); // Positioned to look down at the scene
overviewCamera.lookAt(scene.position);

// 2. Initiate FlyControls with various params
const controls = new FlyControls( camera, renderer.domElement );
controls.movementSpeed = 100;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = true;


function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

    // Move Target Object (Example: Left & Right)
    cube.position.x = Math.sin(Date.now() * 0.001) * 5;

    // Update Epipolar Line
    updateProjectionLines();

    controls.update(0.01);


    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    // Render Overview Camera in Mini Viewport
    renderer.setViewport(10, 10, 200, 200); // Small top-left corner
    renderer.render(scene, overviewCamera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    // Get the *current* container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  });
