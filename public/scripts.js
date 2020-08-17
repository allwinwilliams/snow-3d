
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

var particle, particles, floor;

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

		loader.load( './snow.gltf', function ( gltf ) {
			// scene.add( gltf.scene );
			var model = gltf.scene;
			model.traverse((object) => {
				if ( object.isMesh ) {
      // note: for a multi-material mesh, `o.material` may be an array,
      // in which case you'd need to set `.map` on each value.
	      	object.material = new THREE.MeshPhongMaterial();
	    	};

			});
			floor = model;
			scene.add( model );

		}, undefined, function ( error ) {
			console.error( error );
		} );

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
}

function onScroll ( event ){
	var top = document.body.scrollTop;
	console.log(top);

	floor.rotation.x = top * 0.002;
	floor.rotation.y = top * 0.02;;
	floor.rotation.z = 0;

}

window.addEventListener( 'wheel', onScroll, false );
window.addEventListener( 'mousemove', onMouseMove, false );
