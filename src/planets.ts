import * as THREE from 'three'
import sunMap from '../textures/2k_sun.jpg';
import earthMap from '../textures/2k_earth_daymap.jpg';
import moonMap from '../textures/2k_moon.jpg';
import saturnMap from '../textures/2k_saturn.jpg';
import saturnRingMap from '../textures/2k_saturn_ring_alpha.png';

interface Planet {
    readonly map: string,
    readonly bump?: string,
    readonly clouds?: string,
    readonly radius: number,
    readonly tilt: number,
    readonly rot: number,
    readonly rotation: number[],
    readonly ring?: {
        readonly map: string,
        readonly startRadius: number,
        readonly endRadius: number,
        readonly opacity: number
    }
}

const loader = new THREE.TextureLoader();
// adapted from https://github.com/ofrohn/threex.planets/blob/3158e9c/threex.planets.js
const PLANET_TEMPLATES: { [key: string]: Planet } = {
    "sol": {map: sunMap, radius: 1.2, tilt: 7.25, rot: 1.0438, rotation:[286.13, 63.87, 14.1844]},
    "ter": {map: earthMap, bump:"earthbump.jpg", clouds:"earthclouds.png", radius: 0.4, tilt: 23.45, rot: 0.9973, rotation:[90, 66.5607, 360.9856]},
    "lun": {map: moonMap, bump:"moonbump.jpg", radius: 0.25, tilt: 1.54, rot: 27.3217, rotation:[264.6051, 89.9784, 13.1763]},
    "sat": {map: saturnMap, radius: 1.2, tilt: 26.73, rot: 0.444, rotation:[79.5275, 61.9478, 810.7939],
        ring: {map: saturnRingMap, startRadius: 1.1161, endRadius: 2.3267, opacity: 1.0}
    },
}

const sphereGeometry = new THREE.SphereGeometry(1, 64, 32);
const planets: { [key: string]: THREE.Object3D} = {};
for (const key in PLANET_TEMPLATES) {
    let planet: Planet = PLANET_TEMPLATES[key];
    let material = new THREE.MeshBasicMaterial({
        map: loader.load(planet.map)
    });
    let planetMesh = new THREE.Mesh(sphereGeometry, material);
    if (planet.ring !== undefined) {
        let ringsGeometry = new THREE.RingGeometry(planet.ring.startRadius, planet.ring.endRadius, 128, 1);
        let t = (planet.ring.startRadius + planet.ring.endRadius) / 2;
        // https://discourse.threejs.org/t/applying-a-texture-to-a-ringgeometry/9990/3
        var pos = ringsGeometry.attributes.position;
        var v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++){
            v3.fromBufferAttribute(pos, i);
            ringsGeometry.attributes.uv.setXY(i, v3.length() < t? 0 : 1, 1);
        }
        var ringsMaterial = new THREE.MeshBasicMaterial({map: loader.load(planet.ring.map), side: THREE.DoubleSide, transparent: true});
        var ringMesh = new THREE.Mesh(ringsGeometry, ringsMaterial)
        ringMesh.rotation.x = Math.PI/2;
        planetMesh.add(ringMesh);
    }
    planets[key] = planetMesh;
}

export {planets};