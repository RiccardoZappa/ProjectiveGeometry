import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container, stats;
let camera, scene, renderer, mesh;
let cameraRig, activeCamera, activeHelper;
let cameraPerspective, cameraOrtho;
let cameraPerspectiveHelper, cameraOrthoHelper;
const frustumSize = 600;

init();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();

	//

	camera = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
	camera.position.z = 2500;

	cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 300, 1000 );

	cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
	scene.add( cameraPerspectiveHelper );

	//
	cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );

	cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
	scene.add( cameraOrthoHelper );

	//

	activeCamera = cameraPerspective;
	activeHelper = cameraPerspectiveHelper;


	// counteract different front orientation of cameras vs rig

	cameraOrtho.rotation.y = Math.PI;
	cameraPerspective.rotation.y = Math.PI;

	cameraRig = new THREE.Group();

	cameraRig.add( cameraPerspective );
	cameraRig.add( cameraOrtho );

	scene.add( cameraRig );
	//

    //texture
    const textureLoader = new THREE.TextureLoader();
    const bricks = textureLoader.load('assets/bricks.jpg');

	mesh = new THREE.Mesh(
		new THREE.SphereGeometry( 100, 16, 8 ),
		new THREE.MeshBasicMaterial({ color: 0xf08080, map: bricks})
	);
	scene.add( mesh );

	const mesh2 = new THREE.Mesh(
		new THREE.SphereGeometry( 50, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0x00ff00, map: bricks} )
	);
	mesh2.position.y = 150;
    mesh.position.z = 100;
	mesh.add( mesh2 );

	const mesh3 = new THREE.Mesh(
		new THREE.BoxGeometry( 100, 100, 100 ),
		new THREE.MeshBasicMaterial( { color: 0xffff00, map: bricks} )
	);
	mesh3.position.z = 350;
    mesh3.position.y = 150;
    mesh.add(mesh3);

    const mesh4 = new THREE.Mesh(
		new THREE.CapsuleGeometry( 50, 30, 4, 8 ),
		new THREE.MeshBasicMaterial( {color: 0xff0000, map: bricks} )
	);
    mesh4.position.z = 200;
    mesh4.position.y = 300;
    mesh4.position.z = 300;
    mesh.add(mesh4);


    const mesh5 = new THREE.Mesh(
		new THREE.BoxGeometry( 100, 100, 100 ),
		new THREE.MeshBasicMaterial( { color: 0x0000ff, map: bricks} )
	);
	mesh5.position.z = 500;
    mesh5.position.y = 10;
    mesh5.position.x = 300;
    mesh.add(mesh5);
	//

	const geometry = new THREE.BufferGeometry();
	const vertices = [];

	for ( let i = 0; i < 10000; i ++ ) {

		vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
		vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
		vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

	}

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

	const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
	scene.add( particles );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.setAnimationLoop( animate );
	container.appendChild( renderer.domElement );

	renderer.setScissorTest( true );

	//

    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

	window.addEventListener( 'resize', onWindowResize );
	document.addEventListener( 'keydown', onKeyDown );

}

//

function onKeyDown( event ) {

	switch ( event.keyCode ) {

		case 79: /*O*/

			activeCamera = cameraOrtho;
			activeHelper = cameraOrthoHelper;

			break;

		case 80: /*P*/

			activeCamera = cameraPerspective;
			activeHelper = cameraPerspectiveHelper;

			break;

	}

}


// In your JavaScript file
const fovInput = document.getElementById('fov-input');
const nearInput = document.getElementById('near-input');
const farInput = document.getElementById('far-input');


fovInput.addEventListener('change', () => {
  const newFov = parseFloat(fovInput.value);
  activeCamera.fov = newFov;
  activeCamera.updateProjectionMatrix();
  console.log("new fov" + newFov);
});

nearInput.addEventListener('change', () => {
    const newNear = parseFloat(nearInput.value);
    activeCamera.near = newNear;
    activeCamera.updateProjectionMatrix();
  });
  
  farInput.addEventListener('change', () => {
    const newFar = parseFloat(farInput.value);
    activeCamera.far = newFar;
    activeCamera.updateProjectionMatrix();
  });

//

function onWindowResize() {

	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = 0.5 * aspect;
	camera.updateProjectionMatrix();

	cameraPerspective.aspect = 0.5 * aspect;
	cameraPerspective.updateProjectionMatrix();

	cameraOrtho.left = - 0.5 * frustumSize * aspect / 2;
	cameraOrtho.right = 0.5 * frustumSize * aspect / 2;
	cameraOrtho.top = frustumSize / 2;
	cameraOrtho.bottom = - frustumSize / 2;
	cameraOrtho.updateProjectionMatrix();

}

//

function animate() {

	render();

}


function render() {

	const r = Date.now() * 0.0005;

	mesh.position.x = 700 * Math.cos( r );
	mesh.position.z = 700 * Math.sin( r );
	mesh.position.y = 700 * Math.sin( r );

	mesh.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
	mesh.children[ 0 ].position.z = 70 * Math.sin( r );

	if ( activeCamera === cameraPerspective ) {

		cameraPerspective.updateProjectionMatrix();

		cameraPerspectiveHelper.update();
		cameraPerspectiveHelper.visible = true;

		cameraOrthoHelper.visible = false;

	} else {

		cameraOrtho.updateProjectionMatrix();

		cameraOrthoHelper.update();
		cameraOrthoHelper.visible = true;

		cameraPerspectiveHelper.visible = false;

	}

	cameraRig.lookAt( mesh.position );

	//

	activeHelper.visible = false;

	renderer.setClearColor( 0x000000, 1 );
	renderer.setScissor( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
	renderer.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
	renderer.render( scene, activeCamera );

	//

	activeHelper.visible = true;

	renderer.setClearColor( 0x111111, 1 );
	renderer.setScissor( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
	renderer.setViewport( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
	renderer.render( scene, camera );

}