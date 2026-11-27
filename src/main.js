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

const styles = document.createElement('style');
styles.textContent = `
  .layout-editor {
    display: grid;
    grid-template-columns: 290px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    height: 100dvh;
  }

  .furniture-panel {
    box-sizing: border-box;
    min-width: 0;
    overflow: auto;
    padding: 16px;
    background: white;
  }

  .furniture-panel ul {
    padding-left: 22px;
    overflow-wrap: anywhere;
  }

  .furniture-panel li + li {
    margin-top: 8px;
  }

  .furniture-panel form {
    display: grid;
    gap: 8px;
  }

  .furniture-panel input {
    width: 80px;
  }

  .scene-viewport {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .scene-viewport canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 700px) {
    .layout-editor {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto 60dvh;
      height: auto;
    }

    .furniture-panel {
      max-height: 40dvh;
    }
  }
`;
document.head.append(styles);
document.body.style.margin = '0';
document.body.style.overflow = 'auto';

const app = document.querySelector('#app');
app.classList.add('layout-editor');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(4, 4, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
const viewport = document.createElement('div');
viewport.className = 'scene-viewport';
viewport.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

createRoom(scene, layout.room);

const furniturePanel = document.createElement('aside');
furniturePanel.className = 'furniture-panel';
furniturePanel.innerHTML = `
  <strong>Furniture List</strong>
  <ul></ul>

  <form>
    <label>
      Furniture type
      <select name="furnitureType"></select>
    </label>

    <label>
      Width (m)
      <input name="width" type="number" min="0" step="any" required>
    </label>

    <label>
      Depth (m)
      <input name="depth" type="number" min="0" step="any" required>
    </label>

    <label>
      Height (m)
      <input name="height" type="number" min="0" step="any" required>
    </label>

    <button type="submit">Add furniture</button>
    <button type="button" hidden>Cancel edit</button>
  </form>
`;

const list = furniturePanel.querySelector('ul');
const form = furniturePanel.querySelector('form');
const typeSelect = form.elements.namedItem('furnitureType');
const submitButton = form.querySelector('button[type="submit"]');
const cancelButton = form.querySelector('button[type="button"]');
const dimensionInputs = ['width', 'depth', 'height'].map(
  (name) => form.elements.namedItem(name),
);

let editingId = null;

for (const [type, preset] of Object.entries(furniturePresets)) {
  const option = document.createElement('option');
  option.value = type;
  option.textContent = preset.label;
  typeSelect.append(option);
}

typeSelect.value = 'desk';
app.append(furniturePanel, viewport);

const viewportObserver = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  if (width < 1 || height < 1) return;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

viewportObserver.observe(viewport);

function fillDimensions(values) {
  for (const input of dimensionInputs) {
    input.setCustomValidity('');
    input.value = values[input.name];
  }
}

function finishEditing() {
  editingId = null;
  typeSelect.disabled = false;
  submitButton.textContent = 'Add furniture';
  cancelButton.hidden = true;
  fillDimensions(furniturePresets[typeSelect.value]);
}

function refreshFurniture() {
  renderFurniture(scene, layout.furniture, conflictIds);
  list.replaceChildren();

  for (const item of layout.furniture) {
    const row = document.createElement('li');

    const label = document.createElement('span');
    label.textContent =
      `${item.id} · ${item.width} × ${item.depth} × ${item.height} m`;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.setAttribute('aria-label', `Edit ${item.id}`);
    editButton.addEventListener('click', () => {
      editingId = item.id;
      typeSelect.value = item.type;
      typeSelect.disabled = true;
      submitButton.textContent = `Save ${item.id}`;
      cancelButton.hidden = false;
      fillDimensions(item);
      dimensionInputs[0].focus();
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${item.id}`);
    removeButton.addEventListener('click', () => {
      layout.furniture = layout.furniture.filter(
        (furniture) => furniture.id !== item.id,
      );

      if (editingId === item.id) {
        finishEditing();
      }

      refreshFurniture();
    });

    const actions = document.createElement('div');
    actions.append(editButton, ' ', removeButton);

    row.append(label, actions);
    list.append(row);
  }
}

typeSelect.addEventListener('change', () => {
  fillDimensions(furniturePresets[typeSelect.value]);
});

cancelButton.addEventListener('click', finishEditing);

for (const input of dimensionInputs) {
  input.addEventListener('input', () => {
    input.setCustomValidity('');
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const values = {};

  for (const input of dimensionInputs) {
    const value = input.valueAsNumber;

    if (!Number.isFinite(value) || value <= 0) {
      input.setCustomValidity('Enter a dimension greater than zero.');
      input.reportValidity();
      return;
    }

    values[input.name] = value;
  }

  if (editingId !== null) {
    const item = layout.furniture.find((furniture) => furniture.id === editingId);

    if (item) {
      Object.assign(item, values);
    }

    finishEditing();
  } else {
    const type = typeSelect.value;
    let number = 1;

    while (layout.furniture.some((item) => item.id === `${type}${number}`)) {
      number += 1;
    }

    layout.furniture.push({
      id: `${type}${number}`,
      type,
      x: 0,
      z: 0,
      rotation: 0,
      ...values,
    });
  }

  refreshFurniture();
});

finishEditing();
refreshFurniture();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();