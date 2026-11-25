import * as THREE from 'three';

export function createRoom(scene, roomData) {
  const oldRoom = scene.getObjectByName('roomGroup');
  if (oldRoom) scene.remove(oldRoom);

  const roomGroup = new THREE.Group();
  roomGroup.name = 'roomGroup';

  const floorGeo = new THREE.PlaneGeometry(roomData.width, roomData.depth);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = Math.PI / 2; 
  roomGroup.add(floor);

  const grid = new THREE.GridHelper(Math.max(roomData.width, roomData.depth), 10, 0xcccccc, 0xcccccc);
  grid.position.y = 0.01; 
  roomGroup.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  const wallGeo1 = new THREE.PlaneGeometry(roomData.width, 2.5); // 墙高2.5米
  const wall1 = new THREE.Mesh(wallGeo1, wallMat);
  wall1.position.set(0, 1.25, -roomData.depth / 2); // 放在后方
  roomGroup.add(wall1);

  const wallGeo2 = new THREE.PlaneGeometry(roomData.depth, 2.5);
  const wall2 = new THREE.Mesh(wallGeo2, wallMat);
  wall2.rotation.y = Math.PI / 2;
  wall2.position.set(-roomData.width / 2, 1.25, 0); // 放在左侧
  roomGroup.add(wall2);

  scene.add(roomGroup);
}