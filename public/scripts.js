
import * as THREE from 'https://unpkg.com/three/build/three.module.js'
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer, controls;
var geometry, material, mesh;

var mouse = {x: 0, y: 0};
var prev_mouse = {x: 0, y: 0};

let prev_scroll_pos = 0;
let ticking = false;

var prev_change, change;

var sound, audioLoader;

var particle, particles, floor;

var zoom = 0;

function distance(a, b){
	// return Math.sqrt((a-b) * (a-b));
	return a - b;
}

function init() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
		var canvas_tag = document.getElementById("snow");
    canvas_tag.appendChild( renderer.domElement );

		var loader = new GLTFLoader();

		loader.load( './public/snow.gltf', function ( gltf ) {
			// scene.add( gltf.scene );
			var model = gltf.scene;
			model.traverse((object) => {
				if ( object.isMesh ) {
      // note: for a multi-material mesh, `o.material` may be an array,
      // in which case you'd need to set `.map` on each value.
	      	object.material = new THREE.MeshPhongMaterial({shininess: 80});
	    	};

			});
			floor = model;
			scene.add( model );

		}, undefined, function ( error ) {
			console.error( error );
		} );

		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );
		// create a global audio source
		sound = new THREE.Audio( listener );
		// load a sound and set it as the Audio object's buffer
		audioLoader = new THREE.AudioLoader();


		var pointLight = new THREE.PointLight( 0xffffff );
		pointLight.position.set(1,1,2);
		camera.add(pointLight);

		scene.add( camera );

		camera.position.set( 1, 1, 3 );

		particles = new Array();

		for (var i = 0; i < 200; i++) {

				var size	= Math.random() * 0.15 + 0.06;
				var geometry = new THREE.SphereGeometry( size , 20, 20, 0, Math.PI * 2, 0, Math.PI * 2);
				var material = new THREE.MeshPhongMaterial({
					color: 0xFFFFFF,
					shininess: 80,
	        transparent: true,
	        opacity: 0.5
    		});

				particle = new THREE.Mesh(geometry, material);

				particle.position.x = Math.random() * (25) - 10;
				particle.position.y = Math.random() * (25) - 10;
				particle.position.z = Math.random() * (25) - 10;

				particle.direction = {
					x: Math.random(),
	        y: Math.random()
				};

				particles[i] = particle;


				scene.add(particle);
		}

		console.log(camera);
		prev_change = new THREE.Vector2();
		change = new THREE.Vector2();
}

function animate() {

    requestAnimationFrame( animate );

		prev_change.x = change.x;
		prev_change.y = change.y;

		change.x = distance(mouse.x, 0);
		change.y = distance(mouse.y, 0);

		var volume = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y) + 0.3;
		volume = volume > 0.98 ? 0.98 : volume;
		sound.setVolume(volume);

		if(!(change.x == prev_change.x && change.y == prev_change.y)){
			camera.position.x = camera.position.x + (change.x - prev_change.x);
			camera.position.y = 1;
			camera.position.z = camera.position.z - (change.y - prev_change.y) * 0.8;

			// console.log((change.x - prev_change.x) + ", " + (change.y - prev_change.y));

			camera.rotation.x = camera.rotation.x + (change.y - prev_change.y) * 0.2;
			// camera.rotation.y = camera.rotation.y + (change.x - prev_change.x) * 0.4;
			camera.rotation.z = camera.rotation.z - (change.x - prev_change.x + change.y - prev_change.y) * 0.08;
		}
		camera.rotation.y = camera.rotation.y + (change.x ) * 0.01;

		for (var i = 0; i < 200; i++) {
			particle = particles[i];

			particle.position.x = particle.position.x + Math.random() * 0.004 + (-0.002);
			particle.position.y = particle.position.y + Math.random() * 0.004 + (-0.008);
			particle.position.z = particle.position.z + Math.random() * 0.004 + (-0.002);

			if(particle.position.y + 0.5 < 0) {
				particle.position.x = Math.random() * (25) - 10;
				particle.position.y = Math.random() * (25) - 10;
				particle.position.z = Math.random() * (25) - 10;
			}

			// console.log(particle.position);
		}

    renderer.render( scene, camera );
}

init();
animate();

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

	if(!sound.isPlaying){

	}

}

function onMouseDown( event ) {
	console.log("Mouse Down");
	// setInterval(() => {
	// 	while(zoom < 0.2){
	// 		zoom = zoom + 0.01;
	// 		camera.position.z = camera.position.z - zoom;
	// 	}
	// }, 200);

}

function onMouseUp( event ) {
	console.log("Mouse Up");
	// camera.position.z = 3;
	// zoom = 0;
}

function onScroll ( event ){
	var top = document.body.scrollTop;
	// console.log(top);

	floor.rotation.x = top * 0.002;
	floor.rotation.y = top * 0.02;;
	floor.rotation.z = 0;

}

function startButtonClick( event ){
	console.log("start click");
	audioLoader.load( './public/ambient.flac', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.3 );
		sound.play();
	});
	document.getElementById("permission-block").remove();
	document.body.style.overflowY = "scroll";
}

document.getElementById("permission-button").addEventListener( 'click', startButtonClick, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );
window.addEventListener( 'wheel', onScroll, false );
window.addEventListener( 'mousemove', onMouseMove, false );
