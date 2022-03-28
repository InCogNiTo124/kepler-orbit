import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { planets } from './planets';

import GUI from 'lil-gui'

const ORBIT_POINTS_COUNT = 255;


function radians(degrees: number) {
    return degrees * Math.PI / 180;
}

// function degrees(radians: number) {
//     return radians * 180 / Math.PI;
// }

function orbitShapeHandler(ellipse: THREE.Mesh, a: number, e: number, o: number) {
    let f = a * e;
    let b = Math.sqrt(a * a - f * f);
    const path = new THREE.Shape();
    path.absellipse(0, 0, a, b, 0, 2 * Math.PI, false, 0);
    const geometry = new THREE.ShapeBufferGeometry(path, ORBIT_POINTS_COUNT);
    ellipse.geometry = geometry;
    ellipse.position.sub(ellipse.position);
    ellipse.rotation.z = o;
    ellipse.translateX(-f);
}

interface OrbitState {
    a: number, // semi-major axis (units)
    e: number, // eccentricity (scalar)
    i: number, // inclination (radians)
    O: number, // RAAN (radians)
    o: number, // AoP (radians)
    theta: number, // True anomaly (radians)}
    remove: Function,
    showGuides: boolean,
    showOrbitalPlane: boolean
}
// https://stackoverflow.com/a/58326357
const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');


function createOrbitPart(name: string, color: number, endAngle: number) {
    const curve = new THREE.EllipseCurve(
        0, 0,
        2, 2,
        0, endAngle,
        false,
        0);
    let points = curve.getPoints(ORBIT_POINTS_COUNT);
    points.push(new THREE.Vector2());
    const angleGeometry = new THREE.BufferGeometry();
    angleGeometry.setFromPoints(points);
    const angleMaterial = new THREE.LineBasicMaterial({ color: color });
    const angle = new THREE.LineLoop(angleGeometry, angleMaterial);
    angle.name = name;
    return angle;
}

function createOrbit(orbitState: OrbitState, orbitColor: string): THREE.Object3D {
    let root = new THREE.Object3D();

    let yawAngle = createOrbitPart('yawAngle', 0x00ff00, radians(orbitState.O));
    yawAngle.rotation.x = radians(-90);
    root.add(yawAngle);

    const yaw = new THREE.Object3D();
    yaw.name = 'yaw';
    yaw.rotation.y = radians(orbitState.O);
    const pitch = new THREE.Object3D();
    pitch.name = 'pitch';
    pitch.rotation.x = -radians(90 - orbitState.i);
    yaw.add(pitch);
    root.add(yaw);

    let pitchAngle = createOrbitPart('pitchAngle', 0x0000ff, radians(orbitState.i));
    pitchAngle.rotation.y = radians(90);
    yaw.add(pitchAngle);


    let periapsisAngle = createOrbitPart('periapsisAngle', 0xff0000, radians(orbitState.o));
    pitch.add(periapsisAngle);

    // orbital plane
    const orbitalPlaneGeo = new THREE.PlaneGeometry(25, 25);
    const orbitalPlaneMat = new THREE.MeshBasicMaterial({ color: 0x339933, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const orbitalPlane = new THREE.Mesh(orbitalPlaneGeo, orbitalPlaneMat);
    orbitalPlane.name = 'orbitalPlane';
    pitch.add(orbitalPlane);

    // ellipse
    let f = orbitState.a * orbitState.e;
    let b = Math.sqrt(orbitState.a * orbitState.a - f * f);
    const path = new THREE.Shape();
    path.absellipse(0, 0, orbitState.a, b, 0, 2 * Math.PI, false, 0);
    const geometry = new THREE.ShapeBufferGeometry(path, ORBIT_POINTS_COUNT);
    const material = new THREE.MeshBasicMaterial({ color: "#"+orbitColor, side: THREE.DoubleSide });
    const ellipse = new THREE.Mesh(geometry, material);
    ellipse.name = 'ellipse';

    ellipse.position.sub(ellipse.position);
    ellipse.rotation.z = radians(orbitState.o);

    ellipse.translateX(-f);
    orbitalPlane.add(ellipse); // important

    return root;
}

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
    showEcliptic: true,
    newOrbit: function () {
        let orbitName = genRanHex(6);
        let folderName = "Orbit " + orbitName;
        let newFolder = gui.addFolder(folderName);
        let newOrbitState: OrbitState = {
            a: Math.random() * 9 + 1,
            e: Math.random() * (1 - 1e-7),
            i: Math.random() * 360,
            O: Math.random() * 360,
            o: Math.random() * 360,
            theta: 0.0,
            showGuides: true,
            showOrbitalPlane: true,
            remove: function () {
                let orbitStateIndex = state.orbitStates.indexOf(newOrbitState);
                state.orbitStates.splice(orbitStateIndex, 1); // remove that orbit state

                let orbitIndex = scene.children.indexOf(newOrbit);
                scene.children.splice(orbitIndex, 1);
                newFolder.destroy();
                render();
                // console.log('state.orbits.length', state.orbits.length);
            }
        };
        state.orbitStates.push(newOrbitState);
        let newOrbit = createOrbit(newOrbitState, orbitName);
        newFolder.add(newOrbitState, 'a', 0).onChange(() => {
            let ellipse = newOrbit.getObjectByName('ellipse') as THREE.Mesh;
            orbitShapeHandler(ellipse, newOrbitState.a, newOrbitState.e, radians(newOrbitState.o));
            render();
        });
        newFolder.add(newOrbitState, 'e', 0, 1 - 1e-7).onChange(() => {
            let ellipse = newOrbit.getObjectByName('ellipse') as THREE.Mesh;
            orbitShapeHandler(ellipse, newOrbitState.a, newOrbitState.e, radians(newOrbitState.o));
            render();
        });
        newFolder.add(newOrbitState, 'i', 0, 360).onChange((e: number) => {
            let pitchAngle = newOrbit.getObjectByName('pitchAngle') as THREE.LineLoop;
            let pitch = newOrbit.getObjectByName('pitch') as THREE.Object3D;
            const i = radians(90 - e);
            // pitch indicator
            const pitchAngleCurve = new THREE.EllipseCurve(
                0, 0,
                2, 2,
                0, Math.PI / 2.0 - i,
                false,
                0);
            let points = pitchAngleCurve.getPoints(50);
            points.push(new THREE.Vector2(0.0, 0.0));
            pitchAngle.geometry.setFromPoints(points);
            pitch.rotation.x = -i;
            render();
        })
        newFolder.add(newOrbitState, 'O', 0, 360).name("\u03A9").onChange((e: number) => {
            let yawAngle = newOrbit.getObjectByName('yawAngle') as THREE.LineLoop;
            let yaw = newOrbit.getObjectByName('yaw') as THREE.Object3D;
            let O = radians(e);
            // yaw indicator
            const yawAngleCurve = new THREE.EllipseCurve(
                0, 0,
                2, 2,
                0, 0,
                false,
                0);
            yawAngleCurve.aEndAngle = O;
            let points = yawAngleCurve.getPoints(50);
            points.push(new THREE.Vector2(0.0, 0.0));
            yawAngle.geometry.setFromPoints(points);
            yaw.rotation.y = O;
            render();
        })
        newFolder.add(newOrbitState, 'o', 0, 360).name("\u03C9").onChange((e: number) => {
            let periapsisAngle = newOrbit.getObjectByName('periapsisAngle') as THREE.LineLoop;
            let ellipse = newOrbit.getObjectByName('ellipse') as THREE.Object3D;
            let o = radians(e);
            let f = newOrbitState.a * newOrbitState.e;
            const periapsisAngleCurve = new THREE.EllipseCurve(
                0, 0,
                2, 2,
                0, o,
                false,
                0);
            let points = periapsisAngleCurve.getPoints(50);
            points.push(new THREE.Vector2(0.0, 0.0));
            periapsisAngle.geometry.setFromPoints(points);


            ellipse.position.sub(ellipse.position);
            ellipse.rotation.z = o;
            ellipse.translateX(-f);
            render();
        });
        // state.orbits.push(newOrbit);
        newFolder.add(newOrbitState, 'showGuides').name('Show guides').onChange((e: boolean) => {
            ((newOrbit.getObjectByName('periapsisAngle') as THREE.LineLoop).material as THREE.Material).visible = e;
            ((newOrbit.getObjectByName('yawAngle') as THREE.LineLoop).material as THREE.Material).visible = e;
            ((newOrbit.getObjectByName('pitchAngle') as THREE.LineLoop).material as THREE.Material).visible = e;
            render();
        });
        newFolder.add(newOrbitState, 'showOrbitalPlane').name('Show orbital plane').onChange((e: boolean) => {
            ((newOrbit.getObjectByName('orbitalPlane') as THREE.Mesh).material as THREE.Material).visible = e;
            render();
        });
        newFolder.add(newOrbitState, 'remove').name("Remove");
        scene.add(newOrbit);
        render();
        // console.log('state.orbits.length', state.orbits.length)
    },
    orbitStates: [] as OrbitState[],
    orbits: [] as THREE.Object3D[],
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

const planetNames: { [key: string]: string } = {
    Sun: "sol",
    Moon: "lun",
    Earth: "ter",
    Saturn: "sat",
}
const gui = new GUI();
gui.add(state, 'planet', planetNames).onChange((e: string) => {
    createPlanet(celestialBody, e);
}).name('Planet');
gui.add(state, 'newOrbit').name('New orbit!')
gui.add(state, 'showEcliptic').name('Show plane').onChange((e: boolean) => {
    ecliptic.visible = e;
    render();
})
// const kepler = gui.addFolder('Keplerian elements');
// kepler.add(state, 'a').min(0).step(0.1).onChange(render);
// kepler.add(state, 'e', 0, 1-1e-7).onChange(render);
// kepler.add(state, 'i', 0, 360).onChange(render);
// kepler.add(state, 'O', 0, 360).onChange(render).name("\u03A9");
// kepler.add(state, 'o', 0, 360).onChange(render).name("\u03C9");
const canvas: HTMLCanvasElement = document.querySelector("#canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas });
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);

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

// the invariable plane
const planeGeom = new THREE.PlaneGeometry(25, 25);
planeGeom.rotateX(-Math.PI * 0.5); // this is how you can do it
const planeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
const ecliptic = new THREE.Mesh(planeGeom, planeMat);
scene.add(ecliptic);

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


    renderer.render(scene, camera);
}
controls.addEventListener('change', render);
window.addEventListener('resize', render);
render();

function createPlanet(celestialBody: THREE.Object3D, planet: string) {
    celestialBody.children.length = 0; // remove all children by letting the GC do its thing
    celestialBody.add(planets[planet]);
    render();
}