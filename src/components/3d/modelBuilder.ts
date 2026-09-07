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

  // 7b. Gourmet Kitchenette Module
  if (state.hasKitchenetteModule) {
    const kitchenGroup = new THREE.Group();
    const kitchenLength = state.modelId === 'studio' ? 1.6 : 2.4;
    const kitchenX = state.modelId === 'studio' ? -0.6 : (state.modelId === 'one-bedroom' ? -1.5 : -2.5);

    // Lower Euro Cabinets
    const lowerCabGeo = new THREE.BoxGeometry(kitchenLength, 0.85, 0.6);
    const lowerCabMesh = new THREE.Mesh(lowerCabGeo, materials.cabinetMaterial);
    lowerCabMesh.position.set(kitchenX, 0.15 + 0.425, -depth / 2 + 0.3 + wallThickness);
    lowerCabMesh.castShadow = true;
    kitchenGroup.add(lowerCabMesh);

    // Waterfall Quartz Countertop
    const counterGeo = new THREE.BoxGeometry(kitchenLength + 0.04, 0.05, 0.65);
    const counterMesh = new THREE.Mesh(counterGeo, materials.countertopMaterial);
    counterMesh.position.set(kitchenX, 0.15 + 0.85 + 0.025, -depth / 2 + 0.3 + wallThickness);
    kitchenGroup.add(counterMesh);

    // Induction cooktop
    const cooktopGeo = new THREE.BoxGeometry(0.45, 0.01, 0.35);
    const cooktopMesh = new THREE.Mesh(cooktopGeo, materials.chassisMaterial);
    cooktopMesh.position.set(kitchenX - 0.5, 0.15 + 0.88, -depth / 2 + 0.3 + wallThickness);
    kitchenGroup.add(cooktopMesh);

    // Stainless undermount sink & faucet
    const sinkGeo = new THREE.BoxGeometry(0.4, 0.02, 0.35);
    const sinkMesh = new THREE.Mesh(sinkGeo, materials.metalTrimMaterial);
    sinkMesh.position.set(kitchenX + 0.3, 0.15 + 0.88, -depth / 2 + 0.3 + wallThickness);
    kitchenGroup.add(sinkMesh);

    // High-arc gooseneck faucet
    const faucetGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8);
    const faucetMesh = new THREE.Mesh(faucetGeo, materials.metalTrimMaterial);
    faucetMesh.position.set(kitchenX + 0.3, 0.15 + 1.05, -depth / 2 + 0.18 + wallThickness);
    kitchenGroup.add(faucetMesh);

    // Upper Floating Open Shelving
    const shelfGeo = new THREE.BoxGeometry(kitchenLength * 0.9, 0.03, 0.28);
    const shelfMesh = new THREE.Mesh(shelfGeo, materials.countertopMaterial);
    shelfMesh.position.set(kitchenX, 1.8, -depth / 2 + 0.15 + wallThickness);
    kitchenGroup.add(shelfMesh);

    interiorGroup.add(kitchenGroup);
  }

  // 7c. Living Room & Sleeping Suite
  const bedGroup = new THREE.Group();
  // Modern low-profile platform bed
  const bedWidth = state.modelId === 'studio' ? 1.4 : 1.6;
  const bedLength = 1.9;
  const mattressGeo = new THREE.BoxGeometry(bedLength, 0.25, bedWidth);
  const mattressMesh = new THREE.Mesh(mattressGeo, materials.interiorWallMaterial);
  mattressMesh.position.set(length / 2 - bedLength / 2 - 0.3, 0.15 + 0.35, -depth / 2 + bedWidth / 2 + 0.2);
  mattressMesh.castShadow = true;
  bedGroup.add(mattressMesh);

  // Headboard
  const headboardGeo = new THREE.BoxGeometry(0.1, 0.8, bedWidth + 0.2);
  const headboardMesh = new THREE.Mesh(headboardGeo, materials.cabinetMaterial);
  headboardMesh.position.set(length / 2 - 0.25, 0.15 + 0.4, -depth / 2 + bedWidth / 2 + 0.2);
  bedGroup.add(headboardMesh);

  // Pillows
  const pillowGeo = new THREE.BoxGeometry(0.3, 0.1, 0.5);
  const pillow1 = new THREE.Mesh(pillowGeo, materials.furnitureFabricMaterial);
  pillow1.position.set(length / 2 - 0.5, 0.15 + 0.5, -depth / 2 + bedWidth / 2 - 0.25 + 0.2);
  pillow1.rotation.z = Math.PI / 12;
  const pillow2 = new THREE.Mesh(pillowGeo, materials.furnitureFabricMaterial);
  pillow2.position.set(length / 2 - 0.5, 0.15 + 0.5, -depth / 2 + bedWidth / 2 + 0.25 + 0.2);
  pillow2.rotation.z = Math.PI / 12;
  bedGroup.add(pillow1, pillow2);

  // Soft textured blanket/throw
  const throwGeo = new THREE.BoxGeometry(0.8, 0.26, bedWidth);
  const throwMesh = new THREE.Mesh(throwGeo, materials.furnitureFabricMaterial);
  throwMesh.position.set(length / 2 - 1.2, 0.15 + 0.36, -depth / 2 + bedWidth / 2 + 0.2);
  bedGroup.add(throwMesh);

  // Bedroom Area Rug
  const bedRugGeo = new THREE.BoxGeometry(2.6, 0.02, 2.2);
  const bedRug = new THREE.Mesh(bedRugGeo, materials.furnitureFabricMaterial);
  bedRug.position.set(length / 2 - bedLength / 2 - 0.3, 0.16, -depth / 2 + bedWidth / 2 + 0.2);
  bedGroup.add(bedRug);

  interiorGroup.add(bedGroup);

  // Additional room modules for 1-Bed and 2-Bed models
  if (state.modelId === 'one-bedroom' || state.modelId === 'two-bedroom') {
    // Interior partition wall between bedroom and living room
    const dividerGeo = new THREE.BoxGeometry(0.1, height - 0.1, depth * 0.6);
    const dividerMesh = new THREE.Mesh(dividerGeo, materials.interiorWallMaterial);
    dividerMesh.position.set(length * 0.15, (height - 0.1) / 2 + 0.15, 0);
    dividerMesh.castShadow = true;
    interiorGroup.add(dividerMesh);

    // Designer Sofa in Great Room
    const sofaGroup = new THREE.Group();
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.8), materials.furnitureFabricMaterial);
    sofaBase.position.set(-length * 0.2, 0.35, 0.3);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.25), materials.furnitureFabricMaterial);
    sofaBack.position.set(-length * 0.2, 0.6, -0.1);
    
    // Armrests
    const armGeo = new THREE.BoxGeometry(0.2, 0.5, 0.8);
    const armLeft = new THREE.Mesh(armGeo, materials.furnitureFabricMaterial);
    armLeft.position.set(-length * 0.2 - 0.9 + 0.1, 0.45, 0.3);
    const armRight = new THREE.Mesh(armGeo, materials.furnitureFabricMaterial);
    armRight.position.set(-length * 0.2 + 0.9 - 0.1, 0.45, 0.3);
    
    // Sofa Throw Pillows
    const throwPillowGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const tp1 = new THREE.Mesh(throwPillowGeo, materials.furnitureFabricMaterial);
    tp1.position.set(-length * 0.2 - 0.6, 0.6, 0.05);
    tp1.rotation.y = Math.PI / 8;
    tp1.rotation.x = -Math.PI / 12;
    const tp2 = new THREE.Mesh(throwPillowGeo, materials.furnitureFabricMaterial);
    tp2.position.set(-length * 0.2 + 0.6, 0.6, 0.05);
    tp2.rotation.y = -Math.PI / 8;
    tp2.rotation.x = -Math.PI / 12;
    
    sofaGroup.add(sofaBase, sofaBack, armLeft, armRight, tp1, tp2);
    interiorGroup.add(sofaGroup);

    // Minimalist Coffee Table & Rug
    const coffeeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), materials.countertopMaterial);
    coffeeTable.position.set(-length * 0.2, 0.3, 0.95);
    
    const rugGeo = new THREE.BoxGeometry(2.4, 0.02, 1.6);
    const rug = new THREE.Mesh(rugGeo, materials.furnitureFabricMaterial);
    rug.position.set(-length * 0.2, 0.16, 0.7);
    
    interiorGroup.add(coffeeTable, rug);
  }

  if (state.modelId === 'two-bedroom') {
    // Second bedroom bed suite on opposite wing
    const bed2Group = new THREE.Group();
    const bed2 = new THREE.Mesh(new THREE.BoxGeometry(bedLength, 0.25, bedWidth), materials.interiorWallMaterial);
    bed2.position.set(-length / 2 + bedLength / 2 + 0.3, 0.15 + 0.35, depth / 2 - bedWidth / 2 - 0.2);
    bed2.castShadow = true;
    bed2Group.add(bed2);

    // Headboard 2
    const headboard2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, bedWidth + 0.2), materials.cabinetMaterial);
    headboard2.position.set(-length / 2 + 0.25, 0.15 + 0.4, depth / 2 - bedWidth / 2 - 0.2);
    bed2Group.add(headboard2);

    // Pillows 2
    const p1 = new THREE.Mesh(pillowGeo, materials.furnitureFabricMaterial);
    p1.position.set(-length / 2 + 0.5, 0.15 + 0.5, depth / 2 - bedWidth / 2 - 0.25 - 0.2);
    p1.rotation.z = -Math.PI / 12;
    const p2 = new THREE.Mesh(pillowGeo, materials.furnitureFabricMaterial);
    p2.position.set(-length / 2 + 0.5, 0.15 + 0.5, depth / 2 - bedWidth / 2 + 0.25 - 0.2);
    p2.rotation.z = -Math.PI / 12;
    bed2Group.add(p1, p2);

    // Throw 2
    const throw2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, bedWidth), materials.furnitureFabricMaterial);
    throw2.position.set(-length / 2 + 1.2, 0.15 + 0.36, depth / 2 - bedWidth / 2 - 0.2);
    bed2Group.add(throw2);

    // Bed 2 Rug
    const bed2RugGeo = new THREE.BoxGeometry(2.6, 0.02, 2.2);
    const bed2Rug = new THREE.Mesh(bed2RugGeo, materials.furnitureFabricMaterial);
    bed2Rug.position.set(-length / 2 + bedLength / 2 + 0.3, 0.16, depth / 2 - bedWidth / 2 - 0.2);
    bed2Group.add(bed2Rug);

    interiorGroup.add(bed2Group);
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
    kitchenette: new THREE.Vector3(state.modelId === 'studio' ? -0.6 : (state.modelId === 'one-bedroom' ? -1.5 : -2.5), 1.2, -depth / 2 + 0.7),
    bath: new THREE.Vector3(-length / 2 + 1.2, 1.3, -depth / 2 + 1.0),
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
