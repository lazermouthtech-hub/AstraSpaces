const fs = require('fs');
let code = fs.readFileSync('src/components/3d/modelBuilder.ts', 'utf8');

const replacement = `
  // 4. FRONT FACADE & PANORAMIC GLAZING
  // Split front into Door frame + Large panoramic glass panels
  const glassHeight = height - 0.25;
  const doorWidth = 0.95;

  let doorX = length / 2 - doorWidth / 2 - 0.15; // Default right side (studio)
  if (state.modelId === 'one-bedroom') {
    // Place door in the living area (left side)
    doorX = -length / 2 + doorWidth / 2 + 0.15;
  } else if (state.modelId === 'two-bedroom') {
    // Place door in the central living area
    doorX = 0;
  }

  // Front Wall Framing Header
  const frontHeaderGeo = new THREE.BoxGeometry(length, 0.25, wallThickness);
  const frontHeaderMesh = new THREE.Mesh(frontHeaderGeo, materials.wallMaterial);
  frontHeaderMesh.position.set(0, height + 0.15 - 0.125, depth / 2 - wallThickness / 2);
  frontWallGroup.add(frontHeaderMesh);

  // Entrance Door
  const doorGeo = new THREE.BoxGeometry(doorWidth, glassHeight, 0.06);
  const doorMesh = new THREE.Mesh(doorGeo, materials.chassisMaterial);
  doorMesh.position.set(doorX, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
  frontWallGroup.add(doorMesh);

  // Door Glass Insert
  const doorGlassGeo = new THREE.BoxGeometry(doorWidth * 0.7, glassHeight * 0.75, 0.04);
  const doorGlassMesh = new THREE.Mesh(doorGlassGeo, materials.glassMaterial);
  doorGlassMesh.position.set(doorX, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2 + 0.01);
  frontWallGroup.add(doorGlassMesh);

  // Smart Door Lock & Handle
  if (state.hasSmartDoorLock) {
    const lockPadGeo = new THREE.BoxGeometry(0.06, 0.2, 0.04);
    const lockPadMesh = new THREE.Mesh(lockPadGeo, materials.ledStripMaterial);
    const lockOffset = (state.modelId === 'one-bedroom') ? 0.4 : -0.4; // Handle on appropriate side
    lockPadMesh.position.set(doorX + lockOffset, 1.2, depth / 2 + 0.02);
    frontWallGroup.add(lockPadMesh);
  }

  // Front Panoramic Glass Curtain Wall
  // We need to fill the space on the left and right of the door
  const leftSpace = (doorX - doorWidth / 2) - (-length / 2 + 0.15);
  if (leftSpace > 0.1) {
    const glassLeftGeo = new THREE.BoxGeometry(leftSpace, glassHeight, 0.04);
    const glassLeftMesh = new THREE.Mesh(glassLeftGeo, materials.glassMaterial);
    glassLeftMesh.position.set(-length / 2 + 0.15 + leftSpace / 2, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
    glassLeftMesh.castShadow = false;
    glassLeftMesh.receiveShadow = true;
    frontWallGroup.add(glassLeftMesh);
    
    // Add mullion
    const mullionMat = materials.chassisMaterial;
    if (leftSpace > 1.5) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.04, glassHeight, 0.06), mullionMat);
      mullion.position.set(-length / 2 + 0.15 + leftSpace / 2, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
      frontWallGroup.add(mullion);
    }
  }

  const rightSpace = (length / 2 - 0.15) - (doorX + doorWidth / 2);
  if (rightSpace > 0.1) {
    const glassRightGeo = new THREE.BoxGeometry(rightSpace, glassHeight, 0.04);
    const glassRightMesh = new THREE.Mesh(glassRightGeo, materials.glassMaterial);
    glassRightMesh.position.set(doorX + doorWidth / 2 + rightSpace / 2, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
    glassRightMesh.castShadow = false;
    glassRightMesh.receiveShadow = true;
    frontWallGroup.add(glassRightMesh);
    
    // Add mullion
    const mullionMat = materials.chassisMaterial;
    if (rightSpace > 1.5) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.04, glassHeight, 0.06), mullionMat);
      mullion.position.set(doorX + doorWidth / 2 + rightSpace / 2, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
      frontWallGroup.add(mullion);
    }
  }
`;

const startIdx = code.indexOf("  // 4. FRONT FACADE & PANORAMIC GLAZING");
const endIdx = code.indexOf("  // Motorized Blinds/Curtains (if enabled)");

if (startIdx > -1 && endIdx > -1) {
  code = code.substring(0, startIdx) + replacement + "\n" + code.substring(endIdx);
  fs.writeFileSync('src/components/3d/modelBuilder.ts', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find insertion points");
}
