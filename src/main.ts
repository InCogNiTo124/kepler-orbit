import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {planets} from './planets';


import GUI from 'lil-gui'

const state = {
    // a: 2.0, // semi-major axis (units)
    // e: 0.1, // eccentricity (scalar)
    // i: 0.0, // inclination (radians)
    // O: 0.0, // RAAN (radians)
    // o: 0.0, // AoP (radians)
    // theta: 0.0, // True anomaly (radians)
    planet: "Sun",
    angles: "degrees",
    distances: "AU",
    // pos_x: 0.0,
    // pos_y: 0.0,
    // pos_z: 0.0,
    // vel_x: 0.0,
    // vel_y: 0.0,
    // vel_z: 0.0,
    // v: 0.0,
    // arg_x: 0.0,
    // arg_y: 0.0,
};

const planetNames: { [key: string]: string}= {
    Sun: "sol",
    Moon: "lun",
    Earth: "ter", 
    Saturn: "sat",
}
const gui = new GUI();
gui.add(state, 'planet', planetNames).onChange((e: string) => {
    createPlanet(celestialBody, e);
})
// const kepler = gui.addFolder('Keplerian elements');
// kepler.add(state, 'a').min(0).step(0.1).onChange(render);
// kepler.add(state, 'e', 0, 1-1e-7).onChange(render);
// kepler.add(state, 'i', 0, 360).onChange(render);
// kepler.add(state, 'O', 0, 360).onChange(render).name("\u03A9");
// kepler.add(state, 'o', 0, 360).onChange(render).name("\u03C9");
const canvas: HTMLCanvasElement = document.querySelector("#canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({canvas});
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000 );

camera.position.y = 2;
camera.position.x = 3;
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// scene
const scene = new THREE.Scene();

// planet
const celestialBody = new THREE.Object3D();
createPlanet(celestialBody, planetNames[state.planet]);
scene.add(celestialBody);


function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;

    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
        renderer.setSize(width, height, false);
    }

    return needResize;
}

function render() {
    //time /= 1000.0;

    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    
    renderer.render( scene, camera );
}
controls.addEventListener('change', render);
window.addEventListener('resize', render);
render();

function createPlanet(celestialBody: THREE.Object3D, planet: string) {
    celestialBody.children.length = 0; // remove all children by letting the GC do its thing
    celestialBody.add(planets[planet]);
    render();
}