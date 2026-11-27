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

import layout from '../sample-layout.json';

const conflictIds = []; 
createRoom(scene, layout.room);
renderFurniture(scene, layout.furniture, conflictIds);

const furnitureList = document.createElement('aside');
furnitureList.style.cssText =
  'position: fixed; top: 16px; left: 16px; padding: 12px; background: white;';

const title = document.createElement('strong');
title.textContent = 'Furniture List';

const list = document.createElement('ul');
for (const item of layout.furniture) {
  const row = document.createElement('li');
  row.textContent = `${item.id} · ${item.width} × ${item.depth} × ${item.height} m`;
  list.append(row);
}

furnitureList.append(title, list);
document.body.append(furnitureList);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();