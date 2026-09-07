import * as THREE from 'three';
import { CustomizationState, LightingMode, ModelSpecification } from '../../types';
import { MaterialLibrary } from './materials';

export interface BuiltHomeModel {
  rootGroup: THREE.Group;
  roofGroup: THREE.Group;
  frontWallGroup: THREE.Group;
  interiorGroup: THREE.Group;
  solarGroup: THREE.Group;
  terraceGroup: THREE.Group;
  pergolaGroup: THREE.Group;
  interiorLights: THREE.PointLight[];
  hotspotPositions: {
    walls: THREE.Vector3;
    glazing: THREE.Vector3;
    lighting: THREE.Vector3;
    flooring: THREE.Vector3;
    roof: THREE.Vector3;
    kitchenette: THREE.Vector3;
    bath: THREE.Vector3;
    bedroom: THREE.Vector3;
    living: THREE.Vector3;
  };
}

export function buildHomeModel(
  state: CustomizationState,
  materials: MaterialLibrary,
  lightingMode: LightingMode,
  currentModelSpec?: ModelSpecification | any
): BuiltHomeModel {
  const rootGroup = new THREE.Group();
  const roofGroup = new THREE.Group();
  const frontWallGroup = new THREE.Group();
  const interiorGroup = new THREE.Group();
  const solarGroup = new THREE.Group();
  const terraceGroup = new THREE.Group();
  const pergolaGroup = new THREE.Group();
  const interiorLights: THREE.PointLight[] = [];

  // Dimensions based on model
  // Scale: 1 unit = 1 meter
  // Studio (20ft cabin): ~5.8m long (X), 2.4m wide (Z), 2.5m high (Y)
  // 1-Bed: ~6.0m long (X), 5.4m wide (Z), 2.6m high (Y)
  // 2-Bed: ~9.2m long (X), 5.4m wide (Z), 2.6m high (Y)

  let length = 5.8;
  let depth = 2.4;
  let height = 2.5;

  if (state.modelId === 'one-bedroom') {
    length = 6.2;
    depth = 5.4;
    height = 2.6;
  } else if (state.modelId === 'two-bedroom') {
    length = 9.4;
    depth = 5.4;
    height = 2.6;
  }

  const wallThickness = 0.12;
  const chassisBeamSize = 0.14;

  // 1. CHASSIS & BASE PLATFORM
  const chassisGroup = new THREE.Group();

  // Bottom Base Slab
  const subfloorGeo = new THREE.BoxGeometry(length, 0.15, depth);
  const subfloorMesh = new THREE.Mesh(subfloorGeo, materials.chassisMaterial);
  subfloorMesh.position.y = 0.075;
  subfloorMesh.receiveShadow = true;
  chassisGroup.add(subfloorMesh);

  // Structural corner pillars (Apple Cabin signature rounded corner pill)
  const cornerRadius = 0.15;
  const cornerHeight = height;
  const cornerGeo = new THREE.CylinderGeometry(cornerRadius, cornerRadius, cornerHeight, 16);

  const corners = [
    [-length / 2 + cornerRadius, cornerHeight / 2 + 0.15, -depth / 2 + cornerRadius],
    [length / 2 - cornerRadius, cornerHeight / 2 + 0.15, -depth / 2 + cornerRadius],
    [-length / 2 + cornerRadius, cornerHeight / 2 + 0.15, depth / 2 - cornerRadius],
    [length / 2 - cornerRadius, cornerHeight / 2 + 0.15, depth / 2 - cornerRadius],
  ];

  corners.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(cornerGeo, materials.chassisMaterial);
    post.position.set(x, y, z);
    post.castShadow = true;
    post.receiveShadow = true;
    chassisGroup.add(post);
  });

  // Top perimeter beam
  const topRimGeoLong = new THREE.BoxGeometry(length, chassisBeamSize, chassisBeamSize);
  const topRimGeoShort = new THREE.BoxGeometry(chassisBeamSize, chassisBeamSize, depth);

  const topRimFront = new THREE.Mesh(topRimGeoLong, materials.chassisMaterial);
  topRimFront.position.set(0, height + 0.15 - chassisBeamSize / 2, depth / 2 - chassisBeamSize / 2);
  const topRimBack = new THREE.Mesh(topRimGeoLong, materials.chassisMaterial);
  topRimBack.position.set(0, height + 0.15 - chassisBeamSize / 2, -depth / 2 + chassisBeamSize / 2);
  const topRimLeft = new THREE.Mesh(topRimGeoShort, materials.chassisMaterial);
  topRimLeft.position.set(-length / 2 + chassisBeamSize / 2, height + 0.15 - chassisBeamSize / 2, 0);
  const topRimRight = new THREE.Mesh(topRimGeoShort, materials.chassisMaterial);
  topRimRight.position.set(length / 2 - chassisBeamSize / 2, height + 0.15 - chassisBeamSize / 2, 0);

  chassisGroup.add(topRimFront, topRimBack, topRimLeft, topRimRight);
  rootGroup.add(chassisGroup);

  // 2. FLOOR SURFACE (Selected SPC Flooring)
  const floorInnerL = length - wallThickness * 2;
  const floorInnerD = depth - wallThickness * 2;
  const floorGeo = new THREE.PlaneGeometry(floorInnerL, floorInnerD);
  const floorMesh = new THREE.Mesh(floorGeo, materials.floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0.151, 0);
  floorMesh.receiveShadow = true;
  rootGroup.add(floorMesh);

  // 3. EXTERIOR WALLS (Rear & Side Walls)
  const backWallGeo = new THREE.BoxGeometry(length, height, wallThickness);
  const backWallMesh = new THREE.Mesh(backWallGeo, materials.wallMaterial);
  backWallMesh.position.set(0, height / 2 + 0.15, -depth / 2 + wallThickness / 2);
  backWallMesh.castShadow = true;
  backWallMesh.receiveShadow = true;
  rootGroup.add(backWallMesh);

  // Left and Right End Walls
  const sideWallGeo = new THREE.BoxGeometry(wallThickness, height, depth - wallThickness);
  const leftWallMesh = new THREE.Mesh(sideWallGeo, materials.wallMaterial);
  leftWallMesh.position.set(-length / 2 + wallThickness / 2, height / 2 + 0.15, 0);
  leftWallMesh.castShadow = true;
  leftWallMesh.receiveShadow = true;

  const rightWallMesh = new THREE.Mesh(sideWallGeo, materials.wallMaterial);
  rightWallMesh.position.set(length / 2 - wallThickness / 2, height / 2 + 0.15, 0);
  rightWallMesh.castShadow = true;
  rightWallMesh.receiveShadow = true;

  rootGroup.add(leftWallMesh, rightWallMesh);

  // Side accent picture windows (Apple Cabin capsule window)
  const sideWinGeo = new THREE.BoxGeometry(0.14, 1.2, 1.2);
  const rightSideWindow = new THREE.Mesh(sideWinGeo, materials.glassMaterial);
  rightSideWindow.position.set(length / 2 - 0.05, 1.4, 0);
  rootGroup.add(rightSideWindow);

  // 4. FRONT FACADE & PANORAMIC GLAZING
  // Split front into Door frame + Large panoramic glass panels
  const glassHeight = height - 0.25;
  const doorWidth = 0.95;
  const glassWidth = (length - doorWidth) * 0.92;

  // Front Wall Framing Header
  const frontHeaderGeo = new THREE.BoxGeometry(length, 0.25, wallThickness);
  const frontHeaderMesh = new THREE.Mesh(frontHeaderGeo, materials.wallMaterial);
  frontHeaderMesh.position.set(0, height + 0.15 - 0.125, depth / 2 - wallThickness / 2);
  frontWallGroup.add(frontHeaderMesh);

  // Front Panoramic Glass Curtain Wall
  const glassGeo = new THREE.BoxGeometry(glassWidth, glassHeight, 0.04);
  const glassMesh = new THREE.Mesh(glassGeo, materials.glassMaterial);
  glassMesh.position.set(-doorWidth / 2, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
  glassMesh.castShadow = false;
  glassMesh.receiveShadow = true;
  frontWallGroup.add(glassMesh);

  // Architectural mullions for the glass
  const mullionMat = materials.chassisMaterial;
  const mullionV1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, glassHeight, 0.06), mullionMat);
  mullionV1.position.set(-doorWidth / 2 - glassWidth / 4, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
  const mullionV2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, glassHeight, 0.06), mullionMat);
  mullionV2.position.set(-doorWidth / 2 + glassWidth / 4, glassHeight / 2 + 0.15, depth / 2 - wallThickness / 2);
  frontWallGroup.add(mullionV1, mullionV2);

  // Entrance Door
  const doorGeo = new THREE.BoxGeometry(doorWidth, height - 0.25, 0.06);
  const doorMesh = new THREE.Mesh(doorGeo, materials.chassisMaterial);
  doorMesh.position.set(length / 2 - doorWidth / 2 - 0.15, (height - 0.25) / 2 + 0.15, depth / 2 - wallThickness / 2);
  frontWallGroup.add(doorMesh);

  // Door Glass Insert
  const doorGlassGeo = new THREE.BoxGeometry(doorWidth * 0.7, (height - 0.25) * 0.75, 0.04);
  const doorGlassMesh = new THREE.Mesh(doorGlassGeo, materials.glassMaterial);
  doorGlassMesh.position.set(length / 2 - doorWidth / 2 - 0.15, (height - 0.25) / 2 + 0.15, depth / 2 - wallThickness / 2 + 0.01);
  frontWallGroup.add(doorGlassMesh);

  // Smart Door Lock & Handle
  if (state.hasSmartDoorLock) {
    const lockPadGeo = new THREE.BoxGeometry(0.06, 0.2, 0.04);
    const lockPadMesh = new THREE.Mesh(lockPadGeo, materials.ledStripMaterial);
    lockPadMesh.position.set(length / 2 - doorWidth - 0.05, 1.2, depth / 2 + 0.02);
    frontWallGroup.add(lockPadMesh);
  }

  // Motorized Blinds (if enabled)
  if (state.hasElectricBlinds) {
    const blindsGeo = new THREE.BoxGeometry(glassWidth, glassHeight * 0.7, 0.02);
    const blindsMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.8,
    });
    const blindsMesh = new THREE.Mesh(blindsGeo, blindsMat);
    blindsMesh.position.set(-doorWidth / 2, glassHeight / 2 + 0.3, depth / 2 - wallThickness / 2 - 0.03);
    frontWallGroup.add(blindsMesh);
  }

  rootGroup.add(frontWallGroup);

  // 5. ROOF ASSEMBLY (Parapet Flat Roof)
  const roofThickness = 0.22;
  const roofSlabGeo = new THREE.BoxGeometry(length + 0.15, roofThickness, depth + 0.15);
  const roofSlabMesh = new THREE.Mesh(roofSlabGeo, materials.roofMaterial);
  roofSlabMesh.position.set(0, height + 0.15 + roofThickness / 2, 0);
  roofSlabMesh.castShadow = true;
  roofSlabMesh.receiveShadow = true;
  roofGroup.add(roofSlabMesh);

  // Roof Soffit LED Glow Trim
  if (state.lightingPackage === 'halo-strip-ambient' || state.lightingPackage === 'architectural-luxe-smart') {
    const soffitGeoFront = new THREE.BoxGeometry(length + 0.1, 0.03, 0.04);
    const soffitMeshFront = new THREE.Mesh(soffitGeoFront, materials.ledStripMaterial);
    soffitMeshFront.position.set(0, height + 0.13, depth / 2 + 0.06);
    roofGroup.add(soffitMeshFront);
  }

  // 6. ROOF OPTIONS: SOLAR ARRAY & ROOFTOP TERRACE
  if (state.roofOption === 'solar-array-3kw' || state.roofOption === 'solar-deck-combo') {
    const solarCount = state.modelId === 'two-bedroom' ? 6 : state.modelId === 'one-bedroom' ? 4 : 2;
    const panelW = 1.1;
    const panelL = 1.6;
    const panelGeo = new THREE.BoxGeometry(panelW, 0.04, panelL);

    for (let i = 0; i < solarCount; i++) {
      const panelMesh = new THREE.Mesh(panelGeo, materials.solarMaterial);
      const spacingX = panelW + 0.15;
      const startX = -((solarCount - 1) * spacingX) / 2;
      panelMesh.position.set(startX + i * spacingX, height + 0.15 + roofThickness + 0.04, -depth * 0.1);
      panelMesh.rotation.x = -0.05; // slight sun tilt
      panelMesh.castShadow = true;
      solarGroup.add(panelMesh);
    }
  }

  if (state.roofOption === 'rooftop-terrace-deck' || state.roofOption === 'solar-deck-combo') {
    // Walkable composite decking
    const deckGeo = new THREE.BoxGeometry(length * 0.75, 0.03, depth * 0.8);
    const deckMesh = new THREE.Mesh(deckGeo, materials.woodDeckMaterial);
    deckMesh.position.set(0, height + 0.15 + roofThickness + 0.02, 0);
    terraceGroup.add(deckMesh);

    // Aluminum safety railing posts & top rail
    const railHeight = 0.9;
    const railPostMat = materials.chassisMaterial;
    const railGlassMat = materials.glassMaterial;

    const deckW = length * 0.75;
    const deckD = depth * 0.8;

    // Glass safety guard panels
    const railFrontGeo = new THREE.BoxGeometry(deckW, railHeight, 0.02);
    const railFront = new THREE.Mesh(railFrontGeo, railGlassMat);
    railFront.position.set(0, height + 0.15 + roofThickness + railHeight / 2, deckD / 2);
    terraceGroup.add(railFront);

    const railBack = new THREE.Mesh(railFrontGeo, railGlassMat);
    railBack.position.set(0, height + 0.15 + roofThickness + railHeight / 2, -deckD / 2);
    terraceGroup.add(railBack);

    // Top Handrail
    const handrailGeo = new THREE.BoxGeometry(deckW, 0.04, 0.06);
    const handrailFront = new THREE.Mesh(handrailGeo, railPostMat);
    handrailFront.position.set(0, height + 0.15 + roofThickness + railHeight, deckD / 2);
    terraceGroup.add(handrailFront);

    // Exterior spiral ladder access
    const ladderGeo = new THREE.CylinderGeometry(0.04, 0.04, height + 0.2, 8);
    const ladderPole = new THREE.Mesh(ladderGeo, railPostMat);
    ladderPole.position.set(-length / 2 - 0.25, (height + 0.2) / 2, 0);
    terraceGroup.add(ladderPole);
  }

  roofGroup.add(solarGroup);
  roofGroup.add(terraceGroup);
  rootGroup.add(roofGroup);

  // 7. INTERIOR FITOUT & MODULAR PODS
  // 7a. Integrated Bathroom Pod
  if (state.hasLuxuryBathPod) {
    const bathPodW = 1.4;
    const bathPodD = 1.8;
    const bathPodGroup = new THREE.Group();

    // Enclosing interior partition walls
    // Side wall
    const sideWallGeo = new THREE.BoxGeometry(0.1, height - 0.1, bathPodD);
    const sideWallMesh = new THREE.Mesh(sideWallGeo, materials.interiorWallMaterial);
    sideWallMesh.position.set(-length / 2 + bathPodW, (height - 0.1) / 2 + 0.15, -depth / 2 + bathPodD / 2 + 0.05);
    sideWallMesh.castShadow = true;
    
    // Front wall (partial, leaving 0.7m for door)
    const frontWallGeo = new THREE.BoxGeometry(bathPodW - 0.7, height - 0.1, 0.1);
    const frontWallMesh = new THREE.Mesh(frontWallGeo, materials.interiorWallMaterial);
    frontWallMesh.position.set(-length / 2 + (bathPodW - 0.7) / 2, (height - 0.1) / 2 + 0.15, -depth / 2 + bathPodD);
    frontWallMesh.castShadow = true;

    bathPodGroup.add(sideWallMesh, frontWallMesh);

    // Shower Area (0.8 x 0.8 corner)
    const showerTrayGeo = new THREE.BoxGeometry(0.8, 0.05, 0.8);
    const showerTray = new THREE.Mesh(showerTrayGeo, materials.chassisMaterial);
    showerTray.position.set(-length / 2 + 0.4 + 0.05, 0.17, -depth / 2 + 0.4 + 0.05);
    
    // Frameless Glass Shower Cubicle (Front and Side panels)
    const showerGlassMat = materials.glassMaterial;
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(0.8, height - 0.4, 0.02), showerGlassMat);
    glassFront.position.set(-length / 2 + 0.4 + 0.05, height / 2, -depth / 2 + 0.8 + 0.05);
    const glassSide = new THREE.Mesh(new THREE.BoxGeometry(0.02, height - 0.4, 0.8), showerGlassMat);
    glassSide.position.set(-length / 2 + 0.8 + 0.05, height / 2, -depth / 2 + 0.4 + 0.05);
    
    // Rainfall Showerhead
    const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), materials.metalTrimMaterial);
    showerHead.position.set(-length / 2 + 0.4, height - 0.25, -depth / 2 + 0.4);
    
    bathPodGroup.add(showerTray, glassFront, glassSide, showerHead);

    // Wall-hung modern toilet (Back wall)
    const toiletGroup = new THREE.Group();
    
    // Concealed cistern wall box
    const toiletTankGeo = new THREE.BoxGeometry(0.5, 1.1, 0.15);
    const toiletTank = new THREE.Mesh(toiletTankGeo, materials.interiorWallMaterial);
    toiletTank.position.set(-length / 2 + 1.125, 0.55, -depth / 2 + 0.125);
    
    // Chrome dual-flush plate
    const flushPlateBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.02), materials.metalTrimMaterial);
    flushPlateBase.position.set(-length / 2 + 1.125, 0.85, -depth / 2 + 0.21);
    const flushBtn1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.01), materials.chassisMaterial);
    flushBtn1.position.set(-length / 2 + 1.075, 0.85, -depth / 2 + 0.22);
    const flushBtn2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.01), materials.chassisMaterial);
    flushBtn2.position.set(-length / 2 + 1.155, 0.85, -depth / 2 + 0.22);
    
    // D-shape Ceramic Bowl (Glossy White)
    const bowlFront = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.32, 32), materials.countertopMaterial);
    bowlFront.position.set(-length / 2 + 1.125, 0.34, -depth / 2 + 0.45);
    const bowlBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.25), materials.countertopMaterial);
    bowlBack.position.set(-length / 2 + 1.125, 0.34, -depth / 2 + 0.325);
    
    // Slim soft-close seat/lid (Matte)
    const seatFront = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32), materials.chassisMaterial);
    seatFront.position.set(-length / 2 + 1.125, 0.51, -depth / 2 + 0.45);
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.25), materials.chassisMaterial);
    seatBack.position.set(-length / 2 + 1.125, 0.51, -depth / 2 + 0.325);
    
    toiletGroup.add(toiletTank, flushPlateBase, flushBtn1, flushBtn2, bowlFront, bowlBack, seatFront, seatBack);
    bathPodGroup.add(toiletGroup);

    // Floating Vanity & Sink (Left wall)
    const vanityGroup = new THREE.Group();
    // Wood/Cabinet base
    const vanityBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.7), materials.cabinetMaterial);
    vanityBase.position.set(-length / 2 + 0.22, 0.6, -depth / 2 + 1.35);
    // White Countertop
    const vanityTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.72), materials.countertopMaterial);
    vanityTop.position.set(-length / 2 + 0.22, 0.82, -depth / 2 + 1.35);
    // Vessel Sink
    const sinkBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.1, 24), materials.interiorWallMaterial);
    sinkBowl.position.set(-length / 2 + 0.22, 0.89, -depth / 2 + 1.35);
    // Faucet
    const vanityFaucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), materials.metalTrimMaterial);
    vanityFaucet.position.set(-length / 2 + 0.1, 0.95, -depth / 2 + 1.35);
    vanityFaucet.rotation.z = -Math.PI / 8;
    
    // LED Backlit Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, 0.6), materials.ledStripMaterial);
    mirror.position.set(-length / 2 + 0.06, 1.4, -depth / 2 + 1.35);
    
    vanityGroup.add(vanityBase, vanityTop, sinkBowl, vanityFaucet, mirror);
    bathPodGroup.add(vanityGroup);

    interiorGroup.add(bathPodGroup);
  }

  // 7b. Gourmet Architectural Kitchenette Module
  if (state.hasKitchenetteModule) {
    const kitchenGroup = new THREE.Group();
    const kitchenLength = state.modelId === 'studio' ? 1.8 : (state.modelId === 'one-bedroom' ? 2.5 : 3.0);
    const kitchenX = state.modelId === 'studio' ? -0.5 : (state.modelId === 'one-bedroom' ? -1.3 : -2.2);
    const baseDepth = 0.60;
    const baseHeight = 0.86;
    const toeKickHeight = 0.08;
    const toeKickRecess = 0.05;
    const counterThickness = 0.04;
    const counterDepth = 0.64;

    const zBaseCenter = -depth / 2 + baseDepth / 2 + wallThickness;
    const zFrontFace = -depth / 2 + baseDepth + wallThickness;

    // Helper: Modern Brushed Metal Cabinet Pull Handle
    const createCabinetBarHandle = (length: number, isVertical: boolean = false) => {
      const handleGroup = new THREE.Group();
      const barGeo = new THREE.CylinderGeometry(0.005, 0.005, length, 8);
      const barMesh = new THREE.Mesh(barGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
      if (!isVertical) {
        barMesh.rotation.z = Math.PI / 2;
      }
      barMesh.position.set(0, 0, 0.016);
      handleGroup.add(barMesh);

      const postGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.016, 8);
      const post1 = new THREE.Mesh(postGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
      post1.rotation.x = Math.PI / 2;
      post1.position.set(isVertical ? 0 : -length * 0.35, isVertical ? -length * 0.35 : 0, 0.008);
      handleGroup.add(post1);

      const post2 = new THREE.Mesh(postGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
      post2.rotation.x = Math.PI / 2;
      post2.position.set(isVertical ? 0 : length * 0.35, isVertical ? length * 0.35 : 0, 0.008);
      handleGroup.add(post2);

      return handleGroup;
    };

    // 1. Recessed Toe-Kick (Dark Architectural Base Plinth)
    const toeKickGeo = new THREE.BoxGeometry(kitchenLength - 0.02, toeKickHeight, baseDepth - toeKickRecess);
    const toeKickMesh = new THREE.Mesh(toeKickGeo, materials.chassisMaterial);
    toeKickMesh.position.set(kitchenX, 0.15 + toeKickHeight / 2, zBaseCenter - toeKickRecess / 2);
    toeKickMesh.castShadow = true;
    kitchenGroup.add(toeKickMesh);

    // 2. Lower Cabinet Structural Carcass
    const cabBodyHeight = baseHeight - toeKickHeight;
    const lowerCabGeo = new THREE.BoxGeometry(kitchenLength, cabBodyHeight, baseDepth);
    const lowerCabMesh = new THREE.Mesh(lowerCabGeo, materials.cabinetMaterial);
    lowerCabMesh.position.set(kitchenX, 0.15 + toeKickHeight + cabBodyHeight / 2, zBaseCenter);
    lowerCabMesh.castShadow = true;
    kitchenGroup.add(lowerCabMesh);

    // 3. Modular Cabinet Front Panels & Face Frames
    const numBays = state.modelId === 'studio' ? 3 : (state.modelId === 'one-bedroom' ? 4 : 5);
    const bayWidth = (kitchenLength - 0.02) / numBays;
    const revealGap = 0.008;
    const panelThickness = 0.018;
    const doorZ = zFrontFace + panelThickness / 2;

    for (let i = 0; i < numBays; i++) {
      const bayX = kitchenX - kitchenLength / 2 + 0.01 + bayWidth * i + bayWidth / 2;
      const bayW = bayWidth - revealGap;

      if (i === 0) {
        // BAY 0: 3-Tier Soft-Close Drawer Stack (Cookware & Cutlery)
        const dHeights = [0.18, 0.28, 0.28];
        let currY = 0.15 + toeKickHeight + cabBodyHeight;

        dHeights.forEach((dH, dIdx) => {
          currY -= dH;
          const drawerGeo = new THREE.BoxGeometry(bayW, dH - revealGap, panelThickness);
          const drawerMesh = new THREE.Mesh(drawerGeo, materials.cabinetMaterial);
          drawerMesh.position.set(bayX, currY + (dH - revealGap) / 2, doorZ);
          drawerMesh.castShadow = true;
          kitchenGroup.add(drawerMesh);

          // Handle on drawer
          const handle = createCabinetBarHandle(Math.min(0.24, bayW * 0.5), false);
          handle.position.set(bayX, currY + (dH - revealGap) / 2, doorZ + panelThickness / 2);
          kitchenGroup.add(handle);
        });

      } else if (i === 1) {
        // BAY 1: Built-in Convection Oven & Digital Microwave Module
        const ovenFrameGeo = new THREE.BoxGeometry(bayW, cabBodyHeight - revealGap, panelThickness);
        const ovenFrameMesh = new THREE.Mesh(ovenFrameGeo, materials.cabinetMaterial);
        ovenFrameMesh.position.set(bayX, 0.15 + toeKickHeight + cabBodyHeight / 2, doorZ);
        kitchenGroup.add(ovenFrameMesh);

        // Stainless steel oven trim surround
        const ovenH = cabBodyHeight * 0.72;
        const ovenW = bayW * 0.88;
        const ovenTrimGeo = new THREE.BoxGeometry(ovenW, ovenH, 0.01);
        const ovenTrimMesh = new THREE.Mesh(ovenTrimGeo, materials.metalTrimMaterial);
        ovenTrimMesh.position.set(bayX, 0.15 + toeKickHeight + cabBodyHeight / 2 - 0.02, doorZ + 0.01);
        kitchenGroup.add(ovenTrimMesh);

        // Dark glass oven window
        const ovenGlassGeo = new THREE.BoxGeometry(ovenW * 0.78, ovenH * 0.62, 0.012);
        const ovenGlassMesh = new THREE.Mesh(ovenGlassGeo, materials.applianceGlassMaterial || materials.chassisMaterial);
        ovenGlassMesh.position.set(bayX, 0.15 + toeKickHeight + cabBodyHeight / 2 - 0.04, doorZ + 0.012);
        kitchenGroup.add(ovenGlassMesh);

        // Oven handle across top of door
        const ovenBar = createCabinetBarHandle(ovenW * 0.7, false);
        ovenBar.position.set(bayX, 0.15 + toeKickHeight + cabBodyHeight / 2 + ovenH * 0.28, doorZ + 0.02);
        kitchenGroup.add(ovenBar);

        // Top digital control panel
        const controlPanelGeo = new THREE.BoxGeometry(ovenW * 0.78, 0.05, 0.012);
        const controlPanelMesh = new THREE.Mesh(controlPanelGeo, materials.chassisMaterial);
        controlPanelMesh.position.set(bayX, 0.15 + toeKickHeight + cabBodyHeight / 2 + ovenH * 0.38, doorZ + 0.012);
        kitchenGroup.add(controlPanelMesh);

      } else if (i === 2) {
        // BAY 2: Double-Door Sink Base Vanity
        const subDoorW = (bayW - revealGap) / 2;
        const doorH = cabBodyHeight - revealGap;

        // Left door
        const doorLGeo = new THREE.BoxGeometry(subDoorW, doorH, panelThickness);
        const doorLMesh = new THREE.Mesh(doorLGeo, materials.cabinetMaterial);
        doorLMesh.position.set(bayX - subDoorW / 2 - revealGap / 4, 0.15 + toeKickHeight + doorH / 2, doorZ);
        doorLMesh.castShadow = true;
        kitchenGroup.add(doorLMesh);

        const handleL = createCabinetBarHandle(0.18, true);
        handleL.position.set(bayX - revealGap - 0.02, 0.15 + toeKickHeight + doorH * 0.7, doorZ + panelThickness / 2);
        kitchenGroup.add(handleL);

        // Right door
        const doorRGeo = new THREE.BoxGeometry(subDoorW, doorH, panelThickness);
        const doorRMesh = new THREE.Mesh(doorRGeo, materials.cabinetMaterial);
        doorRMesh.position.set(bayX + subDoorW / 2 + revealGap / 4, 0.15 + toeKickHeight + doorH / 2, doorZ);
        doorRMesh.castShadow = true;
        kitchenGroup.add(doorRMesh);

        const handleR = createCabinetBarHandle(0.18, true);
        handleR.position.set(bayX + revealGap + 0.02, 0.15 + toeKickHeight + doorH * 0.7, doorZ + panelThickness / 2);
        kitchenGroup.add(handleR);

      } else {
        // BAYS 3 & 4: Integrated Dishwasher / Pantry Module
        const doorH = cabBodyHeight - revealGap;
        const doorGeo = new THREE.BoxGeometry(bayW, doorH, panelThickness);
        const doorMesh = new THREE.Mesh(doorGeo, materials.cabinetMaterial);
        doorMesh.position.set(bayX, 0.15 + toeKickHeight + doorH / 2, doorZ);
        doorMesh.castShadow = true;
        kitchenGroup.add(doorMesh);

        const handle = createCabinetBarHandle(0.24, false);
        handle.position.set(bayX, 0.15 + toeKickHeight + doorH - 0.06, doorZ + panelThickness / 2);
        kitchenGroup.add(handle);
      }
    }

    // 4. Waterfall Quartz Countertop with Cascading Edge
    const counterY = 0.15 + baseHeight + counterThickness / 2;
    const counterGeo = new THREE.BoxGeometry(kitchenLength + 0.04, counterThickness, counterDepth);
    const counterMesh = new THREE.Mesh(counterGeo, materials.countertopMaterial);
    counterMesh.position.set(kitchenX, counterY, zBaseCenter + (counterDepth - baseDepth) / 2);
    counterMesh.castShadow = true;
    counterMesh.receiveShadow = true;
    kitchenGroup.add(counterMesh);

    // Waterfall vertical slab on outer exposed end
    const waterfallX = kitchenX + kitchenLength / 2 + 0.02;
    const waterfallGeo = new THREE.BoxGeometry(counterThickness, baseHeight, counterDepth);
    const waterfallMesh = new THREE.Mesh(waterfallGeo, materials.countertopMaterial);
    waterfallMesh.position.set(waterfallX, 0.15 + baseHeight / 2, zBaseCenter + (counterDepth - baseDepth) / 2);
    waterfallMesh.castShadow = true;
    kitchenGroup.add(waterfallMesh);

    // 5. Polished Quartz Backsplash
    const splashHeight = 0.62;
    const splashGeo = new THREE.BoxGeometry(kitchenLength, splashHeight, 0.015);
    const splashMesh = new THREE.Mesh(splashGeo, materials.backsplashMaterial || materials.countertopMaterial);
    splashMesh.position.set(kitchenX, counterY + counterThickness / 2 + splashHeight / 2, -depth / 2 + wallThickness + 0.008);
    kitchenGroup.add(splashMesh);

    // 6. High-Detail Induction Ceramic Cooktop
    const cooktopBayX = kitchenX - kitchenLength / 2 + 0.01 + bayWidth * 0.5;
    const cooktopZ = zBaseCenter + 0.02;
    const cooktopPlateGeo = new THREE.BoxGeometry(0.54, 0.008, 0.40);
    const cooktopPlateMesh = new THREE.Mesh(cooktopPlateGeo, materials.chassisMaterial);
    cooktopPlateMesh.position.set(cooktopBayX, counterY + counterThickness / 2 + 0.004, cooktopZ);
    kitchenGroup.add(cooktopPlateMesh);

    // 4 Induction Heating Rings
    const ringMat = materials.metalTrimMaterial;
    const burners = [
      { x: cooktopBayX - 0.14, z: cooktopZ - 0.09, r: 0.075 },
      { x: cooktopBayX + 0.14, z: cooktopZ - 0.09, r: 0.065 },
      { x: cooktopBayX - 0.14, z: cooktopZ + 0.09, r: 0.065 },
      { x: cooktopBayX + 0.14, z: cooktopZ + 0.09, r: 0.085 },
    ];
    burners.forEach((b) => {
      const ringGeo = new THREE.RingGeometry(b.r * 0.8, b.r, 20);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(b.x, counterY + counterThickness / 2 + 0.009, b.z);
      kitchenGroup.add(ringMesh);
    });

    // Touch control strip
    const touchStripGeo = new THREE.BoxGeometry(0.25, 0.002, 0.03);
    const touchStripMesh = new THREE.Mesh(touchStripGeo, materials.downlightMaterial || ringMat);
    touchStripMesh.position.set(cooktopBayX, counterY + counterThickness / 2 + 0.009, cooktopZ + 0.16);
    kitchenGroup.add(touchStripMesh);

    // 7. Undermount Stainless Sink & Gooseneck Faucet
    const sinkBayX = kitchenX - kitchenLength / 2 + 0.01 + bayWidth * (numBays >= 3 ? 2 : 1) + bayWidth / 2;
    const sinkZ = zBaseCenter + 0.02;

    // Sink outer stainless rim
    const sinkRimGeo = new THREE.BoxGeometry(0.48, 0.01, 0.38);
    const sinkRimMesh = new THREE.Mesh(sinkRimGeo, materials.metalTrimMaterial);
    sinkRimMesh.position.set(sinkBayX, counterY + counterThickness / 2 + 0.005, sinkZ);
    kitchenGroup.add(sinkRimMesh);

    // Sink recessed basin interior
    const sinkCavityGeo = new THREE.BoxGeometry(0.42, 0.14, 0.32);
    const sinkCavityMesh = new THREE.Mesh(sinkCavityGeo, materials.chassisMaterial);
    sinkCavityMesh.position.set(sinkBayX, counterY - 0.05, sinkZ);
    kitchenGroup.add(sinkCavityMesh);

    // Drain strainer
    const drainGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.005, 16);
    const drainMesh = new THREE.Mesh(drainGeo, materials.metalTrimMaterial);
    drainMesh.position.set(sinkBayX, counterY - 0.11, sinkZ);
    kitchenGroup.add(drainMesh);

    // Commercial High-Arc Gooseneck Faucet
    const faucetGroup = new THREE.Group();
    const faucetBaseGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.02, 16);
    const faucetBase = new THREE.Mesh(faucetBaseGeo, materials.metalTrimMaterial);
    faucetGroup.add(faucetBase);

    const faucetStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.18, 16);
    const faucetStem = new THREE.Mesh(faucetStemGeo, materials.metalTrimMaterial);
    faucetStem.position.y = 0.10;
    faucetGroup.add(faucetStem);

    const faucetArcGeo = new THREE.TorusGeometry(0.055, 0.01, 8, 16, Math.PI);
    const faucetArc = new THREE.Mesh(faucetArcGeo, materials.metalTrimMaterial);
    faucetArc.position.set(0.055, 0.19, 0);
    faucetGroup.add(faucetArc);

    const faucetSpoutGeo = new THREE.CylinderGeometry(0.012, 0.009, 0.05, 16);
    const faucetSpout = new THREE.Mesh(faucetSpoutGeo, materials.metalTrimMaterial);
    faucetSpout.position.set(0.11, 0.165, 0);
    faucetGroup.add(faucetSpout);

    const faucetLeverGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.06, 8);
    const faucetLever = new THREE.Mesh(faucetLeverGeo, materials.metalTrimMaterial);
    faucetLever.position.set(-0.025, 0.08, 0);
    faucetLever.rotation.z = 0.3;
    faucetGroup.add(faucetLever);

    faucetGroup.position.set(sinkBayX - 0.06, counterY + counterThickness / 2 + 0.01, sinkZ - 0.15);
    faucetGroup.rotation.y = Math.PI / 2;
    kitchenGroup.add(faucetGroup);

    // 8. Dual-Tier Upper Cabinets with Open Oak Display Niche
    const upperY = counterY + splashHeight;
    const upperH = 0.60;
    const upperDepth = 0.34;
    const upperZ = -depth / 2 + upperDepth / 2 + wallThickness;

    // Main upper cabinet carcass
    const upperCarcassGeo = new THREE.BoxGeometry(kitchenLength, upperH, upperDepth);
    const upperCarcassMesh = new THREE.Mesh(upperCarcassGeo, materials.cabinetMaterial);
    upperCarcassMesh.position.set(kitchenX, upperY + upperH / 2, upperZ);
    upperCarcassMesh.castShadow = true;
    kitchenGroup.add(upperCarcassMesh);

    // Upper cabinet individual door reveals
    for (let u = 0; u < numBays; u++) {
      const uBayX = kitchenX - kitchenLength / 2 + 0.01 + bayWidth * u + bayWidth / 2;
      const uBayW = bayWidth - revealGap;

      if (u === 1) {
        // Open warm wood architectural display niche
        const nicheGeo = new THREE.BoxGeometry(uBayW, upperH - revealGap, upperDepth * 0.95);
        const nicheMesh = new THREE.Mesh(nicheGeo, materials.cabinetWoodNicheMaterial || materials.cabinetMaterial);
        nicheMesh.position.set(uBayX, upperY + upperH / 2, upperZ + 0.01);
        kitchenGroup.add(nicheMesh);

        // Floating oak shelf divider
        const nicheShelfGeo = new THREE.BoxGeometry(uBayW * 0.94, 0.02, upperDepth * 0.88);
        const nicheShelfMesh = new THREE.Mesh(nicheShelfGeo, materials.cabinetWoodNicheMaterial || materials.countertopMaterial);
        nicheShelfMesh.position.set(uBayX, upperY + upperH / 2, upperZ + 0.02);
        kitchenGroup.add(nicheShelfMesh);

        // Ceramic mugs on shelf
        const mugGeo = new THREE.CylinderGeometry(0.03, 0.026, 0.06, 12);
        const mug1 = new THREE.Mesh(mugGeo, materials.countertopMaterial);
        mug1.position.set(uBayX - 0.07, upperY + upperH / 2 + 0.04, upperZ + 0.05);
        kitchenGroup.add(mug1);

        const mug2 = new THREE.Mesh(mugGeo, materials.interiorWallMaterial);
        mug2.position.set(uBayX + 0.07, upperY + upperH / 2 + 0.04, upperZ + 0.05);
        kitchenGroup.add(mug2);
      } else {
        // Closed upper doors with concealed bottom edge lip
        const uDoorGeo = new THREE.BoxGeometry(uBayW, upperH - revealGap, 0.016);
        const uDoorMesh = new THREE.Mesh(uDoorGeo, materials.cabinetMaterial);
        uDoorMesh.position.set(uBayX, upperY + upperH / 2, -depth / 2 + upperDepth + wallThickness + 0.008);
        uDoorMesh.castShadow = true;
        kitchenGroup.add(uDoorMesh);
      }
    }

    // 9. Integrated Range Hood Extractor (Above Cooktop)
    const hoodGeo = new THREE.BoxGeometry(bayWidth * 0.95, 0.05, upperDepth + 0.04);
    const hoodMesh = new THREE.Mesh(hoodGeo, materials.metalTrimMaterial);
    hoodMesh.position.set(cooktopBayX, upperY - 0.025, upperZ + 0.02);
    kitchenGroup.add(hoodMesh);

    // Dual range hood LED lights
    const hoodLightGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.005, 12);
    const hl1 = new THREE.Mesh(hoodLightGeo, materials.downlightMaterial);
    hl1.position.set(cooktopBayX - 0.12, upperY - 0.051, upperZ + 0.04);
    kitchenGroup.add(hl1);
    const hl2 = new THREE.Mesh(hoodLightGeo, materials.downlightMaterial);
    hl2.position.set(cooktopBayX + 0.12, upperY - 0.051, upperZ + 0.04);
    kitchenGroup.add(hl2);

    // 10. Recessed Warm LED Undercabinet Task Light Strip
    const ledStripGeo = new THREE.BoxGeometry(kitchenLength - 0.08, 0.012, 0.02);
    const ledStripMesh = new THREE.Mesh(ledStripGeo, materials.ledStripMaterial);
    ledStripMesh.position.set(kitchenX, upperY - 0.01, upperZ + upperDepth / 2 - 0.04);
    kitchenGroup.add(ledStripMesh);

    // 11. Acacia Chef's Cutting Board on Countertop
    const boardGeo = new THREE.BoxGeometry(0.34, 0.022, 0.24);
    const boardMesh = new THREE.Mesh(boardGeo, materials.cabinetWoodNicheMaterial || materials.woodDeckMaterial);
    boardMesh.position.set(kitchenX + 0.1, counterY + counterThickness / 2 + 0.011, zBaseCenter + 0.02);
    boardMesh.castShadow = true;
    kitchenGroup.add(boardMesh);

    interiorGroup.add(kitchenGroup);
  }

  // Helper function to construct a high-detail architectural sleeping suite with side table
  function createDetailedBedSuite(options: {
    headboardX: number;
    headboardFacing: 'east' | 'west';
    bedCenterZ: number;
    bedWidth: number;
    bedLength: number;
    nightstandZOffset: number;
    materials: MaterialLibrary;
  }): THREE.Group {
    const { headboardX, headboardFacing, bedCenterZ, bedWidth, bedLength, nightstandZOffset, materials } = options;
    const suiteGroup = new THREE.Group();

    const dirX = headboardFacing === 'east' ? -1 : 1;
    const bedCenterX = headboardX + dirX * (0.08 + bedLength / 2);
    const footX = headboardX + dirX * (0.08 + bedLength);

    // 1. Bed Platform Frame
    // Recessed dark shadow kick plinth (creates architectural floating effect)
    const plinthGeo = new THREE.BoxGeometry(bedLength * 0.88, 0.10, bedWidth * 0.88);
    const plinthMesh = new THREE.Mesh(plinthGeo, materials.chassisMaterial);
    plinthMesh.position.set(bedCenterX, 0.15 + 0.05, bedCenterZ);
    plinthMesh.castShadow = true;
    suiteGroup.add(plinthMesh);

    // Cantilevered platform deck in fine timber
    const deckGeo = new THREE.BoxGeometry(bedLength + 0.10, 0.14, bedWidth + 0.10);
    const deckMesh = new THREE.Mesh(deckGeo, materials.nightstandWoodMaterial || materials.cabinetMaterial);
    deckMesh.position.set(bedCenterX, 0.15 + 0.10 + 0.07, bedCenterZ);
    deckMesh.castShadow = true;
    deckMesh.receiveShadow = true;
    suiteGroup.add(deckMesh);

    // 2. Luxury Layered Mattress & Pillow-Top
    const mattressGeo = new THREE.BoxGeometry(bedLength, 0.22, bedWidth);
    const mattressMesh = new THREE.Mesh(mattressGeo, materials.bedLinenMaterial);
    mattressMesh.position.set(bedCenterX, 0.15 + 0.24 + 0.11, bedCenterZ);
    mattressMesh.castShadow = true;
    suiteGroup.add(mattressMesh);

    // Pillow-top topper layer
    const topperGeo = new THREE.BoxGeometry(bedLength - 0.02, 0.045, bedWidth - 0.02);
    const topperMesh = new THREE.Mesh(topperGeo, materials.bedLinenMaterial);
    topperMesh.position.set(bedCenterX, 0.15 + 0.24 + 0.22 + 0.0225, bedCenterZ);
    suiteGroup.add(topperMesh);

    // 3. Quilted Folded Duvet & Comforter
    const duvetLength = bedLength * 0.66;
    const duvetCenterX = footX - dirX * (duvetLength / 2);
    const duvetGeo = new THREE.BoxGeometry(duvetLength, 0.065, bedWidth + 0.06);
    const duvetMesh = new THREE.Mesh(duvetGeo, materials.bedDuvetMaterial);
    duvetMesh.position.set(duvetCenterX, 0.15 + 0.24 + 0.22 + 0.045 + 0.0325, bedCenterZ);
    duvetMesh.castShadow = true;
    suiteGroup.add(duvetMesh);

    // Turned-down crisp linen cuff fold (shows inner sheet layer)
    const foldGeo = new THREE.BoxGeometry(0.18, 0.04, bedWidth + 0.05);
    const foldMesh = new THREE.Mesh(foldGeo, materials.bedLinenMaterial);
    foldMesh.position.set(duvetCenterX - dirX * (duvetLength / 2 - 0.09), 0.15 + 0.24 + 0.22 + 0.045 + 0.06, bedCenterZ);
    suiteGroup.add(foldMesh);

    // Heavy textured woven runner / throw blanket across foot of bed
    const throwLength = 0.50;
    const throwCenterX = footX - dirX * (throwLength / 2 + 0.06);
    const throwGeo = new THREE.BoxGeometry(throwLength, 0.03, bedWidth + 0.08);
    const throwMesh = new THREE.Mesh(throwGeo, materials.bedAccentThrowMaterial);
    throwMesh.position.set(throwCenterX, 0.15 + 0.24 + 0.22 + 0.045 + 0.065 + 0.015, bedCenterZ);
    throwMesh.castShadow = true;
    suiteGroup.add(throwMesh);

    // 4. Double-Row Pillows & Accent Lumbar Cushion
    const pillowZ1 = bedCenterZ - bedWidth * 0.24;
    const pillowZ2 = bedCenterZ + bedWidth * 0.24;
    const pillowW = bedWidth * 0.42;

    // Euro Shams (upright against headboard)
    const euroGeo = new THREE.BoxGeometry(0.14, 0.28, pillowW);
    const euro1 = new THREE.Mesh(euroGeo, materials.bedLinenMaterial);
    euro1.position.set(headboardX + dirX * 0.20, 0.15 + 0.52, pillowZ1);
    euro1.rotation.y = headboardFacing === 'east' ? 0 : Math.PI;
    euro1.rotation.z = dirX * (Math.PI / 16);
    suiteGroup.add(euro1);

    const euro2 = new THREE.Mesh(euroGeo, materials.bedLinenMaterial);
    euro2.position.set(headboardX + dirX * 0.20, 0.15 + 0.52, pillowZ2);
    euro2.rotation.y = headboardFacing === 'east' ? 0 : Math.PI;
    euro2.rotation.z = dirX * (Math.PI / 16);
    suiteGroup.add(euro2);

    // Sleeping pillows (gently inclined in front)
    const sleepPillowGeo = new THREE.BoxGeometry(0.28, 0.10, pillowW * 0.95);
    const sleep1 = new THREE.Mesh(sleepPillowGeo, materials.bedLinenMaterial);
    sleep1.position.set(headboardX + dirX * 0.38, 0.15 + 0.48, pillowZ1);
    sleep1.rotation.z = dirX * (Math.PI / 14);
    suiteGroup.add(sleep1);

    const sleep2 = new THREE.Mesh(sleepPillowGeo, materials.bedLinenMaterial);
    sleep2.position.set(headboardX + dirX * 0.38, 0.15 + 0.48, pillowZ2);
    sleep2.rotation.z = dirX * (Math.PI / 14);
    suiteGroup.add(sleep2);

    // Central decorative lumbar throw cushion
    const lumbarGeo = new THREE.BoxGeometry(0.16, 0.16, 0.38);
    const lumbar = new THREE.Mesh(lumbarGeo, materials.bedAccentThrowMaterial);
    lumbar.position.set(headboardX + dirX * 0.44, 0.15 + 0.52, bedCenterZ);
    lumbar.rotation.z = dirX * (Math.PI / 12);
    suiteGroup.add(lumbar);

    // 5. Architectural Fluted Timber Headboard with Ambient Halo Glow
    const headboardWidth = bedWidth + 0.70;
    const headboardCenterZ = bedCenterZ + nightstandZOffset * 0.4;
    const headboardH = 1.05;
    const headboardThick = 0.06;

    const hbGeo = new THREE.BoxGeometry(headboardThick, headboardH, headboardWidth);
    const hbMesh = new THREE.Mesh(hbGeo, materials.nightstandWoodMaterial || materials.cabinetMaterial);
    hbMesh.position.set(headboardX, 0.15 + headboardH / 2, headboardCenterZ);
    hbMesh.castShadow = true;
    suiteGroup.add(hbMesh);

    // Fluted vertical architectural slats along headboard
    const numSlats = 16;
    const slatW = (headboardWidth - 0.04) / numSlats;
    for (let s = 0; s < numSlats; s++) {
      const slatZ = (headboardCenterZ - headboardWidth / 2 + 0.02) + s * slatW + slatW / 2;
      const slatGeo = new THREE.BoxGeometry(0.012, headboardH - 0.04, slatW * 0.75);
      const slatMesh = new THREE.Mesh(slatGeo, materials.cabinetWoodNicheMaterial || materials.woodDeckMaterial);
      slatMesh.position.set(headboardX + dirX * (headboardThick / 2 + 0.006), 0.15 + headboardH / 2, slatZ);
      suiteGroup.add(slatMesh);
    }

    // Integrated warm ambient LED halo glow strip along top edge of headboard
    const haloGeo = new THREE.BoxGeometry(headboardThick + 0.01, 0.015, headboardWidth - 0.04);
    const haloMesh = new THREE.Mesh(haloGeo, materials.ledStripMaterial || materials.downlightMaterial);
    haloMesh.position.set(headboardX, 0.15 + headboardH + 0.008, headboardCenterZ);
    suiteGroup.add(haloMesh);

    // Reading spotlight sconce mounted on headboard above bedside table
    const sconceArmGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8);
    const sconceArm = new THREE.Mesh(sconceArmGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
    sconceArm.rotation.z = Math.PI / 2;
    sconceArm.position.set(headboardX + dirX * 0.06, 0.15 + 0.85, bedCenterZ + nightstandZOffset);
    suiteGroup.add(sconceArm);

    const sconceHeadGeo = new THREE.CylinderGeometry(0.016, 0.022, 0.05, 12);
    const sconceHead = new THREE.Mesh(sconceHeadGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
    sconceHead.rotation.x = Math.PI / 6;
    sconceHead.position.set(headboardX + dirX * 0.10, 0.15 + 0.85, bedCenterZ + nightstandZOffset);
    suiteGroup.add(sconceHead);

    // 6. Bedside Nightstand / Side Table Module
    const nightstandX = headboardX + dirX * 0.32;
    const nightstandZ = bedCenterZ + nightstandZOffset;
    const nsW = 0.44; // in X
    const nsD = 0.40; // in Z
    const nsH = 0.48; // in Y

    // Recessed dark kick plinth
    const nsKickGeo = new THREE.BoxGeometry(nsW - 0.04, 0.06, nsD - 0.04);
    const nsKickMesh = new THREE.Mesh(nsKickGeo, materials.chassisMaterial);
    nsKickMesh.position.set(nightstandX, 0.15 + 0.03, nightstandZ);
    suiteGroup.add(nsKickMesh);

    // Nightstand Wood Carcass Frame
    const nsCarcassGeo = new THREE.BoxGeometry(nsW, nsH - 0.06, nsD);
    const nsCarcassMesh = new THREE.Mesh(nsCarcassGeo, materials.nightstandWoodMaterial || materials.cabinetMaterial);
    nsCarcassMesh.position.set(nightstandX, 0.15 + 0.06 + (nsH - 0.06) / 2, nightstandZ);
    nsCarcassMesh.castShadow = true;
    suiteGroup.add(nsCarcassMesh);

    // Polished Quartz / Stone Nightstand Top
    const nsTopGeo = new THREE.BoxGeometry(nsW + 0.02, 0.025, nsD + 0.02);
    const nsTopMesh = new THREE.Mesh(nsTopGeo, materials.countertopMaterial);
    nsTopMesh.position.set(nightstandX, 0.15 + nsH + 0.0125, nightstandZ);
    nsTopMesh.castShadow = true;
    suiteGroup.add(nsTopMesh);

    // Soft-close Drawer Front with Shadow Reveal
    const dW = nsW - 0.03;
    const dH = 0.16;
    const drawerFrontGeo = new THREE.BoxGeometry(dW, dH, 0.015);
    const drawerFrontMesh = new THREE.Mesh(drawerFrontGeo, materials.nightstandWoodMaterial || materials.cabinetMaterial);
    const drawerFacingZ = nightstandZ + (nsD / 2 + 0.008) * (nightstandZOffset > 0 ? 1 : -1);
    drawerFrontMesh.position.set(nightstandX, 0.15 + nsH - 0.02 - dH / 2, drawerFacingZ);
    suiteGroup.add(drawerFrontMesh);

    // Brushed Brass Drawer Pull Handle
    const drawerPullGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.14, 8);
    const drawerPullMesh = new THREE.Mesh(drawerPullGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
    drawerPullMesh.rotation.z = Math.PI / 2;
    drawerPullMesh.position.set(nightstandX, 0.15 + nsH - 0.02 - dH / 2, drawerFacingZ + (0.014 * (nightstandZOffset > 0 ? 1 : -1)));
    suiteGroup.add(drawerPullMesh);

    // Lower Open Cubby / Display Shelf Niche
    const cubbyGeo = new THREE.BoxGeometry(dW * 0.88, 0.16, nsD * 0.9);
    const cubbyMesh = new THREE.Mesh(cubbyGeo, materials.cabinetWoodNicheMaterial || materials.nightstandWoodMaterial);
    cubbyMesh.position.set(nightstandX, 0.15 + 0.06 + 0.10, nightstandZ);
    suiteGroup.add(cubbyMesh);

    // 2 Stacked Designer Books in Lower Niche
    const book1Geo = new THREE.BoxGeometry(0.20, 0.025, 0.15);
    const book1Mesh = new THREE.Mesh(book1Geo, materials.furnitureFabricMaterial);
    book1Mesh.position.set(nightstandX, 0.15 + 0.06 + 0.035, nightstandZ);
    suiteGroup.add(book1Mesh);

    const book2Geo = new THREE.BoxGeometry(0.18, 0.022, 0.14);
    const book2Mesh = new THREE.Mesh(book2Geo, materials.bedAccentThrowMaterial);
    book2Mesh.position.set(nightstandX, 0.15 + 0.06 + 0.035 + 0.024, nightstandZ);
    book2Mesh.rotation.y = 0.12;
    suiteGroup.add(book2Mesh);

    // 7. Modern Architectural Bedside Table Lamp
    const lampGroup = new THREE.Group();
    const lampBaseY = 0.15 + nsH + 0.025;
    // Weighted brass circular pedestal base
    const lampBaseGeo = new THREE.CylinderGeometry(0.055, 0.06, 0.012, 16);
    const lampBase = new THREE.Mesh(lampBaseGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
    lampBase.position.set(nightstandX, lampBaseY + 0.006, nightstandZ);
    lampGroup.add(lampBase);

    // Vertical brass stem
    const lampStemGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.22, 12);
    const lampStem = new THREE.Mesh(lampStemGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
    lampStem.position.set(nightstandX, lampBaseY + 0.012 + 0.11, nightstandZ);
    lampGroup.add(lampStem);

    // Glowing frosted glass diffuser sphere
    const lampShadeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const lampShade = new THREE.Mesh(lampShadeGeo, materials.lampGlowMaterial || materials.downlightMaterial);
    lampShade.position.set(nightstandX, lampBaseY + 0.012 + 0.22 + 0.04, nightstandZ);
    lampGroup.add(lampShade);

    // Bedside water tumbler on stone top
    const glassGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.06, 12);
    const glassMesh = new THREE.Mesh(glassGeo, materials.applianceGlassMaterial || materials.glassMaterial);
    glassMesh.position.set(nightstandX + dirX * 0.10, lampBaseY + 0.03, nightstandZ - 0.08);
    lampGroup.add(glassMesh);

    suiteGroup.add(lampGroup);

    // 8. Plush Bedroom Area Rug
    const rugGeo = new THREE.BoxGeometry(bedLength + 0.70, 0.018, bedWidth + 0.85);
    const rugMesh = new THREE.Mesh(rugGeo, materials.furnitureFabricMaterial);
    rugMesh.position.set(bedCenterX - dirX * 0.15, 0.16, bedCenterZ + nightstandZOffset * 0.3);
    suiteGroup.add(rugMesh);

    return suiteGroup;
  }

  // Helper function to construct a high-detail architectural sofa, center table, and curated living room accessories
  function createDetailedLivingLounge(options: {
    sofaCenterX: number;
    sofaCenterZ: number;
    sofaWidth: number;
    sofaDepth: number;
    sofaFacingAngle: number;
    materials: MaterialLibrary;
  }): THREE.Group {
    const { sofaCenterX, sofaCenterZ, sofaWidth, sofaDepth, sofaFacingAngle, materials } = options;
    const loungeGroup = new THREE.Group();

    // Base sub-group for the sofa
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(sofaCenterX, 0, sofaCenterZ);
    sofaGroup.rotation.y = sofaFacingAngle;

    const armWidth = 0.16;
    const legHeight = 0.13;
    const woodRailH = 0.04;
    const chassisH = 0.11;
    const seatBaseY = 0.15 + legHeight + woodRailH;
    const seatTopY = seatBaseY + chassisH;

    // 1. Tapered Mid-Century Architectural Steel Legs
    const legRadiusTop = 0.018;
    const legRadiusBot = 0.011;
    const legGeo = new THREE.CylinderGeometry(legRadiusTop, legRadiusBot, legHeight, 12);
    const legOffsets = [
      { x: -sofaWidth / 2 + 0.10, z: -sofaDepth / 2 + 0.10, rotZ: 0.07, rotX: -0.07 },
      { x: sofaWidth / 2 - 0.10, z: -sofaDepth / 2 + 0.10, rotZ: -0.07, rotX: -0.07 },
      { x: -sofaWidth / 2 + 0.10, z: sofaDepth / 2 - 0.10, rotZ: 0.07, rotX: 0.07 },
      { x: sofaWidth / 2 - 0.10, z: sofaDepth / 2 - 0.10, rotZ: -0.07, rotX: 0.07 },
    ];
    if (sofaWidth > 1.8) {
      legOffsets.push({ x: 0, z: 0, rotZ: 0, rotX: 0 });
    }
    for (const off of legOffsets) {
      const legMesh = new THREE.Mesh(legGeo, materials.sofaLegMaterial);
      legMesh.position.set(off.x, 0.15 + legHeight / 2, off.z);
      legMesh.rotation.z = off.rotZ;
      legMesh.rotation.x = off.rotX;
      legMesh.castShadow = true;
      sofaGroup.add(legMesh);
    }

    // 2. Solid Smoked Oak Undercarriage Plinth Rail
    const railGeo = new THREE.BoxGeometry(sofaWidth - 0.04, woodRailH, sofaDepth - 0.04);
    const railMesh = new THREE.Mesh(railGeo, materials.sofaWoodFrameMaterial);
    railMesh.position.set(0, 0.15 + legHeight + woodRailH / 2, 0);
    railMesh.castShadow = true;
    sofaGroup.add(railMesh);

    // 3. Upholstered Base Platform (Chassis)
    const chassisGeo = new THREE.BoxGeometry(sofaWidth, chassisH, sofaDepth);
    const chassisMesh = new THREE.Mesh(chassisGeo, materials.sofaBoucleMaterial);
    chassisMesh.position.set(0, seatBaseY + chassisH / 2, 0);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    sofaGroup.add(chassisMesh);

    // 4. Individual Ergonomic Seat Cushions with Crowned Profiles
    const numCushions = sofaWidth > 1.8 ? 3 : 2;
    const internalW = sofaWidth - armWidth * 2;
    const gap = 0.012;
    const cushionW = (internalW - (numCushions - 1) * gap) / numCushions;
    const backrestThick = 0.18;
    const cushionD = sofaDepth - backrestThick - 0.02;
    const cushionH = 0.12;
    const cushionCenterZ = sofaDepth / 2 - cushionD / 2;

    for (let i = 0; i < numCushions; i++) {
      const cushionCenterX = -internalW / 2 + cushionW / 2 + i * (cushionW + gap);
      const scGeo = new THREE.BoxGeometry(cushionW, cushionH, cushionD);
      const scMesh = new THREE.Mesh(scGeo, materials.sofaBoucleMaterial);
      scMesh.position.set(cushionCenterX, seatTopY + cushionH / 2, cushionCenterZ);
      scMesh.castShadow = true;
      scMesh.receiveShadow = true;
      sofaGroup.add(scMesh);

      // Pillow-top softness layer
      const crownGeo = new THREE.BoxGeometry(cushionW - 0.02, 0.025, cushionD - 0.02);
      const crownMesh = new THREE.Mesh(crownGeo, materials.sofaBoucleMaterial);
      crownMesh.position.set(cushionCenterX, seatTopY + cushionH + 0.012, cushionCenterZ);
      sofaGroup.add(crownMesh);
    }

    // 5. Reclined Ergonomic Backrest Frame
    const backrestH = 0.44;
    const backGeo = new THREE.BoxGeometry(internalW, backrestH, backrestThick);
    const backMesh = new THREE.Mesh(backGeo, materials.sofaBoucleMaterial);
    backMesh.position.set(0, seatTopY + backrestH / 2 - 0.02, -sofaDepth / 2 + backrestThick / 2);
    backMesh.rotation.x = -0.06;
    backMesh.castShadow = true;
    sofaGroup.add(backMesh);

    // 6. Individual Plush Pillow Back Cushions
    const backCushionH = 0.38;
    const backCushionThick = 0.13;
    for (let i = 0; i < numCushions; i++) {
      const bcCenterX = -internalW / 2 + cushionW / 2 + i * (cushionW + gap);
      const bcGeo = new THREE.BoxGeometry(cushionW - 0.02, backCushionH, backCushionThick);
      const bcMesh = new THREE.Mesh(bcGeo, materials.sofaBoucleMaterial);
      bcMesh.position.set(
        bcCenterX,
        seatTopY + cushionH + backCushionH / 2 - 0.03,
        -sofaDepth / 2 + backrestThick + backCushionThick / 2 - 0.02
      );
      bcMesh.rotation.x = -0.16; // Comfortable recline
      bcMesh.castShadow = true;
      sofaGroup.add(bcMesh);
    }

    // 7. Sculpted Track Armrests
    const armH = 0.45;
    const armGeo = new THREE.BoxGeometry(armWidth, armH, sofaDepth);
    const armLeft = new THREE.Mesh(armGeo, materials.sofaBoucleMaterial);
    armLeft.position.set(-sofaWidth / 2 + armWidth / 2, seatBaseY + armH / 2, 0);
    armLeft.castShadow = true;
    const armRight = new THREE.Mesh(armGeo, materials.sofaBoucleMaterial);
    armRight.position.set(sofaWidth / 2 - armWidth / 2, seatBaseY + armH / 2, 0);
    armRight.castShadow = true;
    sofaGroup.add(armLeft, armRight);

    // Inner armrest bolster cushions
    const bolsterRadius = 0.045;
    const bolsterLen = sofaDepth * 0.70;
    const bolsterGeo = new THREE.CylinderGeometry(bolsterRadius, bolsterRadius, bolsterLen, 12);
    const bLeft = new THREE.Mesh(bolsterGeo, materials.sofaBoucleMaterial);
    bLeft.rotation.x = Math.PI / 2;
    bLeft.position.set(-sofaWidth / 2 + armWidth + bolsterRadius * 0.7, seatTopY + cushionH + bolsterRadius, 0.05);
    const bRight = new THREE.Mesh(bolsterGeo, materials.sofaBoucleMaterial);
    bRight.rotation.x = Math.PI / 2;
    bRight.position.set(sofaWidth / 2 - armWidth - bolsterRadius * 0.7, seatTopY + cushionH + bolsterRadius, 0.05);
    sofaGroup.add(bLeft, bRight);

    // 8. Designer Accent Throw Pillows
    // Left: Terracotta / Cognac Leather
    const tp1Geo = new THREE.BoxGeometry(0.32, 0.32, 0.10);
    const tp1 = new THREE.Mesh(tp1Geo, materials.sofaCushionAccent1);
    tp1.position.set(
      -sofaWidth / 2 + armWidth + 0.18,
      seatTopY + cushionH + 0.16,
      -sofaDepth / 2 + backrestThick + 0.22
    );
    tp1.rotation.y = Math.PI / 5;
    tp1.rotation.x = -Math.PI / 10;
    tp1.rotation.z = Math.PI / 16;
    tp1.castShadow = true;
    sofaGroup.add(tp1);

    // Right: Forest Sage Textured Linen
    const tp2Geo = new THREE.BoxGeometry(0.30, 0.30, 0.09);
    const tp2 = new THREE.Mesh(tp2Geo, materials.sofaCushionAccent2);
    tp2.position.set(
      sofaWidth / 2 - armWidth - 0.18,
      seatTopY + cushionH + 0.15,
      -sofaDepth / 2 + backrestThick + 0.22
    );
    tp2.rotation.y = -Math.PI / 5;
    tp2.rotation.x = -Math.PI / 10;
    tp2.rotation.z = -Math.PI / 16;
    tp2.castShadow = true;
    sofaGroup.add(tp2);

    // Central Oblong Lumbar Cushion (for wider 3-seater sofas)
    if (sofaWidth > 1.8) {
      const lumbarGeo = new THREE.BoxGeometry(0.42, 0.18, 0.08);
      const lumbar = new THREE.Mesh(lumbarGeo, materials.sofaBoucleMaterial);
      lumbar.position.set(0, seatTopY + cushionH + 0.09, -sofaDepth / 2 + backrestThick + 0.16);
      lumbar.rotation.x = -0.12;
      sofaGroup.add(lumbar);
    }

    // 9. Casually Draped Waffle-Knit Throw Blanket
    const blanketGroup = new THREE.Group();
    const bTop = new THREE.Mesh(
      new THREE.BoxGeometry(armWidth + 0.08, 0.024, 0.44),
      materials.sofaThrowBlanketMaterial
    );
    bTop.position.set(sofaWidth / 2 - armWidth / 2 - 0.01, seatBaseY + armH + 0.012, 0.05);
    const bOuter = new THREE.Mesh(
      new THREE.BoxGeometry(0.020, 0.26, 0.40),
      materials.sofaThrowBlanketMaterial
    );
    bOuter.position.set(sofaWidth / 2 + 0.01, seatBaseY + armH - 0.12, 0.05);
    const bInner = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.018, 0.36),
      materials.sofaThrowBlanketMaterial
    );
    bInner.position.set(sofaWidth / 2 - armWidth - 0.10, seatTopY + cushionH + 0.012, 0.06);

    blanketGroup.add(bTop, bOuter, bInner);
    blanketGroup.castShadow = true;
    sofaGroup.add(blanketGroup);

    loungeGroup.add(sofaGroup);

    // ==========================================
    // 10. CURATED ARCHITECTURAL CENTER COFFEE TABLE ENSEMBLE
    // ==========================================
    const tableGroup = new THREE.Group();
    const tableDistance = sofaDepth / 2 + 0.52;
    const tableCenterX = sofaCenterX;
    const tableCenterZ = sofaCenterZ + tableDistance;
    tableGroup.position.set(tableCenterX, 0, tableCenterZ);

    // A. Primary Low Roman Travertine Coffee Table
    const travW = 0.88;
    const travD = 0.54;
    const travThick = 0.038;
    const travH = 0.28;

    const travTopGeo = new THREE.BoxGeometry(travW, travThick, travD);
    const travTop = new THREE.Mesh(travTopGeo, materials.travertineTableMaterial);
    travTop.position.set(0, 0.15 + travH - travThick / 2, 0);
    travTop.castShadow = true;
    travTop.receiveShadow = true;
    tableGroup.add(travTop);

    // Twin Sculptural Fluted Dark Pedestal Drums
    const drumRadius = 0.11;
    const drumH = travH - travThick;
    const drumGeo = new THREE.CylinderGeometry(drumRadius, drumRadius, drumH, 20);
    const drum1 = new THREE.Mesh(drumGeo, materials.sofaLegMaterial);
    drum1.position.set(-travW * 0.24, 0.15 + drumH / 2, 0);
    drum1.castShadow = true;
    const drum2 = new THREE.Mesh(drumGeo, materials.sofaLegMaterial);
    drum2.position.set(travW * 0.24, 0.15 + drumH / 2, 0);
    drum2.castShadow = true;
    tableGroup.add(drum1, drum2);

    // B. Secondary Satellite Nested Round Accent Table
    const satRadius = 0.20;
    const satH = 0.35;
    const satOffsetX = travW * 0.44;
    const satOffsetZ = -travD * 0.25;

    const satTopGeo = new THREE.CylinderGeometry(satRadius, satRadius, 0.022, 24);
    const satTop = new THREE.Mesh(satTopGeo, materials.applianceGlassMaterial);
    satTop.position.set(satOffsetX, 0.15 + satH - 0.011, satOffsetZ);
    satTop.castShadow = true;
    tableGroup.add(satTop);

    const satLegGeo = new THREE.CylinderGeometry(0.007, 0.007, satH - 0.022, 10);
    for (let a = 0; a < 3; a++) {
      const angle = (a * 2 * Math.PI) / 3;
      const legX = satOffsetX + Math.cos(angle) * (satRadius * 0.72);
      const legZ = satOffsetZ + Math.sin(angle) * (satRadius * 0.72);
      const legMesh = new THREE.Mesh(satLegGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
      legMesh.position.set(legX, 0.15 + (satH - 0.022) / 2, legZ);
      legMesh.castShadow = true;
      tableGroup.add(legMesh);
    }

    // C. Curated Tabletop Living Still Life Accessories
    const tabletopY = 0.15 + travH;

    // 1. Stacked Hardcover Architectural Monograph Books
    const book1Geo = new THREE.BoxGeometry(0.24, 0.024, 0.18);
    const book1Mesh = new THREE.Mesh(book1Geo, materials.sofaBoucleMaterial);
    book1Mesh.position.set(-travW * 0.20, tabletopY + 0.012, 0.04);
    book1Mesh.castShadow = true;
    tableGroup.add(book1Mesh);

    const book2Geo = new THREE.BoxGeometry(0.21, 0.020, 0.16);
    const book2Mesh = new THREE.Mesh(book2Geo, materials.sofaCushionAccent1);
    book2Mesh.position.set(-travW * 0.20, tabletopY + 0.024 + 0.010, 0.04);
    book2Mesh.rotation.y = 0.14;
    book2Mesh.castShadow = true;
    tableGroup.add(book2Mesh);

    // 2. Sculptural Terracotta Ceramic Centerpiece Vessel
    const bowlGeo = new THREE.CylinderGeometry(0.075, 0.045, 0.042, 16);
    const bowlMesh = new THREE.Mesh(bowlGeo, materials.ceramicVesselMaterial);
    bowlMesh.position.set(0.05, tabletopY + 0.021, -0.06);
    bowlMesh.castShadow = true;
    tableGroup.add(bowlMesh);

    const marbleSphereGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const marbleSphere = new THREE.Mesh(marbleSphereGeo, materials.countertopMaterial);
    marbleSphere.position.set(0.05, tabletopY + 0.042, -0.06);
    tableGroup.add(marbleSphere);

    // 3. Scented Candle in Amber Glass with Ambient Glow
    const candleGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.055, 14);
    const candleMesh = new THREE.Mesh(candleGeo, materials.candleGlowMaterial);
    candleMesh.position.set(0.18, tabletopY + 0.0275, 0.08);
    candleMesh.castShadow = true;
    tableGroup.add(candleMesh);

    const flameGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const flameMesh = new THREE.Mesh(flameGeo, materials.lampGlowMaterial);
    flameMesh.position.set(0.18, tabletopY + 0.058, 0.08);
    tableGroup.add(flameMesh);

    // 4. Brushed Brass Valet Catchall Tray
    const trayGeo = new THREE.BoxGeometry(0.16, 0.010, 0.09);
    const trayMesh = new THREE.Mesh(trayGeo, materials.brassHandleMaterial || materials.metalTrimMaterial);
    trayMesh.position.set(-0.02, tabletopY + 0.005, 0.12);
    trayMesh.rotation.y = -0.18;
    tableGroup.add(trayMesh);

    // Satellite table accent: Glass water tumbler
    const tumGeo = new THREE.CylinderGeometry(0.024, 0.020, 0.06, 12);
    const tumMesh = new THREE.Mesh(tumGeo, materials.applianceGlassMaterial);
    tumMesh.position.set(satOffsetX, 0.15 + satH + 0.03, satOffsetZ);
    tableGroup.add(tumMesh);

    loungeGroup.add(tableGroup);

    // ==========================================
    // 11. PLUSH LIVING ROOM AREA RUG
    // ==========================================
    const rugW = Math.max(sofaWidth + 0.50, 2.4);
    const rugD = 1.90;
    const rugGeo = new THREE.BoxGeometry(rugW, 0.018, rugD);
    const rugMesh = new THREE.Mesh(rugGeo, materials.furnitureFabricMaterial);
    rugMesh.position.set(sofaCenterX, 0.16, (sofaCenterZ + tableCenterZ) / 2);
    rugMesh.receiveShadow = true;
    loungeGroup.add(rugMesh);

    return loungeGroup;
  }

  // 7c. Living Room & Sleeping Suite
  const bedWidth = state.modelId === 'studio' ? 1.45 : 1.6;
  const bedLength = 1.95;
  const bedCenterZ = -depth / 2 + bedWidth / 2 + 0.28;
  const headboardX = length / 2 - 0.18;
  const nightstandZOffset = bedWidth / 2 + 0.28;

  const primaryBedSuite = createDetailedBedSuite({
    headboardX,
    headboardFacing: 'east',
    bedCenterZ,
    bedWidth,
    bedLength,
    nightstandZOffset,
    materials,
  });
  interiorGroup.add(primaryBedSuite);

  // High-Detail Designer Living Lounge (Sofa & Curated Coffee Table)
  // Excluded from Studio: Studio maintains an open minimalist layout with sleeping suite, bath, and kitchen
  if (state.modelId === 'one-bedroom') {
    // Interior partition wall between bedroom and living room
    const dividerGeo = new THREE.BoxGeometry(0.1, height - 0.1, depth * 0.6);
    const dividerMesh = new THREE.Mesh(dividerGeo, materials.interiorWallMaterial);
    dividerMesh.position.set(length * 0.15, (height - 0.1) / 2 + 0.15, 0);
    dividerMesh.castShadow = true;
    interiorGroup.add(dividerMesh);

    // 1-Bedroom 3-seater luxury sofa & curated coffee table
    const oneBedLounge = createDetailedLivingLounge({
      sofaCenterX: -length * 0.2,
      sofaCenterZ: 0.35,
      sofaWidth: 2.15,
      sofaDepth: 0.90,
      sofaFacingAngle: 0,
      materials,
    });
    interiorGroup.add(oneBedLounge);
  } else if (state.modelId === 'two-bedroom') {
    // Interior partition wall between bedroom and living room
    const dividerGeo = new THREE.BoxGeometry(0.1, height - 0.1, depth * 0.6);
    const dividerMesh = new THREE.Mesh(dividerGeo, materials.interiorWallMaterial);
    dividerMesh.position.set(length * 0.15, (height - 0.1) / 2 + 0.15, 0);
    dividerMesh.castShadow = true;
    interiorGroup.add(dividerMesh);

    // 2-Bedroom spacious central great room 3-seater luxury sofa & coffee table
    const twoBedLounge = createDetailedLivingLounge({
      sofaCenterX: 0.0,
      sofaCenterZ: 0.35,
      sofaWidth: 2.30,
      sofaDepth: 0.90,
      sofaFacingAngle: 0,
      materials,
    });
    interiorGroup.add(twoBedLounge);
  }

  if (state.modelId === 'two-bedroom') {
    // Second bedroom suite on opposite wing
    const bed2Width = 1.5;
    const bed2Length = 1.95;
    const bed2CenterZ = depth / 2 - bed2Width / 2 - 0.28;
    const headboard2X = -length / 2 + 0.18;
    const nightstand2ZOffset = -(bed2Width / 2 + 0.28);

    const bed2Suite = createDetailedBedSuite({
      headboardX: headboard2X,
      headboardFacing: 'west',
      bedCenterZ: bed2CenterZ,
      bedWidth: bed2Width,
      bedLength: bed2Length,
      nightstandZOffset: nightstand2ZOffset,
      materials,
    });
    interiorGroup.add(bed2Suite);
  }

  // 7d. Inverter Mini-Split HVAC Wall Unit
  if (state.hasHvacMiniSplit) {
    const hvacGeo = new THREE.BoxGeometry(0.8, 0.25, 0.18);
    const hvacMesh = new THREE.Mesh(hvacGeo, materials.metalTrimMaterial);
    hvacMesh.position.set(0, height - 0.25, -depth / 2 + 0.12 + wallThickness);
    interiorGroup.add(hvacMesh);

    // Exterior heat pump compressor unit on rear wall
    const compressorGeo = new THREE.BoxGeometry(0.65, 0.55, 0.3);
    const compressorMesh = new THREE.Mesh(compressorGeo, materials.chassisMaterial);
    compressorMesh.position.set(length * 0.25, 0.55, -depth / 2 - 0.2);
    compressorMesh.castShadow = true;
    rootGroup.add(compressorMesh);
  }

  // 7e. Ceiling Downlights & Halo Ambient Strips (Lighting system)
  const lightCount = state.modelId === 'two-bedroom' ? 6 : state.modelId === 'one-bedroom' ? 4 : 2;
  const lightSpacing = (length - 1.5) / lightCount;

  for (let i = 0; i < lightCount; i++) {
    const spotX = -length / 2 + 1.0 + i * lightSpacing;
    const spotFixture = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), materials.downlightMaterial);
    spotFixture.position.set(spotX, height + 0.14, 0);
    interiorGroup.add(spotFixture);

    // Interior PointLight for authentic illumination
    const isNight = lightingMode === 'night-ambient';
    const isGolden = lightingMode === 'golden-hour';
    const intensity = isNight ? 12.0 : isGolden ? 8.0 : 4.0;

    const interiorPt = new THREE.PointLight(
      state.lightingPackage === 'halo-strip-ambient' ? 0xffaa44 : 0xfff4e6,
      intensity,
      5.5,
      1.5
    );
    interiorPt.position.set(spotX, height - 0.15, 0);
    interiorLights.push(interiorPt);
    interiorGroup.add(interiorPt);
  }

  rootGroup.add(interiorGroup);

  // 8. MODULAR ADD-ON: FRONT ENTRY PERGOLA & COMPOSITE DECK
  if (state.hasExteriorPergolaDeck) {
    const deckDepth = 2.4;
    const deckWidth = length + 0.8;

    // Platform deck
    const pergolaDeckGeo = new THREE.BoxGeometry(deckWidth, 0.15, deckDepth);
    const pergolaDeckMesh = new THREE.Mesh(pergolaDeckGeo, materials.woodDeckMaterial);
    pergolaDeckMesh.position.set(0, 0.075, depth / 2 + deckDepth / 2);
    pergolaDeckMesh.receiveShadow = true;
    pergolaGroup.add(pergolaDeckMesh);

    // Black aluminum pergola posts and trellis rafters
    const postGeo = new THREE.BoxGeometry(0.1, height + 0.1, 0.1);
    const postMat = materials.chassisMaterial;

    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(-deckWidth / 2 + 0.1, (height + 0.1) / 2, depth / 2 + deckDepth - 0.1);
    const post2 = new THREE.Mesh(postGeo, postMat);
    post2.position.set(deckWidth / 2 - 0.1, (height + 0.1) / 2, depth / 2 + deckDepth - 0.1);
    pergolaGroup.add(post1, post2);

    // Trellis rafters
    const rafterGeo = new THREE.BoxGeometry(deckWidth, 0.08, 0.06);
    for (let r = 0; r < 5; r++) {
      const rafter = new THREE.Mesh(rafterGeo, postMat);
      rafter.position.set(0, height + 0.15, depth / 2 + 0.3 + r * 0.45);
      rafter.castShadow = true;
      pergolaGroup.add(rafter);
    }

    rootGroup.add(pergolaGroup);
  }

  // Calculate 3D Hotspot Coordinates for Interactive Clicking
  const hotspotPositions = {
    walls: new THREE.Vector3(-length / 2, height * 0.6, 0),
    glazing: new THREE.Vector3(-doorWidth / 2, height * 0.5, depth / 2 + 0.1),
    lighting: new THREE.Vector3(0, height + 0.1, 0),
    flooring: new THREE.Vector3(0, 0.2, 0.4),
    roof: new THREE.Vector3(0, height + roofThickness + 0.3, 0),
    kitchenette: new THREE.Vector3(state.modelId === 'studio' ? -0.5 : (state.modelId === 'one-bedroom' ? -1.3 : -2.2), 1.2, -depth / 2 + 0.8),
    bath: new THREE.Vector3(-length / 2 + 1.2, 1.3, -depth / 2 + 1.0),
    bedroom: new THREE.Vector3(length / 2 - 1.2, 1.1, -depth / 2 + 1.1),
    living: new THREE.Vector3(
      state.modelId === 'studio' ? -0.35 : (state.modelId === 'one-bedroom' ? -length * 0.2 : 0.0),
      0.8,
      0.65
    ),
  };

  return {
    rootGroup,
    roofGroup,
    frontWallGroup,
    interiorGroup,
    solarGroup,
    terraceGroup,
    pergolaGroup,
    interiorLights,
    hotspotPositions,
  };
}
