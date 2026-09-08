const fs = require('fs');
let code = fs.readFileSync('src/components/3d/modelBuilder.ts', 'utf8');

const helperStr = `
  function createWardrobe(wWidth: number, wHeight: number, wDepth: number) {
    const wardrobeGroup = new THREE.Group();
    
    // Main Carcass
    const wCarcassGeo = new THREE.BoxGeometry(wWidth, wHeight, wDepth);
    const wCarcassMesh = new THREE.Mesh(wCarcassGeo, materials.cabinetMaterial || materials.interiorWallMaterial);
    wCarcassMesh.position.set(0, 0, 0);
    wCarcassMesh.castShadow = true;
    wardrobeGroup.add(wCarcassMesh);

    // Wardrobe Doors
    const wDoorGeo = new THREE.BoxGeometry(wWidth * 0.48, wHeight - 0.1, 0.02);
    const wDoorMat = materials.cabinetMaterial || materials.interiorWallMaterial;
    
    const wDoorL = new THREE.Mesh(wDoorGeo, wDoorMat);
    wDoorL.position.set(-wWidth / 4, 0, wDepth / 2 + 0.01);
    
    const wDoorR = new THREE.Mesh(wDoorGeo, wDoorMat);
    wDoorR.position.set(wWidth / 4, 0, wDepth / 2 + 0.01);
    wardrobeGroup.add(wDoorL, wDoorR);

    // Minimalist Vertical Handles
    const wHandleGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.6, 8);
    const wHandleMat = materials.metalTrimMaterial;
    const wHandL = new THREE.Mesh(wHandleGeo, wHandleMat);
    wHandL.position.set(-0.03, 0, wDepth / 2 + 0.03);
    const wHandR = new THREE.Mesh(wHandleGeo, wHandleMat);
    wHandR.position.set(0.03, 0, wDepth / 2 + 0.03);
    wardrobeGroup.add(wHandL, wHandR);

    return wardrobeGroup;
  }
`;

// Insert the helper function right before createDetailedBedSuite
code = code.replace("  function createDetailedBedSuite(", helperStr + "\n  function createDetailedBedSuite(");

// Remove the inline wardrobe creation
const wardrobeStart = code.indexOf("// Custom Built-In Wardrobe / Storage Closet");
const wardrobeEnd = code.indexOf("bathPodGroup.add(wardrobeGroup);") + "bathPodGroup.add(wardrobeGroup);".length;
if (wardrobeStart > -1 && wardrobeEnd > -1) {
  code = code.substring(0, wardrobeStart) + code.substring(wardrobeEnd);
}

fs.writeFileSync('src/components/3d/modelBuilder.ts', code);
