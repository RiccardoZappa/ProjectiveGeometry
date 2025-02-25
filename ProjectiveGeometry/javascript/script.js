import * as THREE from 'three';
import { FlyControls } from "three/addons/controls/FlyControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const container = document.getElementById('three-container'); // Get the container element
renderer.setSize( 600, 450 );
renderer.setAnimationLoop( animate );
container.appendChild( renderer.domElement ); 

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

// 2. Initiate FlyControls with various params
const controls = new FlyControls( camera, renderer.domElement );
controls.movementSpeed = 100;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = true;

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

    
	renderer.render( scene, camera );
    controls.update(0.01)

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

  // Example: Update target position on mouse click
container.addEventListener('click', (event) => {
    targetAzimuthalAngle = (event.clientX / window.innerWidth) * Math.PI * 2; // Example
    targetPolarAngle = (event.clientY / window.innerHeight) * Math.PI; // Example
  });