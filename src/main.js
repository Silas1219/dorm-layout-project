import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRoom } from './scene/room.js';
import { renderFurniture } from './scene/furniture3D.js';
import sampleLayout from '../sample-layout.json';

const layout = structuredClone(sampleLayout);
const conflictIds = [];

const furniturePresets = {
  bed: { label: 'Bed', width: 1, depth: 2, height: 0.5 },
  desk: { label: 'Desk', width: 1.2, depth: 0.6, height: 0.75 },
  cabinet: { label: 'Cabinet', width: 0.8, depth: 0.5, height: 1.6 },
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
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

createRoom(scene, layout.room);

const furnitureList = document.createElement('aside');
furnitureList.style.cssText =
  'position: fixed; top: 16px; left: 16px; padding: 12px; background: white;';

const title = document.createElement('strong');
title.textContent = 'Furniture List';

const list = document.createElement('ul');

const typeLabel = document.createElement('label');
typeLabel.textContent = 'Furniture type ';

const typeSelect = document.createElement('select');
for (const [type, preset] of Object.entries(furniturePresets)) {
  const option = document.createElement('option');
  option.value = type;
  option.textContent = preset.label;
  typeSelect.append(option);
}

typeSelect.value = 'desk';
typeLabel.append(typeSelect);

const addButton = document.createElement('button');
addButton.type = 'button';
addButton.textContent = 'Add furniture';
addButton.style.marginLeft = '8px';

furnitureList.append(title, list, typeLabel, addButton);
document.body.append(furnitureList);

function refreshFurniture() {
  renderFurniture(scene, layout.furniture, conflictIds);
  list.replaceChildren();

  for (const item of layout.furniture) {
    const row = document.createElement('li');
    row.textContent =
      `${item.id} · ${item.width} × ${item.depth} × ${item.height} m`;
    list.append(row);
  }
}

addButton.addEventListener('click', () => {
  const type = typeSelect.value;
  const { width, depth, height } = furniturePresets[type];

  let number = 1;
  while (layout.furniture.some((item) => item.id === `${type}${number}`)) {
    number += 1;
  }

  layout.furniture.push({
    id: `${type}${number}`,
    type,
    x: 0,
    z: 0,
    width,
    depth,
    height,
    rotation: 0,
  });

  refreshFurniture();
});

refreshFurniture();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();