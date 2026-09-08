  if (state.hasLuxuryBathPod) {
    const bathPodW = 1.4;
    const bathPodD = 1.8;
    const bathPodGroup = new THREE.Group();

    // Enclosing interior partition walls
    // Side wall
    const sideWallGeo = new THREE.BoxGeometry(0.1, height - 0.1, bathPodD);
    const sideWallMesh = new THREE.Mesh(sideWallGeo, materials.interiorWallMaterial);
    sideWallMesh.position.set(bathOriginX + bathPodW, (height - 0.1) / 2 + 0.15, -depth / 2 + bathPodD / 2 + 0.05);
    sideWallMesh.castShadow = true;
    
    // Front wall (partial, leaving 0.7m for door)
    const frontWallGeo = new THREE.BoxGeometry(bathPodW - 0.7, height - 0.1, 0.1);
    const frontWallMesh = new THREE.Mesh(frontWallGeo, materials.interiorWallMaterial);
    frontWallMesh.position.set(bathOriginX + (bathPodW - 0.7) / 2, (height - 0.1) / 2 + 0.15, -depth / 2 + bathPodD);
    frontWallMesh.castShadow = true;

    bathPodGroup.add(sideWallMesh, frontWallMesh);

    // Shower Area (0.8 x 0.8 corner)
    const showerTrayGeo = new THREE.BoxGeometry(0.8, 0.05, 0.8);
    const showerTray = new THREE.Mesh(showerTrayGeo, materials.chassisMaterial);
    showerTray.position.set(bathOriginX + 0.4 + 0.05, 0.17, -depth / 2 + 0.4 + 0.05);
    
    // Frameless Glass Shower Cubicle (Front and Side panels)
    const showerGlassMat = materials.glassMaterial;
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(0.8, height - 0.4, 0.02), showerGlassMat);
    glassFront.position.set(bathOriginX + 0.4 + 0.05, height / 2, -depth / 2 + 0.8 + 0.05);
    const glassSide = new THREE.Mesh(new THREE.BoxGeometry(0.02, height - 0.4, 0.8), showerGlassMat);
    glassSide.position.set(bathOriginX + 0.8 + 0.05, height / 2, -depth / 2 + 0.4 + 0.05);
    
    // Rainfall Showerhead
    const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), materials.metalTrimMaterial);
    showerHead.position.set(bathOriginX + 0.4, height - 0.25, -depth / 2 + 0.4);
    
    bathPodGroup.add(showerTray, glassFront, glassSide, showerHead);

    // Wall-hung modern toilet (Back wall)
    const toiletGroup = new THREE.Group();
    
    // Concealed cistern wall box
    const toiletTankGeo = new THREE.BoxGeometry(0.5, 1.1, 0.15);
    const toiletTank = new THREE.Mesh(toiletTankGeo, materials.interiorWallMaterial);
    toiletTank.position.set(bathOriginX + 1.125, 0.55, -depth / 2 + 0.125);
    
    // Chrome dual-flush plate
    const flushPlateBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.02), materials.metalTrimMaterial);
    flushPlateBase.position.set(bathOriginX + 1.125, 0.85, -depth / 2 + 0.21);
    const flushBtn1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.01), materials.chassisMaterial);
    flushBtn1.position.set(bathOriginX + 1.075, 0.85, -depth / 2 + 0.22);
    const flushBtn2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.01), materials.chassisMaterial);
    flushBtn2.position.set(bathOriginX + 1.155, 0.85, -depth / 2 + 0.22);
    
    // D-shape Ceramic Bowl (Glossy White)
    const bowlFront = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.32, 32), materials.countertopMaterial);
    bowlFront.position.set(bathOriginX + 1.125, 0.34, -depth / 2 + 0.45);
    const bowlBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.25), materials.countertopMaterial);
    bowlBack.position.set(bathOriginX + 1.125, 0.34, -depth / 2 + 0.325);
    
    // Slim soft-close seat/lid (Matte)
    const seatFront = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32), materials.chassisMaterial);
    seatFront.position.set(bathOriginX + 1.125, 0.51, -depth / 2 + 0.45);
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.25), materials.chassisMaterial);
    seatBack.position.set(bathOriginX + 1.125, 0.51, -depth / 2 + 0.325);
    
    toiletGroup.add(toiletTank, flushPlateBase, flushBtn1, flushBtn2, bowlFront, bowlBack, seatFront, seatBack);
    bathPodGroup.add(toiletGroup);

    // Floating Vanity & Sink (Left wall)
    const vanityGroup = new THREE.Group();
    // Wood/Cabinet base
    const vanityBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.7), materials.cabinetMaterial);
    vanityBase.position.set(bathOriginX + 0.22, 0.6, -depth / 2 + 1.35);
    // White Countertop
    const vanityTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.72), materials.countertopMaterial);
    vanityTop.position.set(bathOriginX + 0.22, 0.82, -depth / 2 + 1.35);
    // Vessel Sink
    const sinkBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.1, 24), materials.interiorWallMaterial);
    sinkBowl.position.set(bathOriginX + 0.22, 0.89, -depth / 2 + 1.35);
    // Faucet
    const vanityFaucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), materials.metalTrimMaterial);
    vanityFaucet.position.set(bathOriginX + 0.1, 0.95, -depth / 2 + 1.35);
    vanityFaucet.rotation.z = -Math.PI / 8;
    
    // LED Backlit Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, 0.6), materials.ledStripMaterial);
    mirror.position.set(bathOriginX + 0.06, 1.4, -depth / 2 + 1.35);
    
    vanityGroup.add(vanityBase, vanityTop, sinkBowl, vanityFaucet, mirror);
    bathPodGroup.add(vanityGroup);

    // Custom Built-In Wardrobe / Storage Closet (facing inside the room)
    const wWidth = depth <= 2.5 ? 0.55 : 0.8; // Width of the closet (spans along Z axis)
    const wDepth = 0.6; // Depth of the closet (spans along X axis)
    const wHeight = height - 0.1;
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

    // Rotate wardrobe so its doors (+Z) face into the room (+X)
    wardrobeGroup.rotation.y = Math.PI / 2; 
    
    // Position the wardrobe in the alcove next to the bathroom door
    const wCenterX = bathOriginX + wDepth / 2 + 0.05; 
    const wCenterZ = -depth / 2 + bathPodD + 0.05 + wWidth / 2;
    wardrobeGroup.position.set(wCenterX, wHeight / 2 + 0.15, wCenterZ);

    bathPodGroup.add(wardrobeGroup);

    interiorGroup.add(bathPodGroup);
