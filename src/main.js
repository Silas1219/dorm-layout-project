import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRoom } from './scene/room.js';
import { renderFurniture } from './scene/furniture3D.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 4, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const layout = {
  room: { width: 4, depth: 5 },
  furniture: [
    { id: "bed1", type: "bed", x: -1, z: 1, width: 1, depth: 2, height: 0.5, rotation: 0 },
    { id: "desk1", type: "desk", x: 1, z: 1, width: 1.2, depth: 0.6, height: 0.75, rotation: 90 }
  ]
};

const conflictIds = []; 
createRoom(scene, layout.room);
renderFurniture(scene, layout.furniture, conflictIds);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();