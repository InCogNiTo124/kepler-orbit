import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import sunTextureMap from '../textures/2k_sun.jpg';
import moonTextureMap from '../textures/2k_moon.jpg';
import earthTextureMap from '../textures/2k_earth_daymap.jpg';

import GUI from 'lil-gui'

const state = {
    a: 2.0, // semi-major axis (units)
    e: 0.1, // eccentricity (scalar)
    i: 0.0, // inclination (radians)
    O: 0.0, // RAAN (radians)
    o: 0.0, // AoP (radians)
    theta: 0.0, // True anomaly (radians)
    planet: "sun",
    angles: "degrees",
    distances: "AU",
    pos_x: 0.0,
    pos_y: 0.0,
    pos_z: 0.0,
    vel_x: 0.0,
    vel_y: 0.0,
    vel_z: 0.0,
    v: 0.0,
    arg_x: 0.0,
    arg_y: 0.0,
};
interface Planet {
    texture: string
}
const PLANETS = {
    sun: {texture: sunTextureMap},
    moon: {texture: moonTextureMap},
    earth: {texture: earthTextureMap}
}
const loader = new THREE.TextureLoader();
const gui = new GUI();
gui.add(state, 'planet', PLANETS).onChange((e: Planet) => {
    planet.material.map = loader.load(e.texture, ()=>{renderer.render(scene, camera)});
    planet.material.needsUpdate = true;
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
const sphereGeometry = new THREE.SphereGeometry(1);
const sphereMaterial = new THREE.MeshBasicMaterial();
const texture = new THREE.TextureLoader().load(sunTextureMap, ()=>{renderer.render(scene, camera)});
sphereMaterial.map = texture;
const planet = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(planet);


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
