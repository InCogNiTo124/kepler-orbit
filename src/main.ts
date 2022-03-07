import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import sunTextureMap from '../textures/2k_sun.jpg';

import GUI from 'lil-gui'

            const state = {
                a: 2.0, // semi-major axis (units)
                e: 0.1, // eccentricity (scalar)
                i: 0.0, // inclination (radians)
                O: 0.0, // RAAN (radians)
                o: 0.0, // AoP (radians)
                theta: 0.0, // True anomaly (radians)
                planet: "earth",
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
            const gui = new GUI();
            //const settings = gui.addFolder('Settings');
            //settings.add(state, 'planet', ["earth", "sun", "moon", "jupiter", "saturn"]);
            //settings.add(state, 'angles', ['radians', 'degrees', 'pi radians']);
            //settings.add(state, 'distances', ['kilometers', 'AU', 'miles']);
            //settings.close(); // settings are closed at first
            const kepler = gui.addFolder('Keplerian elements');
            kepler.add(state, 'a').min(0).step(0.1).onChange(render);
            kepler.add(state, 'e', 0, 1-1e-7).onChange(render);
            kepler.add(state, 'i', 0, 360).onChange(render);
            kepler.add(state, 'O', 0, 360).onChange(render).name("\u03A9");
            kepler.add(state, 'o', 0, 360).onChange(render).name("\u03C9");
            //kepler.add(state, 'O', 0, 360).listen();
            //kepler.add(state, 'o', 0, 360).listen();
            //kepler.add(state, 'theta', 0, 360).listen();
            //const position = gui.addFolder('Position (xyz)');
            //position.add(state, 'pos_x').listen();
            //position.add(state, 'pos_y').listen();
            //position.add(state, 'pos_z').listen();
            //const velocity_xyz = gui.addFolder('Velocity (xyz)');
            //velocity_xyz.add(state, 'vel_x').listen();
            //velocity_xyz.add(state, 'vel_y').listen();
            //velocity_xyz.add(state, 'vel_z').listen();
            //const velocity_polar = gui.addFolder('Velocity (polar)');
            //velocity_polar.add(state, 'v').listen();
            //velocity_polar.add(state, 'arg_x').listen();
            //velocity_polar.add(state, 'arg_y').listen();
            //gui.onChange(event => {render();});

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

            // yaw angle indicator
            const yawAngleCurve = new THREE.EllipseCurve(
                0, 0,
                2, 2,
                0, 0,
                false,
                0);
            const yawAngleGeometry = new THREE.BufferGeometry();
            const yawAngleMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
            const yawAngle = new THREE.LineLoop(yawAngleGeometry, yawAngleMaterial);
            yawAngle.rotation.x = -Math.PI / 2.0;
            scene.add(yawAngle);

            const yaw = new THREE.Object3D();
            const pitch = new THREE.Object3D();
            yaw.add(pitch);
            scene.add(yaw);

            // pitch angle indicator
            const pitchAngleCurve = new THREE.EllipseCurve(
                0, 0,
                2, 2,
                0, 0,
                false,
                0);
            const pitchAngleGeometry = new THREE.BufferGeometry();
            const pitchAngleMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
            const pitchAngle = new THREE.LineLoop(pitchAngleGeometry, pitchAngleMaterial);
            pitchAngle.rotation.y = Math.PI / 2.0;
            yaw.add(pitchAngle);

            // periapsis indicator
            const periapsisAngleCurve = new THREE.EllipseCurve(
                0, 0,
                2, 2,
                0, 0,
                false,
                0);
            const periapsisAngleGeometry = new THREE.BufferGeometry();
            const periapsisAngleMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
            const periapsisAngle = new THREE.LineLoop(periapsisAngleGeometry, periapsisAngleMaterial);
//             periapsisAngle.rotation.y = Math.PI / 2.0;
            pitch.add(periapsisAngle);

            // orbital plane
            const orbitalPlaneGeo = new THREE.PlaneGeometry(25, 25);
            const orbitalPlaneMat = new THREE.MeshBasicMaterial({color: 0x339933, transparent: true, opacity: 0.2, side: THREE.DoubleSide});
            const orbitalPlane = new THREE.Mesh(orbitalPlaneGeo, orbitalPlaneMat);
            pitch.add(orbitalPlane);

            // ellipse
            const path = new THREE.Shape();
            path.absellipse(0, 0, 4, 2, 0, 2*Math.PI, false, 0);
            const geometry = new THREE.ShapeBufferGeometry(path, 30);
            const material = new THREE.MeshBasicMaterial({color: 0x3f7b9d, side: THREE.DoubleSide});
            const ellipse = new THREE.Mesh(geometry, material);
            orbitalPlane.add( ellipse ); // important

//             const helper = new THREE.PlaneHelper( ellipse, 1, 0xffff00 );
//             scene.add(helper)

            // the invariable plane
            const planeGeom = new THREE.PlaneGeometry(25, 25);
            planeGeom.rotateX(-Math.PI * 0.5); // this is how you can do it
            const planeMat = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide});
            const plane = new THREE.Mesh(planeGeom, planeMat);
            scene.add(plane);


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

                const a = state.a;
                const e = state.e;
                const i = (90 - state.i) * 2*Math.PI / 360.0;
                const O = state.O * 2*Math.PI / 360.0;
                const o = state.o * 2*Math.PI / 360.0;
                const f = a*e;

                const b = Math.sqrt(a*a - f*f);
                const path = new THREE.Shape();
                path.absellipse(0, 0, a, b, 0, 2*Math.PI, false, 0);
                const geometry = new THREE.ShapeBufferGeometry(path, 30);
                ellipse.geometry = geometry;
                /* */
                yaw.rotation.y = O;
                pitch.rotation.x = -i;
//                 ellipse.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), O);
//                 ellipse.rotation.x = i;
//                 orbitalPlane.rotation.y = O;
//                 orbitalPlane.rotation.x = i;
//                 ellipse.setRotationFromEuler(new THREE.Euler(O, i, 0, 'YXZ'));
                ellipse.position.sub(ellipse.position);
                ellipse.rotation.z = o;
                ellipse.translateX(-f);

                // yaw indicator
                yawAngleCurve.aEndAngle = O;
                let points = yawAngleCurve.getPoints(50);
                points.push(new THREE.Vector2(0.0, 0.0));
                yawAngle.geometry.setFromPoints(points);

                // pitch indicator
                pitchAngleCurve.aEndAngle = Math.PI/2.0 - i;
                let points2 = pitchAngleCurve.getPoints(50);
                points2.push(new THREE.Vector2(0.0, 0.0));
                pitchAngle.geometry.setFromPoints(points2);

                // pitch indicator
                periapsisAngleCurve.aEndAngle = o;
                let points3 = periapsisAngleCurve.getPoints(50);
                points3.push(new THREE.Vector2(0.0, 0.0));
                periapsisAngle.geometry.setFromPoints(points3);


                renderer.render( scene, camera );
            }

            [ellipse, plane, orbitalPlane].forEach((node) => {
                const axes = new THREE.AxesHelper();
                (axes.material as THREE.Material).depthTest = false;
                axes.renderOrder = 1;
                node.add(axes);
            });
            controls.addEventListener('change', render);
            window.addEventListener('resize', render);
            render();
