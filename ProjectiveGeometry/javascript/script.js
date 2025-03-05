import * as THREE from 'three';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container, stats;
let camera, scene, renderer, mesh;
let cameraRig, activeCamera, activeHelper;
let cameraPerspective, cameraOrtho;
let cameraPerspectiveHelper, cameraOrthoHelper;
const frustumSize = 600;
let lastAddedMesh = null; // Add this line
const addedMeshes = []; // Array to store added meshes

const gui = new dat.GUI();

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

    // --- dat.GUI Setup ---

    // Data object for new object parameters
    const params = {
        type: 'Sphere', // Default object type
        radius: 50,
        width: 100,
        height: 100,
        depth: 100,
        capsuleLength: 30,
        segments: 16,
        capSegments: 8,
        x: 0,
        y: 0,
        z: 0,
        color: '#ff0000', // Default color (red)
        add: addObject, // Function to add the object
        texture: 'bricks'
    };

    // dat.GUI folders
    const objectFolder = gui.addFolder('New Object');
    const typeController = objectFolder.add(params, 'type', ['Sphere', 'Box', 'Capsule']); // Dropdown for object type
    const sizeFolder = objectFolder.addFolder('Size');
    const positionFolder = objectFolder.addFolder('Position');
    const materialFolder = objectFolder.addFolder('Material');
 
    // Size controls (conditional based on 'type')
    const sizeControllers = [];
 
    function updateSizeControls() {
        sizeControllers.forEach(controller => sizeFolder.remove(controller));
        sizeControllers.length = 0;  // Clear the array
 
        if (params.type === 'Sphere') {
            sizeControllers.push(sizeFolder.add(params, 'radius', 1, 200));
            sizeControllers.push(sizeFolder.add(params, 'segments', 4, 64, 1));
        } else if (params.type === 'Box') {
            sizeControllers.push(sizeFolder.add(params, 'width', 1, 200));
            sizeControllers.push(sizeFolder.add(params, 'height', 1, 200));
            sizeControllers.push(sizeFolder.add(params, 'depth', 1, 200));
        } else if (params.type === 'Capsule') {
            sizeControllers.push(sizeFolder.add(params, 'radius', 1, 200));
            sizeControllers.push(sizeFolder.add(params, 'capsuleLength', 1, 200));
            sizeControllers.push(sizeFolder.add(params, 'segments', 4, 64, 1));
            sizeControllers.push(sizeFolder.add(params, 'capSegments', 2, 32, 1));
 
        }
    }
    objectFolder.add(params, 'add');

    params.deleteLast = deleteLastObject;
    objectFolder.add(params, 'deleteLast').name('Delete Last');

 
    // Update size controls whenever the object type changes
    typeController.onChange(updateSizeControls);
    updateSizeControls(); // Initial setup
 
    // Position controls
    positionFolder.add(params, 'x', -500, 500);
    positionFolder.add(params, 'y', -500, 500);
    positionFolder.add(params, 'z', -500, 500);
 
    // Material controls
    materialFolder.addColor(params, 'color');
    materialFolder.add(params, 'texture', ['bricks', 'none']);
     
 
    // Camera controls
    const cameraFolder = gui.addFolder('Camera');
    
    cameraFolder.add(cameraPerspective, 'fov', 1, 150).name('FOV').onChange(updateFov);
 
    cameraFolder.add(cameraPerspective, 'near', 0.1, 500).name('Near').onChange(updateNear);
    
    cameraFolder.add(cameraPerspective, 'far', 1, 5000).name('Far').onChange(updateFar);
 
    // Add object function
    function addObject() {
        let geometry;
        if (params.type === 'Sphere') {
            geometry = new THREE.SphereGeometry(params.radius, params.segments, params.segments);
        } else if (params.type === 'Box') {
            geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
        } else if (params.type === 'Capsule') {
            geometry = new THREE.CapsuleGeometry(params.radius, params.capsuleLength, params.segments, params.capSegments);
        }
        let material
        if(params.texture == 'bricks') {
            material = new THREE.MeshBasicMaterial({ color: params.color, map: bricks });
        } else {
            material = new THREE.MeshBasicMaterial({ color: params.color });
        }
 
        const newMesh = new THREE.Mesh(geometry, material);
        newMesh.position.set(params.x, params.y, params.z);
        mesh.add(newMesh);
        lastAddedMesh = newMesh; // Store the new meshs
    }

    function deleteLastObject() {
        if (lastAddedMesh) {
            mesh.remove(lastAddedMesh); // Remove from the scene
            lastAddedMesh.geometry.dispose(); // Dispose of the geometry
            lastAddedMesh.material.dispose(); // Dispose of the material
            lastAddedMesh = null; // Clear the reference
        }
    }

    function updateCamera() {
        if (activeCamera === cameraPerspective || activeCamera === cameraOrtho)
        {
            activeCamera.updateProjectionMatrix();
            if(activeHelper)
            {
                activeHelper.update();
            }
        }
    }

    function updateFov()
    {
        if (activeCamera === cameraPerspective || activeCamera === cameraOrtho)
        {
            activeCamera.fov = cameraPerspective.fov;
        }
        updateCamera();
    }

    function updateNear()
    {
        if (activeCamera === cameraPerspective || activeCamera === cameraOrtho)
        {
            activeCamera.near = cameraPerspective.near;
        }
        updateCamera();
    }

    function updateFar()
    {
        if (activeCamera === cameraPerspective || activeCamera === cameraOrtho)
        {
            activeCamera.far = cameraPerspective.far;
        }
        updateCamera();
    }

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
    // Ensure that when camera changes the gui is updated
    updateFov();
    updateNear();
    updateFar();

    if(gui) {
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
    }

}

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
    
    if (mesh.children.length != 0)
    {
        mesh.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
        mesh.children[ 0 ].position.z = 70 * Math.sin( r );
    }

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