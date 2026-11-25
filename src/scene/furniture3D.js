import * as THREE from 'three';

export function renderFurniture(scene, furnitureData, conflictIds = []) {
  const oldFurniture = scene.getObjectByName('furnitureGroup');
  if (oldFurniture) scene.remove(oldFurniture);

  const furnitureGroup = new THREE.Group();
  furnitureGroup.name = 'furnitureGroup';

    furnitureData.forEach(item => {
    const geo = new THREE.BoxGeometry(item.width, item.height, item.depth);
    
    let color = 0x4CAF50; 
    if (conflictIds.includes(item.id)) color = 0xff0000;
    else if (item.type === 'bed') color = 0x8B4513; 
    else if (item.type === 'desk') color = 0xFFC107;

    const mat = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    mesh.add(line);
    if (item.type === 'bed' && !conflictIds.includes(item.id)) {
      const pillowGeo = new THREE.BoxGeometry(item.width * 0.8, 0.1, item.depth * 0.2);
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      
      pillow.position.set(0, item.height / 2 + 0.05, -item.depth / 2 + 0.3);
      mesh.add(pillow);
      
      const pEdges = new THREE.EdgesGeometry(pillowGeo);
      const pLine = new THREE.LineSegments(pEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
      pillow.add(pLine);
    }

    mesh.position.set(item.x, item.height / 2, item.z);
    mesh.rotation.y = THREE.MathUtils.degToRad(item.rotation);
    mesh.userData = item;

    furnitureGroup.add(mesh);
  });

  scene.add(furnitureGroup);
}