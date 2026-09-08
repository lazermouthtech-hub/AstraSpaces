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

  let doorX = -length / 2 + doorWidth / 2 + 0.65; // Default left side (studio), flush with the wardrobe
  if (state.modelId === 'one-bedroom') {
    // Place door on the far left side of the living area
    doorX = -length / 2 + doorWidth / 2 + 0.15;
  } else if (state.modelId === 'two-bedroom') {
    // Place door on the left side of the central living area
    doorX = -1.2;
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

  // Motorized Blinds/Curtains (if enabled)
  if (state.hasElectricBlinds) {
    const curtainGroup = new THREE.Group();
    
    // Motorized Track / Rail Housing at the top
    const trackGeo = new THREE.BoxGeometry(glassWidth + doorWidth + 0.1, 0.08, 0.08);
    const trackMat = materials.metalTrimMaterial;
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    // Positioned at the top header, just inside the glass
    trackMesh.position.set(0, height + 0.15 - 0.04, depth / 2 - wallThickness / 2 - 0.08);
    curtainGroup.add(trackMesh);

    // Motor Unit on the side of the track
    const motorGeo = new THREE.BoxGeometry(0.12, 0.1, 0.1);
    const motorMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
    const motorMesh = new THREE.Mesh(motorGeo, motorMat);
    motorMesh.position.set((glassWidth + doorWidth) / 2 + 0.05, height + 0.15 - 0.05, depth / 2 - wallThickness / 2 - 0.08);
    curtainGroup.add(motorMesh);

    // Small LED on the motor unit
    const ledGeo = new THREE.CircleGeometry(0.01, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: '#3b82f6' }); // Blue LED
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set((glassWidth + doorWidth) / 2 + 0.05, height + 0.15 - 0.05, depth / 2 - wallThickness / 2 - 0.029);
    curtainGroup.add(ledMesh);

    // Wavy Curtain Fabric
    // Create a wavy shape for the curtain to simulate folds
    const curtainMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    const segments = 60;
    const curtainW = glassWidth + doorWidth;
    const curtainH = glassHeight + 0.2; // Floor to ceiling
    
    const curtainGeo = new THREE.PlaneGeometry(curtainW, curtainH, segments, 1);
    
    // Apply sine wave displacement to vertices to create folds
    const posAttribute = curtainGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      // Create waves based on X position.
      // Adjust frequency and amplitude to simulate draped fabric folds.
      const zOffset = Math.sin(x * 20) * 0.03; 
      posAttribute.setZ(i, zOffset);
    }
    curtainGeo.computeVertexNormals();

    const curtainMesh = new THREE.Mesh(curtainGeo, curtainMat);
    // Position half-open or partially drawn depending on preference
    // We'll draw it mostly covering the glass but slightly pulled back from the door
    curtainMesh.position.set(-0.05, height / 2 + 0.15, depth / 2 - wallThickness / 2 - 0.08);
    curtainGroup.add(curtainMesh);

    frontWallGroup.add(curtainGroup);
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

  // 6. ROOF OPTIONS: ARCHITECTURAL SOLAR ARRAY, OBSERVATORY TERRACE & SPIRAL STAIRS
  const roofBaseY = height + 0.15 + roofThickness;

  // Helper: Detailed Architectural Monocrystalline Solar Array
  const createDetailedSolarArray = (solarCount: number, arrayCenterX: number, arrayCenterZ: number) => {
    const group = new THREE.Group();
    const panelW = 1.08;
    const panelL = 1.72;
    const tiltAngle = 0.18; // ~10.3° sun-optimized tilt
    const panelSpacingX = panelW + 0.05;
    const totalArrayW = (solarCount - 1) * panelSpacingX + panelW;
    const startX = -((solarCount - 1) * panelSpacingX) / 2;

    // Structural Aluminum Unistrut Mounting Rails
    const railLen = totalArrayW + 0.22;
    const railOffsetZ = (panelL * 0.28) * Math.cos(tiltAngle);

    const railGeo = new THREE.BoxGeometry(railLen, 0.038, 0.04);
    // Front rail
    const frontRail = new THREE.Mesh(railGeo, materials.solarRailMaterial);
    frontRail.position.set(arrayCenterX, roofBaseY + 0.045, arrayCenterZ + railOffsetZ);
    frontRail.castShadow = true;
    group.add(frontRail);

    // Rear rail (elevated to create sun tilt)
    const rearRailH = 0.045 + (panelL * 0.56) * Math.sin(tiltAngle);
    const rearRail = new THREE.Mesh(railGeo, materials.solarRailMaterial);
    rearRail.position.set(arrayCenterX, roofBaseY + rearRailH, arrayCenterZ - railOffsetZ);
    rearRail.castShadow = true;
    group.add(rearRail);

    // Structural Stanchions & L-Feet Brackets along the rails
    const stanchionCount = Math.max(3, solarCount + 1);
    const stanchionStepX = totalArrayW / (stanchionCount - 1);
    for (let s = 0; s < stanchionCount; s++) {
      const sx = arrayCenterX - totalArrayW / 2 + s * stanchionStepX;
      // Front L-foot
      const footGeo = new THREE.BoxGeometry(0.06, 0.01, 0.06);
      const footFront = new THREE.Mesh(footGeo, materials.solarRailMaterial);
      footFront.position.set(sx, roofBaseY + 0.005, arrayCenterZ + railOffsetZ);
      group.add(footFront);

      const postFrontGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.04, 8);
      const postFront = new THREE.Mesh(postFrontGeo, materials.solarRailMaterial);
      postFront.position.set(sx, roofBaseY + 0.025, arrayCenterZ + railOffsetZ);
      group.add(postFront);

      // Rear L-foot & angled riser strut
      const footRear = new THREE.Mesh(footGeo, materials.solarRailMaterial);
      footRear.position.set(sx, roofBaseY + 0.005, arrayCenterZ - railOffsetZ);
      group.add(footRear);

      const postRearGeo = new THREE.CylinderGeometry(0.014, 0.014, rearRailH, 8);
      const postRear = new THREE.Mesh(postRearGeo, materials.solarRailMaterial);
      postRear.position.set(sx, roofBaseY + rearRailH / 2, arrayCenterZ - railOffsetZ);
      group.add(postRear);
    }

    // Individual High-Efficiency PV Modules
    for (let i = 0; i < solarCount; i++) {
      const px = arrayCenterX + startX + i * panelSpacingX;
      const py = roofBaseY + 0.045 + (rearRailH - 0.045) / 2 + 0.025;
      const pz = arrayCenterZ;

      const panelSub = new THREE.Group();
      panelSub.position.set(px, py, pz);
      panelSub.rotation.x = -tiltAngle;

      // 1. Extruded Matte Black Anodized Aluminum Perimeter Frame
      const frameThick = 0.032;
      const frameHeight = 0.035;

      // Left & right frame channels
      const sideFrameGeo = new THREE.BoxGeometry(frameThick, frameHeight, panelL);
      const leftFrame = new THREE.Mesh(sideFrameGeo, materials.solarFrameMaterial);
      leftFrame.position.set(-panelW / 2 + frameThick / 2, 0, 0);
      leftFrame.castShadow = true;
      panelSub.add(leftFrame);

      const rightFrame = new THREE.Mesh(sideFrameGeo, materials.solarFrameMaterial);
      rightFrame.position.set(panelW / 2 - frameThick / 2, 0, 0);
      rightFrame.castShadow = true;
      panelSub.add(rightFrame);

      // Top & bottom frame channels
      const endFrameGeo = new THREE.BoxGeometry(panelW - frameThick * 2, frameHeight, frameThick);
      const topFrame = new THREE.Mesh(endFrameGeo, materials.solarFrameMaterial);
      topFrame.position.set(0, 0, -panelL / 2 + frameThick / 2);
      topFrame.castShadow = true;
      panelSub.add(topFrame);

      const botFrame = new THREE.Mesh(endFrameGeo, materials.solarFrameMaterial);
      botFrame.position.set(0, 0, panelL / 2 - frameThick / 2);
      botFrame.castShadow = true;
      panelSub.add(botFrame);

      // 2. Recessed Monocrystalline Photovoltaic Silicon Glass Face
      const glassGeo = new THREE.BoxGeometry(panelW - frameThick * 1.5, 0.008, panelL - frameThick * 1.5);
      const glassMesh = new THREE.Mesh(glassGeo, materials.solarMaterial);
      glassMesh.position.set(0, 0.01, 0);
      glassMesh.castShadow = true;
      glassMesh.receiveShadow = true;
      panelSub.add(glassMesh);

      // Composite weatherproof backsheet
      const backGeo = new THREE.BoxGeometry(panelW - frameThick * 1.5, 0.004, panelL - frameThick * 1.5);
      const backMesh = new THREE.Mesh(backGeo, materials.solarFrameMaterial);
      backMesh.position.set(0, 0.002, 0);
      panelSub.add(backMesh);

      // 3. Balance of System: Underside Microinverter Unit
      const inverterGeo = new THREE.BoxGeometry(0.18, 0.038, 0.12);
      const inverterMesh = new THREE.Mesh(inverterGeo, materials.solarMicroinverterMaterial);
      inverterMesh.position.set(0, -0.032, 0);
      panelSub.add(inverterMesh);

      // Microinverter status LED (glowing green operational indicator)
      const ledGeo = new THREE.SphereGeometry(0.006, 8, 8);
      const ledMesh = new THREE.Mesh(ledGeo, materials.solarStatusLedMaterial);
      ledMesh.position.set(0.07, -0.048, 0.035);
      panelSub.add(ledMesh);

      // DC wire conduit leads
      const wireGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6);
      const wireMesh1 = new THREE.Mesh(wireGeo, materials.solarConduitMaterial);
      wireMesh1.position.set(-0.04, -0.025, 0.05);
      wireMesh1.rotation.x = 0.4;
      panelSub.add(wireMesh1);

      const wireMesh2 = new THREE.Mesh(wireGeo, materials.solarConduitMaterial);
      wireMesh2.position.set(0.04, -0.025, 0.05);
      wireMesh2.rotation.x = 0.4;
      panelSub.add(wireMesh2);

      group.add(panelSub);

      // Fasteners: Mid-Clamps and End-Clamps
      if (i < solarCount - 1) {
        // Mid-clamps between adjacent panels (front & rear rails)
        const midClampGeo = new THREE.BoxGeometry(0.028, 0.02, 0.045);
        const mcFront = new THREE.Mesh(midClampGeo, materials.solarClampMaterial);
        mcFront.position.set(px + panelSpacingX / 2, py + 0.015, pz + railOffsetZ);
        mcFront.rotation.x = -tiltAngle;
        group.add(mcFront);

        const mcRear = new THREE.Mesh(midClampGeo, materials.solarClampMaterial);
        mcRear.position.set(px + panelSpacingX / 2, py + 0.015, pz - railOffsetZ);
        mcRear.rotation.x = -tiltAngle;
        group.add(mcRear);
      }
    }

    // Rooftop Electrical Combiner / Transition Box
    const jboxGeo = new THREE.BoxGeometry(0.18, 0.14, 0.12);
    const jboxMesh = new THREE.Mesh(jboxGeo, materials.solarConduitMaterial);
    const jboxX = arrayCenterX - totalArrayW / 2 - 0.22;
    const jboxZ = arrayCenterZ - railOffsetZ;
    jboxMesh.position.set(jboxX, roofBaseY + 0.08, jboxZ);
    jboxMesh.castShadow = true;
    group.add(jboxMesh);

    // Yellow Caution Placard
    const placardGeo = new THREE.BoxGeometry(0.09, 0.055, 0.004);
    const placardMesh = new THREE.Mesh(placardGeo, materials.solarDecalMaterial);
    placardMesh.position.set(jboxX, roofBaseY + 0.08, jboxZ + 0.062);
    group.add(placardMesh);

    // Weatherproof roof conduit penetration boot
    const bootGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.04, 12);
    const bootMesh = new THREE.Mesh(bootGeo, materials.solarConduitMaterial);
    bootMesh.position.set(jboxX, roofBaseY + 0.02, jboxZ);
    group.add(bootMesh);

    // Conduit tube from junction box to rail
    const conduitGeo = new THREE.CylinderGeometry(0.01, 0.01, totalArrayW + 0.3, 8);
    const conduitMesh = new THREE.Mesh(conduitGeo, materials.solarConduitMaterial);
    conduitMesh.position.set(arrayCenterX, roofBaseY + 0.035, jboxZ);
    conduitMesh.rotation.z = Math.PI / 2;
    group.add(conduitMesh);

    return group;
  };

  // Helper: Detailed Rooftop Observatory Terrace & Glass Balustrade
  const createDetailedRooftopObservatory = (
    deckW: number,
    deckD: number,
    deckCenterX: number,
    deckCenterZ: number,
    stairSide: 'left' | 'right'
  ) => {
    const group = new THREE.Group();

    // 1. Walkable Hardwood/Teak Grooved Decking with Perimeter Facia
    const faciaGeo = new THREE.BoxGeometry(deckW + 0.04, 0.06, deckD + 0.04);
    const faciaMesh = new THREE.Mesh(faciaGeo, materials.chassisMaterial);
    faciaMesh.position.set(deckCenterX, roofBaseY + 0.01, deckCenterZ);
    faciaMesh.castShadow = true;
    group.add(faciaMesh);

    // Realistic Individual Decking Boards with shadow reveals
    const boardCount = 9;
    const boardZSpan = (deckD - 0.05) / boardCount;
    for (let b = 0; b < boardCount; b++) {
      const bz = deckCenterZ - deckD / 2 + 0.025 + b * boardZSpan + boardZSpan / 2;
      const boardGeo = new THREE.BoxGeometry(deckW - 0.02, 0.024, boardZSpan - 0.008);
      const boardMesh = new THREE.Mesh(boardGeo, materials.woodDeckMaterial);
      boardMesh.position.set(deckCenterX, roofBaseY + 0.032, bz);
      boardMesh.receiveShadow = true;
      group.add(boardMesh);
    }

    // Flush-mount perimeter LED deck puck lights
    const puckPositions = [
      [deckCenterX - deckW / 2 + 0.25, deckCenterZ + deckD / 2 - 0.25],
      [deckCenterX + deckW / 2 - 0.25, deckCenterZ + deckD / 2 - 0.25],
      [deckCenterX - deckW / 2 + 0.25, deckCenterZ - deckD / 2 + 0.25],
      [deckCenterX + deckW / 2 - 0.25, deckCenterZ - deckD / 2 + 0.25],
    ];
    puckPositions.forEach(([px, pz]) => {
      const puckGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.006, 12);
      const puckMesh = new THREE.Mesh(puckGeo, materials.terraceLightMaterial);
      puckMesh.position.set(px, roofBaseY + 0.046, pz);
      group.add(puckMesh);
    });

    // 2. Architectural Frameless Tempered Glass & Modular Balustrade System
    const railHeight = 0.96;
    const shoeHeight = 0.05;
    const shoeThick = 0.038;
    const capHeight = 0.036;
    const capWidth = 0.052;

    // Helper: Build segmented glass panels with spigot clamps and top cap channel
    const createSegmentedGlassLine = (
      startX: number,
      startZ: number,
      endX: number,
      endZ: number,
      panelMaxSpan = 1.05
    ) => {
      const subGroup = new THREE.Group();
      const dx = endX - startX;
      const dz = endZ - startZ;
      const totalLen = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);
      const panelCount = Math.max(1, Math.round(totalLen / panelMaxSpan));
      const panelSpan = totalLen / panelCount;
      const jointGap = 0.022; // 22mm architectural expansion gap

      // Base shoe mounting channel
      const shoeGeo = new THREE.BoxGeometry(totalLen, shoeHeight, shoeThick);
      const shoeMesh = new THREE.Mesh(shoeGeo, materials.chassisMaterial);
      shoeMesh.position.set((startX + endX) / 2, roofBaseY + 0.045 + shoeHeight / 2, (startZ + endZ) / 2);
      shoeMesh.rotation.y = -angle;
      subGroup.add(shoeMesh);

      // Continuous top cap rail
      const capGeo = new THREE.BoxGeometry(totalLen, capHeight, capWidth);
      const capMesh = new THREE.Mesh(capGeo, materials.chassisMaterial);
      capMesh.position.set((startX + endX) / 2, roofBaseY + 0.045 + railHeight, (startZ + endZ) / 2);
      capMesh.rotation.y = -angle;
      capMesh.castShadow = true;
      subGroup.add(capMesh);

      // Discrete tempered glass panels & stainless steel spigots
      for (let p = 0; p < panelCount; p++) {
        const segDist = (p + 0.5) * panelSpan;
        const px = startX + Math.cos(angle) * segDist;
        const pz = startZ + Math.sin(angle) * segDist;
        const effectiveGlassW = Math.max(0.15, panelSpan - jointGap);

        const glassGeo = new THREE.BoxGeometry(effectiveGlassW, railHeight, 0.016);
        const glassMesh = new THREE.Mesh(glassGeo, materials.glassMaterial);
        glassMesh.position.set(px, roofBaseY + 0.045 + railHeight / 2, pz);
        glassMesh.rotation.y = -angle;
        subGroup.add(glassMesh);

        // Stainless steel spigot clamps (2 per panel)
        [-effectiveGlassW * 0.32, effectiveGlassW * 0.32].forEach((spigotOffset) => {
          const sx = px + Math.cos(angle) * spigotOffset;
          const sz = pz + Math.sin(angle) * spigotOffset;
          const spigotGeo = new THREE.BoxGeometry(0.04, 0.09, 0.04);
          const spigotMesh = new THREE.Mesh(spigotGeo, materials.chassisMaterial);
          spigotMesh.position.set(sx, roofBaseY + 0.045 + 0.045, sz);
          spigotMesh.rotation.y = -angle;
          subGroup.add(spigotMesh);
        });
      }

      return subGroup;
    };

    // Front Balustrade Line
    group.add(
      createSegmentedGlassLine(
        deckCenterX - deckW / 2,
        deckCenterZ + deckD / 2 - shoeThick / 2,
        deckCenterX + deckW / 2,
        deckCenterZ + deckD / 2 - shoeThick / 2
      )
    );

    // Rear Balustrade Line
    group.add(
      createSegmentedGlassLine(
        deckCenterX - deckW / 2,
        deckCenterZ - deckD / 2 + shoeThick / 2,
        deckCenterX + deckW / 2,
        deckCenterZ - deckD / 2 + shoeThick / 2
      )
    );

    // Side Railings: Non-stair side is closed; stair side features a dedicated 0.90m portal opening!
    const nonStairSign = stairSide === 'left' ? 1 : -1;
    const stairSign = -nonStairSign;
    const portalCenterZ = -deckD * 0.12;
    const portalW = 0.90;

    // Closed side railing
    const closedSideX = deckCenterX + (nonStairSign * deckW) / 2;
    group.add(
      createSegmentedGlassLine(
        closedSideX,
        deckCenterZ - deckD / 2 + shoeThick / 2,
        closedSideX,
        deckCenterZ + deckD / 2 - shoeThick / 2
      )
    );

    // Stair side railing with intentional 0.90m portal opening
    const stairSideX = deckCenterX + (stairSign * deckW) / 2;
    const frontPortZ = portalCenterZ + portalW / 2;
    const rearPortZ = portalCenterZ - portalW / 2;
    const frontDeckZ = deckCenterZ + deckD / 2 - shoeThick / 2;
    const rearDeckZ = deckCenterZ - deckD / 2 + shoeThick / 2;

    // Front section before portal
    if (frontDeckZ - frontPortZ > 0.25) {
      group.add(createSegmentedGlassLine(stairSideX, frontPortZ, stairSideX, frontDeckZ));
    }
    // Rear section after portal
    if (rearPortZ - rearDeckZ > 0.25) {
      group.add(createSegmentedGlassLine(stairSideX, rearDeckZ, stairSideX, rearPortZ));
    }

    // Portal entry threshold reveal plate & safety baluster posts
    const portalPostGeo = new THREE.BoxGeometry(0.045, railHeight + 0.04, 0.045);
    const postFrontPortal = new THREE.Mesh(portalPostGeo, materials.chassisMaterial);
    postFrontPortal.position.set(stairSideX, roofBaseY + 0.045 + (railHeight + 0.04) / 2, frontPortZ);
    group.add(postFrontPortal);

    const postRearPortal = new THREE.Mesh(portalPostGeo, materials.chassisMaterial);
    postRearPortal.position.set(stairSideX, roofBaseY + 0.045 + (railHeight + 0.04) / 2, rearPortZ);
    group.add(postRearPortal);

    // Perimeter Corner Posts
    const cornerPosts = [
      [deckCenterX - deckW / 2, deckCenterZ - deckD / 2],
      [deckCenterX + deckW / 2, deckCenterZ - deckD / 2],
      [deckCenterX - deckW / 2, deckCenterZ + deckD / 2],
      [deckCenterX + deckW / 2, deckCenterZ + deckD / 2],
    ];
    cornerPosts.forEach(([cx, cz]) => {
      const postGeo = new THREE.BoxGeometry(0.048, railHeight + 0.04, 0.048);
      const postMesh = new THREE.Mesh(postGeo, materials.chassisMaterial);
      postMesh.position.set(cx, roofBaseY + 0.045 + (railHeight + 0.04) / 2, cz);
      group.add(postMesh);
    });

    // 3. Astronomical Stargazing Telescope Assembly
    const teleGroup = new THREE.Group();
    const teleX = deckCenterX - deckW * 0.20;
    const teleZ = deckCenterZ + deckD * 0.18;
    teleGroup.position.set(teleX, roofBaseY + 0.045, teleZ);

    // Heavy-duty cast tripod legs with anti-vibration foot pads
    const legGeo = new THREE.CylinderGeometry(0.018, 0.014, 0.88, 8);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legMesh = new THREE.Mesh(legGeo, materials.chassisMaterial);
      legMesh.position.set(Math.cos(angle) * 0.24, 0.42, Math.sin(angle) * 0.24);
      legMesh.rotation.z = Math.cos(angle) * 0.28;
      legMesh.rotation.x = -Math.sin(angle) * 0.28;
      legMesh.castShadow = true;
      teleGroup.add(legMesh);

      // Anti-vibration rubber foot pad
      const footGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.018, 8);
      const footMesh = new THREE.Mesh(footGeo, materials.chassisMaterial);
      footMesh.position.set(Math.cos(angle) * 0.40, 0.01, Math.sin(angle) * 0.40);
      teleGroup.add(footMesh);
    }

    // Tripod accessory spreader tray
    const trayGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.015, 6);
    const trayMesh = new THREE.Mesh(trayGeo, materials.chassisMaterial);
    trayMesh.position.set(0, 0.38, 0);
    teleGroup.add(trayMesh);

    // Central mounting column & motorized equatorial mount head
    const colGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 12);
    const colMesh = new THREE.Mesh(colGeo, materials.chassisMaterial);
    colMesh.position.set(0, 0.82, 0);
    teleGroup.add(colMesh);

    const headGeo = new THREE.SphereGeometry(0.058, 12, 12);
    const headMesh = new THREE.Mesh(headGeo, materials.brassHandleMaterial);
    headMesh.position.set(0, 1.06, 0);
    teleGroup.add(headMesh);

    // Counterweight shaft & balancing weights
    const shaftGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.34, 8);
    const shaftMesh = new THREE.Mesh(shaftGeo, materials.brassHandleMaterial);
    shaftMesh.position.set(0.13, 0.98, 0);
    shaftMesh.rotation.z = Math.PI / 3;
    teleGroup.add(shaftMesh);

    const weightGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.07, 12);
    const weightMesh = new THREE.Mesh(weightGeo, materials.chassisMaterial);
    weightMesh.position.set(0.22, 0.92, 0);
    weightMesh.rotation.z = Math.PI / 3;
    teleGroup.add(weightMesh);

    // Main Optical Barrel Tube (angled 40° toward the night sky)
    const barrelGeo = new THREE.CylinderGeometry(0.068, 0.058, 0.92, 16);
    const barrelMesh = new THREE.Mesh(barrelGeo, materials.telescopeBodyMaterial);
    barrelMesh.position.set(-0.08, 1.27, 0.08);
    barrelMesh.rotation.z = -Math.PI / 4.4;
    barrelMesh.rotation.y = 0.45;
    barrelMesh.castShadow = true;
    teleGroup.add(barrelMesh);

    // Dual Brass Retention Rings around Optical Barrel
    [-0.14, 0.14].forEach((rz) => {
      const ringGeo = new THREE.CylinderGeometry(0.074, 0.074, 0.024, 16);
      const ringMesh = new THREE.Mesh(ringGeo, materials.brassHandleMaterial);
      ringMesh.position.set(-0.08 + rz * 0.45, 1.27 - rz * 0.55, 0.08 + rz * 0.25);
      ringMesh.rotation.z = -Math.PI / 4.4;
      ringMesh.rotation.y = 0.45;
      teleGroup.add(ringMesh);
    });

    // Front dew shield & optical objective glass element
    const dewGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.18, 16);
    const dewMesh = new THREE.Mesh(dewGeo, materials.chassisMaterial);
    dewMesh.position.set(-0.36, 1.55, 0.23);
    dewMesh.rotation.z = -Math.PI / 4.4;
    dewMesh.rotation.y = 0.45;
    teleGroup.add(dewMesh);

    const lensGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.006, 16);
    const lensMesh = new THREE.Mesh(lensGeo, materials.glassMaterial);
    lensMesh.position.set(-0.39, 1.58, 0.25);
    lensMesh.rotation.z = -Math.PI / 4.4;
    lensMesh.rotation.y = 0.45;
    teleGroup.add(lensMesh);

    // Brass dual-eyepiece focuser & optical star diagonal
    const focuserGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.13, 12);
    const focuserMesh = new THREE.Mesh(focuserGeo, materials.brassHandleMaterial);
    focuserMesh.position.set(0.19, 0.99, -0.06);
    focuserMesh.rotation.z = -Math.PI / 4.4;
    focuserMesh.rotation.y = 0.45;
    teleGroup.add(focuserMesh);

    // Parallel optical finderscope with precision crosshair tube
    const finderGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.26, 8);
    const finderMesh = new THREE.Mesh(finderGeo, materials.brassHandleMaterial);
    finderMesh.position.set(-0.06, 1.36, 0.02);
    finderMesh.rotation.z = -Math.PI / 4.4;
    finderMesh.rotation.y = 0.45;
    teleGroup.add(finderMesh);

    group.add(teleGroup);

    // 4. Modern Minimalist Rooftop Lounge Seating & Refreshment Table
    const loungeGroup = new THREE.Group();
    const loungeX = deckCenterX + deckW * 0.18;
    const loungeZ = deckCenterZ - deckD * 0.10;
    loungeGroup.position.set(loungeX, roofBaseY + 0.045, loungeZ);

    // Teak lounge daybed frame
    const seatW = 1.08;
    const seatD = 0.70;
    const seatBaseGeo = new THREE.BoxGeometry(seatW, 0.08, seatD);
    const seatBase = new THREE.Mesh(seatBaseGeo, materials.woodDeckMaterial);
    seatBase.position.set(0, 0.14, 0);
    seatBase.castShadow = true;
    loungeGroup.add(seatBase);

    // Tapered powder-coated steel legs
    const slegGeo = new THREE.CylinderGeometry(0.014, 0.01, 0.14, 8);
    const legCoords = [
      [-seatW / 2 + 0.06, -seatD / 2 + 0.06],
      [seatW / 2 - 0.06, -seatD / 2 + 0.06],
      [-seatW / 2 + 0.06, seatD / 2 - 0.06],
      [seatW / 2 - 0.06, seatD / 2 - 0.06],
    ];
    legCoords.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(slegGeo, materials.chassisMaterial);
      leg.position.set(lx, 0.07, lz);
      loungeGroup.add(leg);
    });

    // Deep tailored all-weather charcoal seat cushion
    const cushionGeo = new THREE.BoxGeometry(seatW - 0.04, 0.11, seatD - 0.04);
    const cushion = new THREE.Mesh(cushionGeo, materials.terraceFabricMaterial);
    cushion.position.set(0, 0.23, 0);
    cushion.castShadow = true;
    loungeGroup.add(cushion);

    // Angled backrest cushion
    const backGeo = new THREE.BoxGeometry(seatW - 0.06, 0.26, 0.10);
    const backCushion = new THREE.Mesh(backGeo, materials.terraceFabricMaterial);
    backCushion.position.set(0, 0.38, -seatD / 2 + 0.08);
    backCushion.rotation.x = 0.14;
    backCushion.castShadow = true;
    loungeGroup.add(backCushion);

    // Cast stone / terrazzo side drinks table
    const tableGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.38, 16);
    const tableMesh = new THREE.Mesh(tableGeo, materials.terraceTableMaterial);
    tableMesh.position.set(-seatW / 2 - 0.26, 0.19, 0.08);
    tableMesh.castShadow = true;
    loungeGroup.add(tableMesh);

    // Clear glass hurricane lantern with glowing warm amber candle
    const lanternGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.16, 12);
    const lanternMesh = new THREE.Mesh(lanternGeo, materials.glassMaterial);
    lanternMesh.position.set(-seatW / 2 - 0.26, 0.46, 0.08);
    loungeGroup.add(lanternMesh);

    const candleGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.07, 10);
    const candleMesh = new THREE.Mesh(candleGeo, materials.candleGlowMaterial);
    candleMesh.position.set(-seatW / 2 - 0.26, 0.42, 0.08);
    loungeGroup.add(candleMesh);

    group.add(loungeGroup);

    // 5. Architectural Linear Planter with Ornamental Grasses along rear deck edge
    const planterW = deckW * 0.36;
    const planterH = 0.24;
    const planterD = 0.20;
    const planterGeo = new THREE.BoxGeometry(planterW, planterH, planterD);
    const planterMesh = new THREE.Mesh(planterGeo, materials.chassisMaterial);
    planterMesh.position.set(deckCenterX, roofBaseY + 0.045 + planterH / 2, deckCenterZ - deckD / 2 + planterD / 2 + 0.04);
    group.add(planterMesh);

    // Foliage inside planter
    const plantGrassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#365314'),
      roughness: 0.85,
    });
    for (let g = -3; g <= 3; g++) {
      const grassGeo = new THREE.ConeGeometry(0.07, 0.28, 6);
      const grassMesh = new THREE.Mesh(grassGeo, plantGrassMat);
      grassMesh.position.set(
        deckCenterX + (g / 4) * (planterW * 0.42),
        roofBaseY + 0.045 + planterH + 0.10,
        deckCenterZ - deckD / 2 + planterD / 2 + 0.04 + (g % 2 === 0 ? 0.02 : -0.02)
      );
      grassMesh.rotation.z = g * 0.06;
      group.add(grassMesh);
    }

    return group;
  };

  // Helper: Architectural Helical Spiral Side Staircase (Ground to Roof) with Seamless Bridge Access
  const createArchitecturalSpiralStaircase = (
    stairX: number,
    stairZ: number,
    topY: number,
    targetDeckEdgeX: number
  ) => {
    const stairGroup = new THREE.Group();

    // 1. Central Tubular Structural Steel Mast
    const mastH = topY + 1.05;
    const mastGeo = new THREE.CylinderGeometry(0.068, 0.068, mastH, 16);
    const mastMesh = new THREE.Mesh(mastGeo, materials.chassisMaterial);
    mastMesh.position.set(stairX, mastH / 2, stairZ);
    mastMesh.castShadow = true;
    stairGroup.add(mastMesh);

    // Top Mast Finial Weather Cap
    const finialGeo = new THREE.CylinderGeometry(0.074, 0.068, 0.06, 16);
    const finialMesh = new THREE.Mesh(finialGeo, materials.brassHandleMaterial);
    finialMesh.position.set(stairX, mastH + 0.03, stairZ);
    stairGroup.add(finialMesh);

    // Ground Concrete Foundation Footing Pad with Anchor Baseplate
    const footingGeo = new THREE.BoxGeometry(1.05, 0.08, 1.05);
    const footingMesh = new THREE.Mesh(footingGeo, materials.stairTreadMaterial);
    footingMesh.position.set(stairX, 0.04, stairZ);
    footingMesh.receiveShadow = true;
    stairGroup.add(footingMesh);

    const basePlateGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.03, 16);
    const basePlate = new THREE.Mesh(basePlateGeo, materials.chassisMaterial);
    basePlate.position.set(stairX, 0.09, stairZ);
    stairGroup.add(basePlate);

    // 2. Floating Cantilevered Steps spiraling upward
    const stepCount = 16;
    const stepRise = topY / stepCount;
    const totalRotation = Math.PI * 1.75;
    const stepAngle = totalRotation / (stepCount - 1);
    const rotationDir = stairX > 0 ? -1 : 1;

    for (let s = 0; s < stepCount; s++) {
      const angle = rotationDir * s * stepAngle;
      const stepY = s * stepRise + stepRise / 2;

      // Cantilever step tread
      const treadGeo = new THREE.BoxGeometry(0.74, 0.038, 0.24);
      const treadMesh = new THREE.Mesh(treadGeo, materials.stairTreadMaterial);
      treadMesh.position.set(stairX + Math.cos(angle) * 0.42, stepY, stairZ + Math.sin(angle) * 0.42);
      treadMesh.rotation.y = -angle;
      treadMesh.castShadow = true;
      treadMesh.receiveShadow = true;
      stairGroup.add(treadMesh);

      // Anodized non-slip safety nosing strip
      const nosingGeo = new THREE.BoxGeometry(0.74, 0.008, 0.02);
      const nosingMesh = new THREE.Mesh(nosingGeo, materials.chassisMaterial);
      nosingMesh.position.set(stairX + Math.cos(angle) * 0.42, stepY + 0.02, stairZ + Math.sin(angle) * 0.42 + 0.11);
      nosingMesh.rotation.y = -angle;
      stairGroup.add(nosingMesh);

      // Welded structural support bracket arm
      const armGeo = new THREE.BoxGeometry(0.70, 0.028, 0.05);
      const armMesh = new THREE.Mesh(armGeo, materials.chassisMaterial);
      armMesh.position.set(stairX + Math.cos(angle) * 0.40, stepY - 0.025, stairZ + Math.sin(angle) * 0.40);
      armMesh.rotation.y = -angle;
      stairGroup.add(armMesh);

      // Outer safety baluster rod
      const balusterGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.90, 8);
      const balusterMesh = new THREE.Mesh(balusterGeo, materials.chassisMaterial);
      const bx = stairX + Math.cos(angle) * 0.74;
      const bz = stairZ + Math.sin(angle) * 0.74;
      balusterMesh.position.set(bx, stepY + 0.45, bz);
      balusterMesh.castShadow = true;
      stairGroup.add(balusterMesh);

      // Under-tread warm LED step courtesy light
      const stepLightGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8);
      const stepLight = new THREE.Mesh(stepLightGeo, materials.terraceLightMaterial);
      stepLight.position.set(stairX + Math.cos(angle) * 0.46, stepY - 0.022, stairZ + Math.sin(angle) * 0.46);
      stairGroup.add(stepLight);

      // Handrail segment linking to subsequent baluster
      if (s < stepCount - 1) {
        const nextAngle = rotationDir * (s + 1) * stepAngle;
        const nextStepY = (s + 1) * stepRise + stepRise / 2;
        const nbx = stairX + Math.cos(nextAngle) * 0.74;
        const nbz = stairZ + Math.sin(nextAngle) * 0.74;

        const hx = (bx + nbx) / 2;
        const hy = (stepY + nextStepY) / 2 + 0.90;
        const hz = (bz + nbz) / 2;
        const dist = Math.hypot(nbx - bx, nextStepY - stepY, nbz - bz);

        const railSegmentGeo = new THREE.CylinderGeometry(0.018, 0.018, dist, 8);
        const railSegment = new THREE.Mesh(railSegmentGeo, materials.chassisMaterial);
        railSegment.position.set(hx, hy, hz);
        railSegment.lookAt(nbx, nextStepY + 0.90, nbz);
        railSegment.rotateX(Math.PI / 2);
        stairGroup.add(railSegment);
      }
    }

    // 3. Cantilevered Top Roof Landing Platform Bridge seamlessly connecting to the Rooftop Observatory
    const bridgeSpanX = Math.abs(targetDeckEdgeX - stairX);
    const bridgeW = bridgeSpanX + 0.12;
    const bridgeD = 0.88;
    const bridgeGeo = new THREE.BoxGeometry(bridgeW, 0.045, bridgeD);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, materials.woodDeckMaterial);
    const bridgeMidX = (stairX + targetDeckEdgeX) / 2;
    bridgeMesh.position.set(bridgeMidX, topY + 0.022, stairZ);
    bridgeMesh.castShadow = true;
    stairGroup.add(bridgeMesh);

    // Structural steel support beams underneath bridge
    [-bridgeD / 2 + 0.06, bridgeD / 2 - 0.06].forEach((bz) => {
      const bBeamGeo = new THREE.BoxGeometry(bridgeW, 0.07, 0.04);
      const bBeam = new THREE.Mesh(bBeamGeo, materials.chassisMaterial);
      bBeam.position.set(bridgeMidX, topY - 0.03, stairZ + bz);
      bBeam.castShadow = true;
      stairGroup.add(bBeam);
    });

    // Bridge Guardrails (Front and Back of the bridge)
    [-bridgeD / 2, bridgeD / 2].forEach((bz) => {
      const bGlassGeo = new THREE.BoxGeometry(bridgeW, 0.95, 0.016);
      const bGlass = new THREE.Mesh(bGlassGeo, materials.glassMaterial);
      bGlass.position.set(bridgeMidX, topY + 0.95 / 2 + 0.04, stairZ + bz);
      stairGroup.add(bGlass);

      const bCapGeo = new THREE.BoxGeometry(bridgeW, 0.038, 0.052);
      const bCap = new THREE.Mesh(bCapGeo, materials.chassisMaterial);
      bCap.position.set(bridgeMidX, topY + 0.95 + 0.04, stairZ + bz);
      stairGroup.add(bCap);
    });

    // Wall tie-back anchors pinning mast to cabin side wall
    const tieY1 = height * 0.45;
    const tieY2 = height * 0.85;
    [tieY1, tieY2].forEach((ty) => {
      const tieGeo = new THREE.CylinderGeometry(0.02, 0.02, Math.abs(stairX) - length / 2, 8);
      const tieMesh = new THREE.Mesh(tieGeo, materials.chassisMaterial);
      const tieMidX = stairX > 0 ? (length / 2 + stairX) / 2 : (-length / 2 + stairX) / 2;
      tieMesh.position.set(tieMidX, ty, stairZ);
      tieMesh.rotation.z = Math.PI / 2;
      stairGroup.add(tieMesh);
    });

    return stairGroup;
  };

  // Build the selected Roof Configurations
  if (state.roofOption === 'solar-array-3kw') {
    // Dedicated Solar Array (Full array centered on the roof)
    const solarCount = state.modelId === 'two-bedroom' ? 6 : state.modelId === 'one-bedroom' ? 4 : 2;
    const solarArray = createDetailedSolarArray(solarCount, 0, -depth * 0.06);
    solarGroup.add(solarArray);
  } else if (state.roofOption === 'rooftop-terrace-deck') {
    // Full Rooftop Observatory Terrace & Access Stairs
    const deckW = length * 0.78;
    const deckD = depth * 0.82;
    const terrace = createDetailedRooftopObservatory(deckW, deckD, 0, 0, 'left');
    terraceGroup.add(terrace);

    // Grounded Spiral Staircase leading to top terrace
    const deckEdgeX = -deckW / 2;
    const stairX = -length / 2 - 0.72;
    const stairZ = -depth * 0.12;
    const stairs = createArchitecturalSpiralStaircase(stairX, stairZ, roofBaseY, deckEdgeX);
    rootGroup.add(stairs);
  } else if (state.roofOption === 'solar-deck-combo') {
    // Integrated Combo: Solar Array on Left + Observatory Terrace on Right + Spiral Stairs
    const solarCount = state.modelId === 'two-bedroom' ? 4 : state.modelId === 'one-bedroom' ? 3 : 2;
    const solarArray = createDetailedSolarArray(solarCount, -length * 0.22, 0.0);
    solarGroup.add(solarArray);

    const deckW = length * 0.44;
    const deckD = depth * 0.82;
    const deckCenterX = length * 0.22;
    const terrace = createDetailedRooftopObservatory(deckW, deckD, deckCenterX, 0.0, 'right');
    terraceGroup.add(terrace);

    const deckEdgeX = deckCenterX + deckW / 2;
    const stairX = length / 2 + 0.72;
    const stairZ = -depth * 0.12;
    const stairs = createArchitecturalSpiralStaircase(stairX, stairZ, roofBaseY, deckEdgeX);
    rootGroup.add(stairs);
  }

  roofGroup.add(solarGroup);
  roofGroup.add(terraceGroup);
  rootGroup.add(roofGroup);

  // 7. INTERIOR FITOUT & MODULAR PODS
  // 7a. Integrated Bathroom Pod
  if (state.hasLuxuryBathPod) {
    const bathOriginX = state.modelId === 'two-bedroom' ? -2.2 : -length / 2;
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

    // Bathroom Door
    const bathDoorGeo = new THREE.BoxGeometry(0.7, height - 0.1, 0.04);
    const bathDoorMesh = new THREE.Mesh(bathDoorGeo, materials.woodDeckMaterial);
    // Positioned in the 0.7m gap on the right side of the front wall, slightly inset
    bathDoorMesh.position.set(bathOriginX + bathPodW - 0.35, (height - 0.1) / 2 + 0.15, -depth / 2 + bathPodD);
    
    // Add door handle
    const bathHandleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8);
    const bathHandleMesh = new THREE.Mesh(bathHandleGeo, materials.metalTrimMaterial);
    bathHandleMesh.position.set(bathOriginX + bathPodW - 0.6, (height - 0.1) / 2 + 0.15, -depth / 2 + bathPodD + 0.04);
    
    bathPodGroup.add(sideWallMesh, frontWallMesh, bathDoorMesh, bathHandleMesh);

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



    interiorGroup.add(bathPodGroup);
  }

  // 7b. Gourmet Architectural Kitchenette Module
  if (state.hasKitchenetteModule) {
    const kitchenGroup = new THREE.Group();
    // Adjust kitchen length and position to safely clear the bath pod
    const kitchenLength = state.modelId === 'studio' ? 1.8 : (state.modelId === 'one-bedroom' ? 1.9 : 3.0);
    const kitchenOriginX = state.modelId === 'two-bedroom' ? -0.8 : -length / 2 + 1.5;
    const kitchenX = kitchenOriginX + (kitchenLength / 2);
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
    const rugGeo = new THREE.BoxGeometry(bedLength + 0.40, 0.018, bedWidth + 0.50);
    const rugMesh = new THREE.Mesh(rugGeo, materials.furnitureFabricMaterial);
    rugMesh.position.set(bedCenterX - dirX * 0.15, 0.16, bedCenterZ + nightstandZOffset * 0.15);
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

  if (state.hasLuxuryBedSuite) {
    // Build bed at origin facing +Z after rotation
    const primaryBedSuite = createDetailedBedSuite({
      headboardX: 0,
      headboardFacing: 'east',
      bedCenterZ: 0,
      bedWidth,
      bedLength,
      nightstandZOffset: bedWidth / 2 + 0.28,
      materials,
    });
    
    // Rotate +Math.PI / 2 to map the -X extending bed (east) to +Z (front)
    primaryBedSuite.rotation.y = Math.PI / 2;
    
    if (state.modelId === 'studio') {
      // In studio, place bed on the right side of the back wall, shifted left to clear the wide headboard
      primaryBedSuite.position.set(length / 2 - 1.75, 0, -depth / 2 + 0.18);
    } else if (state.modelId === 'two-bedroom') {
      // For two-bedroom, primary bed is in the right bedroom (Partition at 2.2)
      primaryBedSuite.position.set(length / 2 - 1.55, 0, -depth / 2 + 0.18);
    }
    
    if (state.modelId !== 'one-bedroom') {
      interiorGroup.add(primaryBedSuite);
    }
    
    // Add Wardrobe to Studio
    if (state.modelId === 'studio') {
      const wWidth = depth <= 2.5 ? 0.55 : 0.8;
      const wDepth = 0.6;
      const wHeight = height - 0.1;
      const wardrobe = createWardrobe(wWidth, wHeight, wDepth);
      // Place against the left wall, right in front of the bathroom pod, doors facing right (+X)
      wardrobe.rotation.y = Math.PI / 2; 
      const bathOriginX = -length / 2;
      const bathPodD = 1.8;
      wardrobe.position.set(bathOriginX + wDepth / 2 + 0.05, wHeight / 2 + 0.15, -depth / 2 + bathPodD + 0.05 + wWidth / 2);
      interiorGroup.add(wardrobe);
    }
  }

  // High-Detail Designer Living Lounge (Sofa & Curated Coffee Table)
  // Excluded from Studio: Studio maintains an open minimalist layout with sleeping suite, bath, and kitchen
  if (state.modelId === 'one-bedroom') {
    // Adjusted interior partition wall between bedroom and living room
    const partitionX = 0.4;
    
    // Back wall segment
    const backWallGeo = new THREE.BoxGeometry(0.1, height - 0.1, 3.2);
    const backWallMesh = new THREE.Mesh(backWallGeo, materials.interiorWallMaterial);
    backWallMesh.position.set(partitionX, (height - 0.1) / 2 + 0.15, -1.1);
    backWallMesh.castShadow = true;
    
    // Front wall segment
    const frontWallGeo = new THREE.BoxGeometry(0.1, height - 0.1, 1.3);
    const frontWallMesh = new THREE.Mesh(frontWallGeo, materials.interiorWallMaterial);
    frontWallMesh.position.set(partitionX, (height - 0.1) / 2 + 0.15, 2.05);
    frontWallMesh.castShadow = true;
    
    // Bedroom Door
    const doorGeo = new THREE.BoxGeometry(0.04, height - 0.1, 0.9);
    const bedroomDoor = new THREE.Mesh(doorGeo, materials.woodDeckMaterial);
    bedroomDoor.position.set(partitionX, (height - 0.1) / 2 + 0.15, 0.95);
    bedroomDoor.rotation.y = -Math.PI / 4; // Open slightly into the living room

    interiorGroup.add(backWallMesh, frontWallMesh, bedroomDoor);

    // Repositioned 1-Bedroom Bed Suite facing the front glass doors (+Z)
    if (state.hasLuxuryBedSuite) {
      const oneBedSuite = createDetailedBedSuite({
        headboardX: 0,
        headboardFacing: 'east',
        bedCenterZ: 0,
        bedWidth: 1.6,
        bedLength: 1.95,
        nightstandZOffset: 1.6 / 2 + 0.28,
        materials,
      });
      
      // Rotate the bed so the foot points towards +Z (the front glass windows)
      oneBedSuite.rotation.y = Math.PI / 2;
      // Position it in the center of the newly partitioned bedroom space, shifted left to ensure the wide headboard clears the right wall
      const bedroomCenterX = (partitionX + (length / 2)) / 2 - 0.45;
      oneBedSuite.position.set(bedroomCenterX, 0, -depth / 2 + 0.18);
      
      interiorGroup.add(oneBedSuite);
      
      // 1-Bedroom Wardrobe (Inside the bedroom, right side of partition, pushed forward to clear bed)
      const wWidth = 0.8;
      const wDepth = 0.6;
      const wHeight = height - 0.1;
      const wardrobe = createWardrobe(wWidth, wHeight, wDepth);
      wardrobe.rotation.y = Math.PI / 2; // Doors face +X (towards the bed)
      wardrobe.position.set(partitionX + wDepth / 2 + 0.05, wHeight / 2 + 0.15, 0.1);
      interiorGroup.add(wardrobe);
    }

    // 1-Bedroom 3-seater luxury sofa & curated coffee table
    const oneBedLounge = createDetailedLivingLounge({
      sofaCenterX: -0.8, // Shifted right to clear the new left-side entrance door
      sofaCenterZ: 0.35,
      sofaWidth: 2.15,
      sofaDepth: 0.90,
      sofaFacingAngle: 0,
      materials,
    });
    interiorGroup.add(oneBedLounge);
  } else if (state.modelId === 'two-bedroom') {
    // Left Bedroom Partition Wall (-2.2)
    const partitionLeftX = -2.2;
    // Back wall segment
    const backWallGeo = new THREE.BoxGeometry(0.1, height - 0.1, 3.2);
    const leftBackWall = new THREE.Mesh(backWallGeo, materials.interiorWallMaterial);
    leftBackWall.position.set(partitionLeftX, (height - 0.1) / 2 + 0.15, -1.1);
    leftBackWall.castShadow = true;
    // Front wall segment
    const frontWallGeo = new THREE.BoxGeometry(0.1, height - 0.1, 1.3);
    const leftFrontWall = new THREE.Mesh(frontWallGeo, materials.interiorWallMaterial);
    leftFrontWall.position.set(partitionLeftX, (height - 0.1) / 2 + 0.15, 2.05);
    leftFrontWall.castShadow = true;
    
    // Left Bedroom Door Frame
    const doorGeo = new THREE.BoxGeometry(0.04, height - 0.1, 0.9);
    const leftDoor = new THREE.Mesh(doorGeo, materials.woodDeckMaterial);
    leftDoor.position.set(partitionLeftX, (height - 0.1) / 2 + 0.15, 0.95);
    leftDoor.rotation.y = Math.PI / 4; // Open slightly into the living room

    interiorGroup.add(leftBackWall, leftFrontWall, leftDoor);
    
    // Right Bedroom Partition Wall (2.2)
    const partitionRightX = 2.2;
    // Back wall segment
    const rightBackWall = new THREE.Mesh(backWallGeo, materials.interiorWallMaterial);
    rightBackWall.position.set(partitionRightX, (height - 0.1) / 2 + 0.15, -1.1);
    rightBackWall.castShadow = true;
    // Front wall segment
    const rightFrontWall = new THREE.Mesh(frontWallGeo, materials.interiorWallMaterial);
    rightFrontWall.position.set(partitionRightX, (height - 0.1) / 2 + 0.15, 2.05);
    rightFrontWall.castShadow = true;

    // Right Bedroom Door Frame
    const rightDoor = new THREE.Mesh(doorGeo, materials.woodDeckMaterial);
    rightDoor.position.set(partitionRightX, (height - 0.1) / 2 + 0.15, 0.95);
    rightDoor.rotation.y = -Math.PI / 4; // Open slightly into the living room

    interiorGroup.add(rightBackWall, rightFrontWall, rightDoor);

    // 2-Bedroom Wardrobes (Placed inside their respective bedrooms, pushed forward to clear beds)
    const wWidth = 0.8;
    const wDepth = 0.6;
    const wHeight = height - 0.1;
    
    // Left Bedroom Wardrobe
    const leftWardrobe = createWardrobe(wWidth, wHeight, wDepth);
    leftWardrobe.rotation.y = -Math.PI / 2; // Doors face -X (into the left room)
    leftWardrobe.position.set(partitionLeftX - wDepth / 2 - 0.05, wHeight / 2 + 0.15, 0.0);
    interiorGroup.add(leftWardrobe);

    // Right Bedroom Wardrobe
    const rightWardrobe = createWardrobe(wWidth, wHeight, wDepth);
    rightWardrobe.rotation.y = Math.PI / 2; // Doors face +X (into the right room)
    rightWardrobe.position.set(partitionRightX + wDepth / 2 + 0.05, wHeight / 2 + 0.15, 0.0);
    interiorGroup.add(rightWardrobe);

    // 2-Bedroom spacious central great room 3-seater luxury sofa & coffee table
    const twoBedLounge = createDetailedLivingLounge({
      sofaCenterX: 0.0,
      sofaCenterZ: 0.5,
      sofaWidth: 2.30,
      sofaDepth: 0.90,
      sofaFacingAngle: 0,
      materials,
    });
    interiorGroup.add(twoBedLounge);
  }

  if (state.modelId === 'two-bedroom' && state.hasLuxuryBedSuite) {
    // Second bedroom suite on left wing (Inside left bedroom, -4.7 to -2.2)
    const bed2Width = 1.5;
    const bed2Length = 1.95;

    const bed2Suite = createDetailedBedSuite({
      headboardX: 0,
      headboardFacing: 'east',
      bedCenterZ: 0,
      bedWidth: bed2Width,
      bedLength: bed2Length,
      nightstandZOffset: bed2Width / 2 + 0.28,
      materials,
    });
    
    bed2Suite.rotation.y = Math.PI / 2;
    // Position it securely on the left back wall, ensuring nightstand clears
    bed2Suite.position.set(-length / 2 + 1.25, 0, -depth / 2 + 0.18);
    
    interiorGroup.add(bed2Suite);
  }

  // 7d. Inverter Mini-Split HVAC Wall Unit
  if (state.hasHvacMiniSplit) {
    const hvacX = length * 0.25;

    // -- High-Detail Internal Wall Unit (Mini-Split) --
    const hvacGroup = new THREE.Group();
    
    // Main Body
    const hvacBodyGeo = new THREE.BoxGeometry(0.85, 0.28, 0.20);
    const hvacBodyMesh = new THREE.Mesh(hvacBodyGeo, materials.cabinetMaterial);
    hvacGroup.add(hvacBodyMesh);
    
    // Lower Air Deflector Louver
    const louverGeo = new THREE.BoxGeometry(0.75, 0.04, 0.05);
    const louverMesh = new THREE.Mesh(louverGeo, materials.metalTrimMaterial);
    louverMesh.position.set(0, -0.12, 0.08);
    louverMesh.rotation.x = Math.PI / 8;
    hvacGroup.add(louverMesh);
    
    // LED Temperature Display (Right Side)
    const ledGeo = new THREE.BoxGeometry(0.08, 0.04, 0.01);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0.3, -0.05, 0.105);
    hvacGroup.add(ledMesh);
    
    // Chrome Accent Trim Line
    const trimGeo = new THREE.BoxGeometry(0.85, 0.01, 0.01);
    const trimMesh = new THREE.Mesh(trimGeo, materials.metalTrimMaterial);
    trimMesh.position.set(0, 0.05, 0.105);
    hvacGroup.add(trimMesh);
    
    hvacGroup.position.set(hvacX, height - 0.25, -depth / 2 + 0.12 + wallThickness);
    interiorGroup.add(hvacGroup);

    // -- High-Detail Exterior Heat Pump Compressor Unit --
    const compGroup = new THREE.Group();
    const compW = 0.85;
    const compH = 0.65;
    const compD = 0.35;
    
    // Main casing
    const compBodyGeo = new THREE.BoxGeometry(compW, compH, compD);
    const compBodyMesh = new THREE.Mesh(compBodyGeo, materials.chassisMaterial);
    compBodyMesh.castShadow = true;
    compGroup.add(compBodyMesh);
    
    // Side Access / Service Panel
    const serviceGeo = new THREE.BoxGeometry(0.15, compH - 0.05, 0.02);
    const serviceMesh = new THREE.Mesh(serviceGeo, materials.metalTrimMaterial);
    serviceMesh.position.set(compW / 2 + 0.005, 0, 0);
    compGroup.add(serviceMesh);

    // Front Fan Grille Circular Cutout
    const grilleRadius = 0.24;
    const grilleGeo = new THREE.CylinderGeometry(grilleRadius, grilleRadius, 0.02, 24);
    const grilleMesh = new THREE.Mesh(grilleGeo, materials.chassisMaterial);
    grilleMesh.rotation.x = Math.PI / 2;
    grilleMesh.position.set(-0.08, 0, compD / 2 + 0.01);
    compGroup.add(grilleMesh);
    
    // Dark Interior / Fan Shadow behind grille
    const fanGeo = new THREE.CylinderGeometry(grilleRadius - 0.02, grilleRadius - 0.02, 0.02, 24);
    const fanMesh = new THREE.Mesh(fanGeo, ledMat); // reuse dark LED material
    fanMesh.rotation.x = Math.PI / 2;
    fanMesh.position.set(-0.08, 0, compD / 2 + 0.005);
    compGroup.add(fanMesh);

    // Horizontal grille protective slats
    for(let i = -5; i <= 5; i++) {
       const slatGeo = new THREE.BoxGeometry(grilleRadius * 1.8, 0.008, 0.008);
       const slatMesh = new THREE.Mesh(slatGeo, materials.metalTrimMaterial);
       slatMesh.position.set(-0.08, i * 0.04, compD / 2 + 0.02);
       compGroup.add(slatMesh);
    }
    
    // Brand / Manufacturer Badge
    const badgeGeo = new THREE.BoxGeometry(0.06, 0.02, 0.01);
    const badgeMesh = new THREE.Mesh(badgeGeo, materials.metalTrimMaterial);
    badgeMesh.position.set(compW / 2 - 0.12, compH / 2 - 0.08, compD / 2 + 0.005);
    compGroup.add(badgeMesh);

    // Anti-Vibration Mounting Feet
    const feetGeo = new THREE.BoxGeometry(0.08, 0.05, compD + 0.05);
    const foot1 = new THREE.Mesh(feetGeo, materials.chassisMaterial);
    foot1.position.set(-compW / 2 + 0.15, -compH / 2 - 0.025, 0);
    const foot2 = new THREE.Mesh(feetGeo, materials.chassisMaterial);
    foot2.position.set(compW / 2 - 0.15, -compH / 2 - 0.025, 0);
    compGroup.add(foot1, foot2);

    // Refrigerant Lines & Power Conduit (running up wall)
    const conduitGeo = new THREE.BoxGeometry(0.08, 1.4, 0.06);
    const conduitMesh = new THREE.Mesh(conduitGeo, materials.chassisMaterial);
    conduitMesh.position.set(compW / 2 - 0.05, compH / 2 + 0.7, -compD / 2 + 0.03);
    compGroup.add(conduitMesh);

    // Position outside on the rear wall
    compGroup.position.set(hvacX, 0.55 + compH / 2, -depth / 2 - 0.2);
    rootGroup.add(compGroup);
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

  // 8. MODULAR ADD-ON: FRONT ENTRY ARCHITECTURAL PERGOLA & PATIO DECK
  if (state.hasExteriorPergolaDeck) {
    const deckDepth = 3.2;
    const deckWidth = length + 1.2;
    const deckCenterZ = depth / 2 + deckDepth / 2;
    const deckBaseY = 0.12;
    
    // 1. Walkable Hardwood Composite Decking Platform
    // Plinth base
    const plinthGeo = new THREE.BoxGeometry(deckWidth, deckBaseY, deckDepth);
    const plinthMesh = new THREE.Mesh(plinthGeo, materials.chassisMaterial);
    plinthMesh.position.set(0, deckBaseY / 2, deckCenterZ);
    plinthMesh.receiveShadow = true;
    pergolaGroup.add(plinthMesh);
    
    // Individual realistic decking planks with shadow reveals
    const boardCount = Math.round(deckDepth / 0.16);
    const boardZSpan = (deckDepth - 0.08) / boardCount;
    for (let b = 0; b < boardCount; b++) {
      const bz = deckCenterZ - deckDepth / 2 + 0.04 + b * boardZSpan + boardZSpan / 2;
      const boardGeo = new THREE.BoxGeometry(deckWidth - 0.04, 0.024, boardZSpan - 0.008);
      const boardMesh = new THREE.Mesh(boardGeo, materials.woodDeckMaterial);
      boardMesh.position.set(0, deckBaseY + 0.012, bz);
      boardMesh.receiveShadow = true;
      pergolaGroup.add(boardMesh);
    }

    // Flush-mount perimeter LED deck puck lights
    const puckPositions = [
      [-deckWidth / 2 + 0.3, deckCenterZ + deckDepth / 2 - 0.3],
      [deckWidth / 2 - 0.3, deckCenterZ + deckDepth / 2 - 0.3],
      [-deckWidth / 2 + 0.3, deckCenterZ - deckDepth / 2 + 0.3],
      [deckWidth / 2 - 0.3, deckCenterZ - deckDepth / 2 + 0.3],
    ];
    puckPositions.forEach(([px, pz]) => {
      const puckGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.006, 12);
      const puckMesh = new THREE.Mesh(puckGeo, materials.terraceLightMaterial);
      puckMesh.position.set(px, deckBaseY + 0.024, pz);
      pergolaGroup.add(puckMesh);
    });

    // 2. Black Powder-Coated Aluminum Bioclimatic Pergola Framework
    const postGeo = new THREE.BoxGeometry(0.12, height + 0.2, 0.12);
    const postMat = materials.chassisMaterial;
    
    // Front corner columns
    const p1 = new THREE.Mesh(postGeo, postMat);
    p1.position.set(-deckWidth / 2 + 0.2, (height + 0.2) / 2, deckCenterZ + deckDepth / 2 - 0.2);
    p1.castShadow = true;
    
    const p2 = new THREE.Mesh(postGeo, postMat);
    p2.position.set(deckWidth / 2 - 0.2, (height + 0.2) / 2, deckCenterZ + deckDepth / 2 - 0.2);
    p2.castShadow = true;
    
    // Rear columns (anchored against house)
    const p3 = new THREE.Mesh(postGeo, postMat);
    p3.position.set(-deckWidth / 2 + 0.2, (height + 0.2) / 2, deckCenterZ - deckDepth / 2 + 0.1);
    
    const p4 = new THREE.Mesh(postGeo, postMat);
    p4.position.set(deckWidth / 2 - 0.2, (height + 0.2) / 2, deckCenterZ - deckDepth / 2 + 0.1);
    
    pergolaGroup.add(p1, p2, p3, p4);

    // Perimeter Roof Beams (Ring Beam)
    const ringY = height + 0.2 + 0.06;
    
    const frontBeam = new THREE.Mesh(new THREE.BoxGeometry(deckWidth - 0.2, 0.12, 0.12), postMat);
    frontBeam.position.set(0, ringY, deckCenterZ + deckDepth / 2 - 0.2);
    frontBeam.castShadow = true;
    
    const rearBeam = new THREE.Mesh(new THREE.BoxGeometry(deckWidth - 0.2, 0.12, 0.12), postMat);
    rearBeam.position.set(0, ringY, deckCenterZ - deckDepth / 2 + 0.1);
    
    const leftBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, deckDepth - 0.2), postMat);
    leftBeam.position.set(-deckWidth / 2 + 0.2, ringY, deckCenterZ - 0.05);
    leftBeam.castShadow = true;
    
    const rightBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, deckDepth - 0.2), postMat);
    rightBeam.position.set(deckWidth / 2 - 0.2, ringY, deckCenterZ - 0.05);
    rightBeam.castShadow = true;
    
    pergolaGroup.add(frontBeam, rearBeam, leftBeam, rightBeam);

    // 3. Automated Operable Louver Blades (Sun Tracking System)
    const louverCount = Math.round((deckWidth - 0.6) / 0.22);
    const louverW = (deckWidth - 0.6) / louverCount;
    const louverGeo = new THREE.BoxGeometry(louverW - 0.01, 0.02, deckDepth - 0.44);
    
    // Tilt louvers at an architectural 45-degree angle
    const tiltAngle = Math.PI / 4; 
    
    for (let l = 0; l < louverCount; l++) {
      const louverMesh = new THREE.Mesh(louverGeo, postMat);
      const lx = (-deckWidth / 2 + 0.3) + louverW / 2 + l * louverW;
      louverMesh.position.set(lx, ringY + 0.02, deckCenterZ - 0.05);
      louverMesh.rotation.z = tiltAngle;
      louverMesh.castShadow = true;
      pergolaGroup.add(louverMesh);
    }
    
    // Integrated LED linear strip along the perimeter ring beams
    const ledStripGeo = new THREE.BoxGeometry(deckWidth - 0.4, 0.02, 0.01);
    const ledStripMesh = new THREE.Mesh(ledStripGeo, materials.ledStripMaterial);
    ledStripMesh.position.set(0, ringY - 0.05, deckCenterZ - deckDepth / 2 + 0.18);
    ledStripMesh.rotation.x = Math.PI / 4;
    pergolaGroup.add(ledStripMesh);

    // 4. Frameless Glass Front Balustrade / Windbreak
    const glassRailHeight = 0.95;
    const glassGeo = new THREE.BoxGeometry(deckWidth - 0.6, glassRailHeight, 0.016);
    const glassMesh = new THREE.Mesh(glassGeo, materials.glassMaterial);
    glassMesh.position.set(0, deckBaseY + 0.024 + glassRailHeight / 2, deckCenterZ + deckDepth / 2 - 0.08);
    pergolaGroup.add(glassMesh);
    
    // Stainless steel spigot floor clamps for glass
    const spigotGeo = new THREE.BoxGeometry(0.05, 0.10, 0.05);
    for (let s = -2; s <= 2; s++) {
      const spigotMesh = new THREE.Mesh(spigotGeo, materials.metalTrimMaterial);
      spigotMesh.position.set(s * (deckWidth * 0.2), deckBaseY + 0.024 + 0.05, deckCenterZ + deckDepth / 2 - 0.08);
      pergolaGroup.add(spigotMesh);
    }

    // 5. Minimalist Concrete Firepit Lounge Assembly
    const loungeGroup = new THREE.Group();
    const loungeX = -deckWidth * 0.18;
    const loungeZ = deckCenterZ + 0.2;
    loungeGroup.position.set(loungeX, deckBaseY + 0.024, loungeZ);
    
    // Cast Concrete Rectangular Firepit Table (Enhanced)
    const tableHeight = 0.35;
    const tableW = 1.4;
    const tableD = 0.8;
    
    // Recessed base plinth (shadow line)
    const baseGeo = new THREE.BoxGeometry(tableW - 0.1, 0.05, tableD - 0.1);
    const baseMesh = new THREE.Mesh(baseGeo, materials.chassisMaterial);
    baseMesh.position.set(0, 0.025, 0);
    loungeGroup.add(baseMesh);

    // Main concrete table block
    const firepitGeo = new THREE.BoxGeometry(tableW, tableHeight - 0.05, tableD);
    const firepitMesh = new THREE.Mesh(firepitGeo, materials.terraceTableMaterial);
    firepitMesh.position.set(0, 0.05 + (tableHeight - 0.05) / 2, 0);
    firepitMesh.castShadow = true;
    loungeGroup.add(firepitMesh);
    
    // Firepit burner channel with crushed glass & flame glow
    const burnerGeo = new THREE.BoxGeometry(0.85, 0.02, 0.22);
    const burnerMesh = new THREE.Mesh(burnerGeo, materials.chassisMaterial);
    burnerMesh.position.set(0, tableHeight, 0);
    loungeGroup.add(burnerMesh);
    
    const flameGeo = new THREE.BoxGeometry(0.8, 0.04, 0.18);
    const flameMesh = new THREE.Mesh(flameGeo, materials.candleGlowMaterial);
    flameMesh.position.set(0, tableHeight + 0.01, 0);
    loungeGroup.add(flameMesh);

    // Decorative table accessories (drinks)
    const drinkGlassGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.1, 16);
    const glass1 = new THREE.Mesh(drinkGlassGeo, materials.glassMaterial);
    glass1.position.set(tableW / 2 - 0.15, tableHeight + 0.05, tableD / 2 - 0.15);
    const glass2 = new THREE.Mesh(drinkGlassGeo, materials.glassMaterial);
    glass2.position.set(tableW / 2 - 0.25, tableHeight + 0.05, tableD / 2 - 0.12);
    loungeGroup.add(glass1, glass2);
    
    // Low-slung Outdoor Sectional Sofa (L-Shape wrapping firepit)
    const sofaDepth = 0.85;
    const frameHeight = 0.12;
    const seatHeight = 0.16; // thickness of seat cushions
    const backHeight = 0.38;
    const armWidth = 0.15;
    
    // Sofa Chassis (Teak Wood Frame)
    const frameMat = materials.woodDeckMaterial;
    const fabricMat = materials.terraceFabricMaterial;

    // Main Long Section Frame
    const mainFrameW = 2.4;
    const mainFrameGeo = new THREE.BoxGeometry(mainFrameW, frameHeight, sofaDepth);
    const mainFrame = new THREE.Mesh(mainFrameGeo, frameMat);
    mainFrame.position.set(0.1, frameHeight / 2, -1.0);
    mainFrame.castShadow = true;
    loungeGroup.add(mainFrame);

    // Return L-Section Frame
    const retFrameD = 1.6;
    const retFrameGeo = new THREE.BoxGeometry(sofaDepth, frameHeight, retFrameD);
    const retFrame = new THREE.Mesh(retFrameGeo, frameMat);
    retFrame.position.set(0.1 + mainFrameW / 2 - sofaDepth / 2, frameHeight / 2, -1.0 + sofaDepth / 2 + retFrameD / 2);
    retFrame.castShadow = true;
    loungeGroup.add(retFrame);

    // Sofa Legs (Black metal)
    const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.05, 8);
    const legMat = materials.chassisMaterial;
    const legPositions = [
      [0.1 - mainFrameW / 2 + 0.05, -1.0 - sofaDepth / 2 + 0.05], // Front Left
      [0.1 + mainFrameW / 2 - 0.05, -1.0 - sofaDepth / 2 + 0.05], // Front Right
      [0.1 - mainFrameW / 2 + 0.05, -1.0 + sofaDepth / 2 - 0.05], // Back Left
      [0.1 + mainFrameW / 2 - 0.05, -1.0 + sofaDepth / 2 + retFrameD - 0.05], // Back Right (End of Return)
      [0.1 + mainFrameW / 2 - sofaDepth + 0.05, -1.0 + sofaDepth / 2 + retFrameD - 0.05], // Inner Corner Right
    ];
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, -0.025, lz);
      loungeGroup.add(leg);
    });

    // Individual Seat Cushions (Main Section)
    const seatW = (mainFrameW - armWidth - sofaDepth) / 2; // Subtract arm and corner return
    const seatGeo = new THREE.BoxGeometry(seatW - 0.02, seatHeight, sofaDepth - 0.04);
    
    for (let i = 0; i < 2; i++) {
      const seat = new THREE.Mesh(seatGeo, fabricMat);
      seat.position.set(0.1 - mainFrameW / 2 + armWidth + seatW / 2 + i * seatW, frameHeight + seatHeight / 2, -1.0);
      seat.castShadow = true;
      loungeGroup.add(seat);
    }

    // Corner Seat Cushion
    const cornerSeatGeo = new THREE.BoxGeometry(sofaDepth - 0.04, seatHeight, sofaDepth - 0.04);
    const cornerSeat = new THREE.Mesh(cornerSeatGeo, fabricMat);
    cornerSeat.position.set(0.1 + mainFrameW / 2 - sofaDepth / 2, frameHeight + seatHeight / 2, -1.0);
    cornerSeat.castShadow = true;
    loungeGroup.add(cornerSeat);

    // Return Seat Cushion
    const retSeatD = retFrameD - sofaDepth - armWidth;
    const retSeatGeo = new THREE.BoxGeometry(sofaDepth - 0.04, seatHeight, retSeatD - 0.02);
    const retSeat = new THREE.Mesh(retSeatGeo, fabricMat);
    retSeat.position.set(0.1 + mainFrameW / 2 - sofaDepth / 2, frameHeight + seatHeight / 2, -1.0 + sofaDepth / 2 + retSeatD / 2 + 0.01);
    retSeat.castShadow = true;
    loungeGroup.add(retSeat);

    // Backrest Cushions (Main Section)
    const backCushionGeo = new THREE.BoxGeometry(seatW - 0.02, backHeight, 0.18);
    for (let i = 0; i < 2; i++) {
      const back = new THREE.Mesh(backCushionGeo, fabricMat);
      back.position.set(0.1 - mainFrameW / 2 + armWidth + seatW / 2 + i * seatW, frameHeight + seatHeight + backHeight / 2 - 0.05, -1.0 - sofaDepth / 2 + 0.15);
      back.rotation.x = Math.PI * 0.05; // slight recline
      loungeGroup.add(back);
    }
    
    // Backrest Cushion (Corner)
    const cornerBackGeo = new THREE.BoxGeometry(sofaDepth - 0.2, backHeight, 0.18);
    const cornerBack1 = new THREE.Mesh(cornerBackGeo, fabricMat);
    cornerBack1.position.set(0.1 + mainFrameW / 2 - sofaDepth / 2 - 0.05, frameHeight + seatHeight + backHeight / 2 - 0.05, -1.0 - sofaDepth / 2 + 0.15);
    cornerBack1.rotation.x = Math.PI * 0.05;
    loungeGroup.add(cornerBack1);

    // Backrest Cushion (Return Section)
    const retBackGeo = new THREE.BoxGeometry(0.18, backHeight, retSeatD - 0.02);
    const retBack = new THREE.Mesh(retBackGeo, fabricMat);
    retBack.position.set(0.1 + mainFrameW / 2 - 0.15, frameHeight + seatHeight + backHeight / 2 - 0.05, -1.0 + sofaDepth / 2 + retSeatD / 2 + 0.01);
    retBack.rotation.z = -Math.PI * 0.05;
    loungeGroup.add(retBack);

    // Armrests
    const armGeo = new THREE.BoxGeometry(armWidth, seatHeight + 0.08, sofaDepth);
    const armLeft = new THREE.Mesh(armGeo, fabricMat);
    armLeft.position.set(0.1 - mainFrameW / 2 + armWidth / 2, frameHeight + (seatHeight + 0.08) / 2, -1.0);
    loungeGroup.add(armLeft);

    const armRightGeo = new THREE.BoxGeometry(sofaDepth, seatHeight + 0.08, armWidth);
    const armRight = new THREE.Mesh(armRightGeo, fabricMat);
    armRight.position.set(0.1 + mainFrameW / 2 - sofaDepth / 2, frameHeight + (seatHeight + 0.08) / 2, -1.0 + sofaDepth / 2 + retFrameD - armWidth / 2);
    loungeGroup.add(armRight);
    
    pergolaGroup.add(loungeGroup);
    
    // 6. Architectural Edge Planter Boxes with Tall Grasses
    const planterW = deckWidth * 0.28;
    const planterGeo = new THREE.BoxGeometry(planterW, 0.45, 0.45);
    const planterMesh = new THREE.Mesh(planterGeo, materials.chassisMaterial);
    planterMesh.position.set(deckWidth / 2 - planterW / 2 - 0.05, deckBaseY + 0.024 + 0.45 / 2, deckCenterZ + deckDepth / 2 - 0.3);
    planterMesh.castShadow = true;
    pergolaGroup.add(planterMesh);
    
    const plantGrassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#365314'),
      roughness: 0.85,
    });
    for (let g = 0; g < 6; g++) {
      const grassGeo = new THREE.ConeGeometry(0.08, 0.55, 5);
      const grassMesh = new THREE.Mesh(grassGeo, plantGrassMat);
      const gx = (deckWidth / 2 - planterW / 2 - 0.05) - planterW * 0.35 + g * (planterW * 0.14);
      grassMesh.position.set(gx, deckBaseY + 0.024 + 0.45 + 0.2, deckCenterZ + deckDepth / 2 - 0.3);
      grassMesh.rotation.z = (Math.random() - 0.5) * 0.2;
      grassMesh.rotation.x = (Math.random() - 0.5) * 0.2;
      pergolaGroup.add(grassMesh);
    }

    rootGroup.add(pergolaGroup);
  }

  // 9. MODULAR ADD-ON: BIO DIGESTER SYSTEM
  if (state.hasBioDigester) {
    const bioGroup = new THREE.Group();
    
    // Position directly behind the house
    const bioX = 1.0; // Slightly off-center
    const bioZ = -depth / 2 - 2.2;
    bioGroup.position.set(bioX, 0, bioZ);
    // Face the house
    bioGroup.rotation.y = 0;

    // Concrete equipment pad (Buried)
    const padGeo = new THREE.BoxGeometry(2.8, 0.1, 1.8);
    const padMesh = new THREE.Mesh(padGeo, materials.wallInternalMat);
    padMesh.position.set(0, -0.9, 0); // Buried 90cm deep
    padMesh.receiveShadow = true;
    bioGroup.add(padMesh);

    // Primary Digester Tank (Ribbed Polyethylene horizontal cylinder)
    const tankRadius = 0.65;
    const tankLength = 2.0;
    const tankGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankLength, 32);
    
    // Create a rugged green plastic material for the tank
    const tankMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2937'), // Dark slate/charcoal tank
      roughness: 0.7,
      metalness: 0.2,
    });
    
    const tankMesh = new THREE.Mesh(tankGeo, tankMat);
    tankMesh.rotation.z = Math.PI / 2; // Lay horizontally
    const tankY = -0.3; // Center is 30cm underground. Top is at +0.35m
    tankMesh.position.set(0, tankY, -0.2);
    tankMesh.castShadow = true;
    bioGroup.add(tankMesh);

    // Tank Structural Ribs
    const ribCount = 8;
    const ribSpacing = tankLength / (ribCount + 1);
    const ribGeo = new THREE.TorusGeometry(tankRadius + 0.03, 0.04, 8, 32);
    for(let i = 1; i <= ribCount; i++) {
      const rib = new THREE.Mesh(ribGeo, tankMat);
      rib.rotation.y = Math.PI / 2;
      rib.position.set(-tankLength/2 + i * ribSpacing, tankY, -0.2);
      bioGroup.add(rib);
    }

    // Dual Inspection/Access Hatches (Sticking just above ground)
    const hatchGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 24);
    const hatchMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 });
    
    const hatchY = tankY + tankRadius + 0.05; // 0.4
    const hatch1 = new THREE.Mesh(hatchGeo, hatchMat);
    hatch1.position.set(-0.6, hatchY, -0.2);
    
    const hatch2 = new THREE.Mesh(hatchGeo, hatchMat);
    hatch2.position.set(0.6, hatchY, -0.2);
    
    bioGroup.add(hatch1, hatch2);

    // Aerator Pump & Control Enclosure (Surface Level)
    const pumpBoxGeo = new THREE.BoxGeometry(0.5, 0.6, 0.4);
    const pumpBoxMat = new THREE.MeshStandardMaterial({ color: '#D1D5DB', roughness: 0.4, metalness: 0.6 });
    const pumpBox = new THREE.Mesh(pumpBoxGeo, pumpBoxMat);
    pumpBox.position.set(1.0, 0.3, 0.5); // Sits on the ground
    pumpBox.castShadow = true;
    bioGroup.add(pumpBox);

    // Pump cooling vents (dark slats)
    const ventGeo = new THREE.BoxGeometry(0.3, 0.02, 0.41);
    const ventMat = new THREE.MeshStandardMaterial({ color: '#000000' });
    for(let i=0; i<4; i++) {
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.set(1.0, 0.25 + i * 0.06, 0.5);
      bioGroup.add(vent);
    }

    // Bio-Filter / Active Carbon Stack (Vertical cylinder, surface level)
    const filterGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
    const filterMat = new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.8 });
    const filterMesh = new THREE.Mesh(filterGeo, filterMat);
    filterMesh.position.set(0.2, 0.45, 0.5); // Bottom at 0
    filterMesh.castShadow = true;
    bioGroup.add(filterMesh);

    // PVC Piping (Connecting house to tank, tank to filter)
    const pipeMat = new THREE.MeshStandardMaterial({ color: '#E5E7EB', roughness: 0.3 }); // White PVC
    
    // Inlet pipe from house (Buried)
    const inletPipeLength = 2.0;
    const inletPipeGeo = new THREE.CylinderGeometry(0.06, 0.06, inletPipeLength, 12);
    const inletPipe = new THREE.Mesh(inletPipeGeo, pipeMat);
    inletPipe.rotation.x = Math.PI / 2;
    inletPipe.position.set(0, tankY + 0.2, 0.8); // Points towards the house underground
    bioGroup.add(inletPipe);

    // Connecting pipe from pump to tank (aeration line)
    const aeratorLineGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
    const aeratorLine = new THREE.Mesh(aeratorLineGeo, pipeMat);
    aeratorLine.rotation.z = Math.PI / 2;
    aeratorLine.position.set(0.65, 0.1, 0.5);
    bioGroup.add(aeratorLine);

    // Vent stack extending upwards from buried tank
    const ventStackGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 12);
    const ventStack = new THREE.Mesh(ventStackGeo, pipeMat);
    ventStack.position.set(-0.8, tankY + 0.9, -0.2);
    bioGroup.add(ventStack);
    
    // Vent cap
    const ventCapGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
    const ventCap = new THREE.Mesh(ventCapGeo, pipeMat);
    ventCap.position.set(-0.8, tankY + 1.8, -0.2);
    bioGroup.add(ventCap);

    // Add green glow / LED indicator on pump box
    const statusLedGeo = new THREE.CircleGeometry(0.02, 16);
    const statusLedMat = new THREE.MeshBasicMaterial({ color: '#10B981' }); // Emerald Green
    const statusLed = new THREE.Mesh(statusLedGeo, statusLedMat);
    statusLed.position.set(1.0, 0.5, 0.701); // Front face of pump box
    bioGroup.add(statusLed);

    rootGroup.add(bioGroup);
  }

  // Calculate 3D Hotspot Coordinates for Interactive Clicking
  const hotspotPositions = {
    walls: new THREE.Vector3(-length / 2, height * 0.6, 0),
    glazing: new THREE.Vector3(-doorWidth / 2, height * 0.5, depth / 2 + 0.1),
    lighting: new THREE.Vector3(0, height + 0.1, 0),
    flooring: new THREE.Vector3(0, 0.2, 0.4),
    roof: new THREE.Vector3(0, height + roofThickness + 0.3, 0),
    kitchenette: new THREE.Vector3(-length / 2 + 1.5 + ( (state.modelId === 'studio' ? 1.8 : (state.modelId === 'one-bedroom' ? 1.9 : 3.0)) / 2 ), 1.2, -depth / 2 + 0.8),
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
