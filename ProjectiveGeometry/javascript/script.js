import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Scene and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const container = document.getElementById('three-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(600, 450);
container.appendChild(renderer.domElement);

// Cameras
const mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
mainCamera.position.set(0, 10, 20);

const overviewCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
overviewCamera.position.set(30, 30, 30);
overviewCamera.lookAt(scene.position);

// Add Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Create Large Cube (Wireframe for better visualization)
const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Create Projection Lines
const projectionLines = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

for (let i = 0; i < 8; i++) {
    const line = new THREE.Line(new THREE.BufferGeometry(), lineMaterial);
    scene.add(line);
    projectionLines.push(line);
}

// Function to Update Projection Lines
function updateProjectionLines() {
    const vertices = cubeGeometry.attributes.position;
    const cubeWorldMatrix = cube.matrixWorld;

    for (let i = 0; i < 8; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        vertex.applyMatrix4(cubeWorldMatrix); // Convert local to world position

        const points = [vertex, mainCamera.position.clone()];
        projectionLines[i].geometry.setFromPoints(points);
    }
}

// GUI for Switching Camera Views
const gui = new GUI();
const cameraParams = { cameraView: 'Main Camera' };

gui.add(cameraParams, 'cameraView', ['Main Camera', 'Overview Camera']).onChange(() => {
    if (cameraParams.cameraView === 'Main Camera') {
        currentCamera = mainCamera;
    } else {
        currentCamera = overviewCamera;
    }
});

// Animation Loop
let currentCamera = mainCamera;

function animate() {
    requestAnimationFrame(animate);

    // Rotate the Cube
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;

    // Update Projection Lines
    updateProjectionLines();

    renderer.render(scene, currentCamera);
}

animate();

// Handle Resizing
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    mainCamera.aspect = width / height;
    overviewCamera.aspect = width / height;
    mainCamera.updateProjectionMatrix();
    overviewCamera.updateProjectionMatrix();

    renderer.setSize(width, height);
});
