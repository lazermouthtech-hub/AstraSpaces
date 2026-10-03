import * as THREE from 'three';
import { CustomizationState, LightingMode, ModelSpecification, FloorPlanId } from '../../types';
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

  // Determine Architectural Series
  const modelSeries: 'expandable' | 'space-capsule' | 'folding' | 'apple-cabin' =
    currentModelSpec?.series ||
    (state.modelId.startsWith('expandable')
      ? 'expandable'
      : state.modelId.startsWith('space-capsule')
      ? 'space-capsule'
      : state.modelId.startsWith('folding') || state.modelId.startsWith('fast-assembly')
      ? 'folding'
      : 'apple-cabin');

  // Exact catalog-specified metric dimensions (Scale: 1 unit = 1 meter)
  let length = 5.8;
  let depth = 2.4;
  let height = 2.5;

  if (currentModelSpec?.dimensions?.lengthFt) {
    length = Number((currentModelSpec.dimensions.lengthFt * 0.3048).toFixed(2));
    depth = Number((currentModelSpec.dimensions.widthFt * 0.3048).toFixed(2));
    height = Number((currentModelSpec.dimensions.heightFt * 0.3048).toFixed(2));
  } else if (state.modelId === 'one-bedroom') {
    length = 10.0;
    depth = 3.5;
    height = 3.2;
  } else if (state.modelId === 'two-bedroom') {
    length = 11.8;
    depth = 2.2;
    height = 2.48;
  }

  // Model-specific hard catalog constraints
  const isAppleCabin = modelSeries === 'apple-cabin';
  const isAC01 = state.modelId === 'studio' || state.modelId === 'apple-cabin-ac01';
  const isAC02 = state.modelId === 'one-bedroom' || state.modelId === 'apple-cabin-ac02';
  const isAC03 = state.modelId === 'apple-cabin-ac03';
  const isAC04 = state.modelId === 'two-bedroom' || state.modelId === 'apple-cabin-ac04';
  const isAD01 = state.modelId === 'apple-cabin-ad01';
  const isAD03 = state.modelId === 'apple-cabin-ad03';
  const isDuplex = isAD01 || isAD03;

  // Strict metric constraints for Wanhai Apple Cabin Architectural Series
  if (isAppleCabin) {
    if (isAC01) {
      length = 5.8;
      depth = 2.2;
      height = 2.48;
    } else if (isAC02) {
      length = 10.0;
      depth = 3.5;
      height = 3.2;
    } else if (isAC03) {
      length = 8.5;
      depth = 2.2;
      height = 2.48; // Cabin height: 2,480mm; total height with rooftop terrace railing: 3,360mm
    } else if (isAC04) {
      length = 11.8;
      depth = 2.2;
      height = 2.48;
    } else if (isAD01) {
      length = 5.8;
      depth = 2.2;
      height = 4.98; // Total height 4,980mm (two-storey modular duplex)
    } else if (isAD03) {
      length = 5.8;
      depth = 2.2;
      height = 4.96; // Total height 4,960mm (two-storey modular duplex)
    }
  }

  const isExpandable = modelSeries === 'expandable';
  const is20ft = state.modelId.includes('20ft') || (!state.modelId.includes('30ft') && !state.modelId.includes('40ft') && isExpandable);
  const is30ft = state.modelId.includes('30ft');
  const is40ft = state.modelId.includes('40ft');
  const isFoldedMode = isExpandable && !!state.isFoldedTransportMode;

  // Rigid 2.2 m central transport core (Catalog constraint)
  const coreWidth = 2.2;
  // Deployed width across front elevation: 20FT: 5.9m; 30FT: 6.4m; 40FT: 6.4m
  const deployedWidth = is20ft ? 5.9 : 6.4;
  const expandableWidth = isFoldedMode ? coreWidth : deployedWidth;
  const wingWidth = (deployedWidth - coreWidth) / 2; // 1.85m for 20FT, 2.1m for 30FT/40FT
  // House depth along container spine: 20FT: 6.4m; 30FT: 9.0m; 40FT: 11.8m
  const houseDepth = is20ft ? 6.4 : (is30ft ? 9.0 : 11.8);

  const spineWidth = 2.2; // Rigid 2.2 m central transport core
  const effectiveDepth = isFoldedMode ? spineWidth : depth;
  const wingDepth = Math.max(0.8, (depth - spineWidth) / 2);

  const wallThickness = 0.12;
  const chassisBeamSize = 0.14;
  const isNight = lightingMode === 'night-ambient';
  const isGolden = lightingMode === 'golden-hour';

  // Helper: ISO 1161 Standard Corner Casting Block (Cast steel corner lock with oval holes)
  const createIsoCornerCasting = (x: number, y: number, z: number, size = 0.16) => {
    const castingGroup = new THREE.Group();
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      materials.isoCornerCastingMaterial || materials.q235SteelMaterial || materials.chassisMaterial
    );
    boxMesh.position.set(x, y, z);
    boxMesh.castShadow = true;
    castingGroup.add(boxMesh);

    // Oval apertures
    const apZ = new THREE.Mesh(
      new THREE.CylinderGeometry(size * 0.22, size * 0.22, 0.015, 12),
      materials.chassisMaterial
    );
    apZ.rotation.x = Math.PI / 2;
    apZ.position.set(x, y, z + (z > 0 ? size / 2 + 0.005 : -size / 2 - 0.005));
    castingGroup.add(apZ);

    return castingGroup;
  };

  // Helper: Mechanical Folding Leveling Jack Leg (for expanded wings)
  const createSupportJackLeg = (x: number, z: number, groundY = 0, floorY = 0.15) => {
    const legGroup = new THREE.Group();
    const legH = floorY - groundY;

    // Telescopic threaded screw post
    const postMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, legH, 12),
      materials.q235SteelMaterial || materials.chassisMaterial
    );
    postMesh.position.set(x, groundY + legH / 2, z);
    postMesh.castShadow = true;
    legGroup.add(postMesh);

    // Wide circular anti-sink foundation footpad
    const padMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.035, 16),
      materials.isoCornerCastingMaterial || materials.chassisMaterial
    );
    padMesh.position.set(x, groundY + 0.018, z);
    padMesh.receiveShadow = true;
    legGroup.add(padMesh);

    // Manual mechanical adjustment crank pin
    const crankPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8),
      materials.metalTrimMaterial || materials.chassisMaterial
    );
    crankPin.rotation.z = Math.PI / 2;
    crankPin.position.set(x, groundY + legH * 0.65, z);
    legGroup.add(crankPin);

    return legGroup;
  };

  // Helper: Heavy-Duty Hydraulic / Gas-Spring Deployment Assist Strut (for expandable wings)
  const createGasAssistStrut = (
    startX: number,
    startY: number,
    startZ: number,
    endX: number,
    endY: number,
    endZ: number
  ) => {
    const strutGroup = new THREE.Group();
    const startVec = new THREE.Vector3(startX, startY, startZ);
    const endVec = new THREE.Vector3(endX, endY, endZ);
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const totalLen = dir.length();
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

    // Orientation quaternion
    const up = new THREE.Vector3(0, 1, 0);
    const orientation = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

    // Cylinder Outer Barrel (dark industrial steel)
    const barrelLen = totalLen * 0.55;
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, barrelLen, 12),
      materials.chassisMaterial || materials.q235SteelMaterial
    );
    barrel.position.copy(startVec.clone().add(dir.clone().normalize().multiplyScalar(barrelLen * 0.5)));
    barrel.quaternion.copy(orientation);
    barrel.castShadow = true;
    strutGroup.add(barrel);

    // Piston Rod (polished chrome steel)
    const rodLen = totalLen * 0.50;
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, rodLen, 12),
      materials.metalTrimMaterial
    );
    rod.position.copy(endVec.clone().sub(dir.clone().normalize().multiplyScalar(rodLen * 0.5)));
    rod.quaternion.copy(orientation);
    rod.castShadow = true;
    strutGroup.add(rod);

    // Pivot mount brackets at both ends
    [startVec, endVec].forEach((pos) => {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.07, 0.07),
        materials.q235SteelMaterial || materials.chassisMaterial
      );
      bracket.position.copy(pos);
      strutGroup.add(bracket);
    });

    return strutGroup;
  };

  // =========================================================================
  // HELPER: ULTRA-DETAILED BROKEN-BRIDGE ARCHITECTURAL WINDOW UNIT
  // Features:
  // 1. True 4-sided hollow master frame in broken-bridge aluminum with projecting profile.
  // 2. Extruded projecting sub-sill with sloped drip overhang.
  // 3. Jet-black EPDM weatherstrip gasket seal border for crystal-clear visual frame-glass distinction.
  // 4. True hollow sash stiles & rails (NO solid boxes occluding glass!).
  // 5. High-clarity double-glazing insulated glass unit (IGU) centered in sash openings.
  // 6. Stainless steel hardware (cam latches, friction stay arms, flush slider pulls).
  // 7. Interior casing surround, interior stool apron, and sheer roller blind.
  // =========================================================================
  const createArchitecturalWindowUnit = (params: {
    type?: 'sliding' | 'casement' | 'tophanging' | 'overhanging';
    width?: number;
    height?: number;
    wallThickness?: number;
    isWhiteFrame?: boolean;
    hasBlinds?: boolean;
  }) => {
    const winGroup = new THREE.Group();
    const w = params.width ?? 0.92;
    const h = params.height ?? 0.92;
    const wallT = params.wallThickness ?? 0.075;
    const frameMat = params.isWhiteFrame
      ? materials.whiteDoorFrameMaterial
      : (materials.windowFrameMaterial || materials.darkDoorFrameMaterial || materials.q235SteelMaterial);
    const gasketMat = materials.windowGasketMaterial;
    const sillMat = materials.windowSillMaterial || materials.metalTrimMaterial;
    const glassMat = materials.glassMaterial;
    const hwMat = materials.windowHardwareMaterial || materials.metalTrimMaterial;

    const frameFace = 0.048; // 48mm broken-bridge profile face width
    const frameDepth = 0.084; // 84mm depth (projects ~22mm proud of exterior wall)
    const daylightW = w - 2 * frameFace; // ~0.824m
    const daylightH = h - 2 * frameFace; // ~0.824m

    // --- 1. Master Perimeter Frame (Hollow 4-Piece System) ---
    // Top lintel
    const topLintel = new THREE.Mesh(new THREE.BoxGeometry(w, frameFace, frameDepth), frameMat);
    topLintel.position.set(0, h / 2 - frameFace / 2, 0.006);
    topLintel.castShadow = true;

    // Bottom rail
    const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(w, frameFace, frameDepth), frameMat);
    bottomRail.position.set(0, -h / 2 + frameFace / 2, 0.006);
    bottomRail.castShadow = true;

    // Left jamb
    const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(frameFace, daylightH, frameDepth), frameMat);
    leftJamb.position.set(-w / 2 + frameFace / 2, 0, 0.006);
    leftJamb.castShadow = true;

    // Right jamb
    const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(frameFace, daylightH, frameDepth), frameMat);
    rightJamb.position.set(w / 2 - frameFace / 2, 0, 0.006);
    rightJamb.castShadow = true;

    winGroup.add(topLintel, bottomRail, leftJamb, rightJamb);

    // --- 2. Extruded Architectural Sub-Sill (Sloped Drip Nose) ---
    const subSill = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.10, 0.038, 0.13),
      sillMat
    );
    subSill.position.set(0, -h / 2 - 0.016, 0.032);
    subSill.castShadow = true;
    winGroup.add(subSill);

    // --- 3. Master Frame EPDM Black Gasket Seal Border ---
    const gT = new THREE.Mesh(new THREE.BoxGeometry(daylightW, 0.007, 0.024), gasketMat);
    gT.position.set(0, daylightH / 2 - 0.0035, 0.016);
    const gB = new THREE.Mesh(new THREE.BoxGeometry(daylightW, 0.007, 0.024), gasketMat);
    gB.position.set(0, -daylightH / 2 + 0.0035, 0.016);
    const gL = new THREE.Mesh(new THREE.BoxGeometry(0.007, daylightH - 0.014, 0.024), gasketMat);
    gL.position.set(-daylightW / 2 + 0.0035, 0, 0.016);
    const gR = new THREE.Mesh(new THREE.BoxGeometry(0.007, daylightH - 0.014, 0.024), gasketMat);
    gR.position.set(daylightW / 2 - 0.0035, 0, 0.016);
    winGroup.add(gT, gB, gL, gR);

    // --- 4. Sashes & Insulated Glazing Units ---
    const winType = params.type || 'sliding';

    if (winType === 'casement') {
      // CASEMENT WINDOW (Center vertical mullion, fixed right sash, openable left sash)
      const cMullion = new THREE.Mesh(new THREE.BoxGeometry(0.038, daylightH, 0.055), frameMat);
      cMullion.position.set(0, 0, 0.008);
      winGroup.add(cMullion);

      const bayW = (daylightW - 0.038) / 2; // ~0.393m
      const bayH = daylightH - 0.012; // ~0.812m
      const pFace = 0.034;
      const pDepth = 0.028;

      // Right Bay (Fixed / Closed Sash)
      const rCenterX = 0.019 + bayW / 2;
      const rTop = new THREE.Mesh(new THREE.BoxGeometry(bayW, pFace, pDepth), frameMat);
      rTop.position.set(rCenterX, bayH / 2 - pFace / 2, 0.008);
      const rBottom = new THREE.Mesh(new THREE.BoxGeometry(bayW, pFace, pDepth), frameMat);
      rBottom.position.set(rCenterX, -bayH / 2 + pFace / 2, 0.008);
      const rLeft = new THREE.Mesh(new THREE.BoxGeometry(pFace, bayH - 2 * pFace, pDepth), frameMat);
      rLeft.position.set(rCenterX - bayW / 2 + pFace / 2, 0, 0.008);
      const rRight = new THREE.Mesh(new THREE.BoxGeometry(pFace, bayH - 2 * pFace, pDepth), frameMat);
      rRight.position.set(rCenterX + bayW / 2 - pFace / 2, 0, 0.008);

      const rGlassW = bayW - 2 * pFace - 0.006;
      const rGlassH = bayH - 2 * pFace - 0.006;
      const rGlass = new THREE.Mesh(new THREE.BoxGeometry(rGlassW, rGlassH, 0.014), glassMat);
      rGlass.position.set(rCenterX, 0, 0.008);
      rGlass.castShadow = true;

      // Gaskets for right sash
      const rGTop = new THREE.Mesh(new THREE.BoxGeometry(rGlassW, 0.005, 0.016), gasketMat);
      rGTop.position.set(rCenterX, rGlassH / 2 + 0.0025, 0.008);
      const rGBot = new THREE.Mesh(new THREE.BoxGeometry(rGlassW, 0.005, 0.016), gasketMat);
      rGBot.position.set(rCenterX, -rGlassH / 2 - 0.0025, 0.008);
      const rGL = new THREE.Mesh(new THREE.BoxGeometry(0.005, rGlassH, 0.016), gasketMat);
      rGL.position.set(rCenterX - rGlassW / 2 - 0.0025, 0, 0.008);
      const rGR = new THREE.Mesh(new THREE.BoxGeometry(0.005, rGlassH, 0.016), gasketMat);
      rGR.position.set(rCenterX + rGlassW / 2 + 0.0025, 0, 0.008);

      winGroup.add(rTop, rBottom, rLeft, rRight, rGlass, rGTop, rGBot, rGL, rGR);

      // Left Bay (Operable Casement Sash opened outward at ~26 degrees)
      const openAngle = (Math.PI / 180) * 26;
      const pivotX = -daylightW / 2 + 0.005;
      const leftSashGroup = new THREE.Group();
      leftSashGroup.position.set(pivotX, 0, 0.018);
      leftSashGroup.rotation.y = -openAngle;

      const lSashTop = new THREE.Mesh(new THREE.BoxGeometry(bayW, pFace, pDepth), frameMat);
      lSashTop.position.set(bayW / 2, bayH / 2 - pFace / 2, 0);
      const lSashBot = new THREE.Mesh(new THREE.BoxGeometry(bayW, pFace, pDepth), frameMat);
      lSashBot.position.set(bayW / 2, -bayH / 2 + pFace / 2, 0);
      const lSashLeft = new THREE.Mesh(new THREE.BoxGeometry(pFace, bayH - 2 * pFace, pDepth), frameMat);
      lSashLeft.position.set(pFace / 2, 0, 0);
      const lSashRight = new THREE.Mesh(new THREE.BoxGeometry(pFace, bayH - 2 * pFace, pDepth), frameMat);
      lSashRight.position.set(bayW - pFace / 2, 0, 0);

      const lGlass = new THREE.Mesh(new THREE.BoxGeometry(rGlassW, rGlassH, 0.014), glassMat);
      lGlass.position.set(bayW / 2, 0, 0);
      lGlass.castShadow = true;

      const lGTop = new THREE.Mesh(new THREE.BoxGeometry(rGlassW, 0.005, 0.016), gasketMat);
      lGTop.position.set(bayW / 2, rGlassH / 2 + 0.0025, 0);
      const lGBot = new THREE.Mesh(new THREE.BoxGeometry(rGlassW, 0.005, 0.016), gasketMat);
      lGBot.position.set(bayW / 2, -rGlassH / 2 - 0.0025, 0);
      const lGL = new THREE.Mesh(new THREE.BoxGeometry(0.005, rGlassH, 0.016), gasketMat);
      lGL.position.set(pFace + 0.0025, 0, 0);
      const lGR = new THREE.Mesh(new THREE.BoxGeometry(0.005, rGlassH, 0.016), gasketMat);
      lGR.position.set(bayW - pFace - 0.0025, 0, 0);

      // Ergonomic cam latch handle
      const camHandle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.08, 0.03), hwMat);
      camHandle.position.set(bayW - 0.02, 0, 0.025);

      leftSashGroup.add(lSashTop, lSashBot, lSashLeft, lSashRight, lGlass, lGTop, lGBot, lGL, lGR, camHandle);
      winGroup.add(leftSashGroup);

      // Stainless steel friction stay arms (top and bottom)
      [bayH / 2 - 0.03, -bayH / 2 + 0.03].forEach((armY) => {
        const stayArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.008), hwMat);
        stayArm.rotation.y = -openAngle / 2;
        stayArm.position.set(pivotX + 0.08, armY, 0.035);
        winGroup.add(stayArm);
      });
    } else if (winType === 'tophanging') {
      // TOPHANGING (AWNING) WINDOW
      const openAngle = (Math.PI / 180) * 18;
      const aW = daylightW - 0.016;
      const aH = daylightH - 0.016;
      const pFace = 0.036;
      const pDepth = 0.028;
      const pivotY = daylightH / 2 - 0.008;

      const awningGroup = new THREE.Group();
      awningGroup.position.set(0, pivotY, 0.016);
      awningGroup.rotation.x = -openAngle;

      const aTop = new THREE.Mesh(new THREE.BoxGeometry(aW, pFace, pDepth), frameMat);
      aTop.position.set(0, -pFace / 2, 0);
      const aBot = new THREE.Mesh(new THREE.BoxGeometry(aW, pFace, pDepth), frameMat);
      aBot.position.set(0, -aH + pFace / 2, 0);
      const aLeft = new THREE.Mesh(new THREE.BoxGeometry(pFace, aH - 2 * pFace, pDepth), frameMat);
      aLeft.position.set(-aW / 2 + pFace / 2, -aH / 2, 0);
      const aRight = new THREE.Mesh(new THREE.BoxGeometry(pFace, aH - 2 * pFace, pDepth), frameMat);
      aRight.position.set(aW / 2 - pFace / 2, -aH / 2, 0);

      const aGlassW = aW - 2 * pFace - 0.006;
      const aGlassH = aH - 2 * pFace - 0.006;
      const aGlass = new THREE.Mesh(new THREE.BoxGeometry(aGlassW, aGlassH, 0.014), glassMat);
      aGlass.position.set(0, -aH / 2, 0);
      aGlass.castShadow = true;

      // Operator push bar
      const pushBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.022, 0.028), hwMat);
      pushBar.position.set(0, -aH + 0.035, 0.025);

      awningGroup.add(aTop, aBot, aLeft, aRight, aGlass, pushBar);
      winGroup.add(awningGroup);

      // Side scissor stay arms
      [-aW / 2 + 0.02, aW / 2 - 0.02].forEach((sX) => {
        const stay = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.16, 0.008), hwMat);
        stay.position.set(sX, -0.06, 0.035);
        stay.rotation.x = openAngle / 2;
        winGroup.add(stay);
      });
    } else if (winType === 'overhanging') {
      // OVERHANGING (HOPPER) WINDOW
      const openAngle = (Math.PI / 180) * 18;
      const hW = daylightW - 0.016;
      const hH = daylightH - 0.016;
      const pFace = 0.036;
      const pDepth = 0.028;
      const pivotY = -daylightH / 2 + 0.008;

      const hopperGroup = new THREE.Group();
      hopperGroup.position.set(0, pivotY, 0.016);
      hopperGroup.rotation.x = openAngle;

      const hpTop = new THREE.Mesh(new THREE.BoxGeometry(hW, pFace, pDepth), frameMat);
      hpTop.position.set(0, hH - pFace / 2, 0);
      const hpBot = new THREE.Mesh(new THREE.BoxGeometry(hW, pFace, pDepth), frameMat);
      hpBot.position.set(0, pFace / 2, 0);
      const hpLeft = new THREE.Mesh(new THREE.BoxGeometry(pFace, hH - 2 * pFace, pDepth), frameMat);
      hpLeft.position.set(-hW / 2 + pFace / 2, hH / 2, 0);
      const hpRight = new THREE.Mesh(new THREE.BoxGeometry(pFace, hH - 2 * pFace, pDepth), frameMat);
      hpRight.position.set(hW / 2 - pFace / 2, hH / 2, 0);

      const hpGlassW = hW - 2 * pFace - 0.006;
      const hpGlassH = hH - 2 * pFace - 0.006;
      const hpGlass = new THREE.Mesh(new THREE.BoxGeometry(hpGlassW, hpGlassH, 0.014), glassMat);
      hpGlass.position.set(0, hH / 2, 0);
      hpGlass.castShadow = true;

      const topLatch = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.022, 0.028), hwMat);
      topLatch.position.set(0, hH - 0.035, 0.025);

      hopperGroup.add(hpTop, hpBot, hpLeft, hpRight, hpGlass, topLatch);
      winGroup.add(hopperGroup);
    } else {
      // SLIDING WINDOW (High-Precision Dual Bypass Sashes)
      const sashW = daylightW / 2 + 0.02; // ~0.432m
      const sashH = daylightH - 0.014; // ~0.81m
      const pFace = 0.036;
      const pDepth = 0.024;
      const glassW = sashW - 2 * pFace - 0.006;
      const glassH = sashH - 2 * pFace - 0.006;

      // Left Sash (Inner Track at Z = -0.008)
      const leftCenterX = -daylightW / 4 + 0.005;
      const lTop = new THREE.Mesh(new THREE.BoxGeometry(sashW, pFace, pDepth), frameMat);
      lTop.position.set(leftCenterX, sashH / 2 - pFace / 2, -0.008);
      const lBot = new THREE.Mesh(new THREE.BoxGeometry(sashW, pFace, pDepth), frameMat);
      lBot.position.set(leftCenterX, -sashH / 2 + pFace / 2, -0.008);
      const lLeft = new THREE.Mesh(new THREE.BoxGeometry(pFace, sashH - 2 * pFace, pDepth), frameMat);
      lLeft.position.set(leftCenterX - sashW / 2 + pFace / 2, 0, -0.008);
      const lRight = new THREE.Mesh(new THREE.BoxGeometry(pFace, sashH - 2 * pFace, pDepth), frameMat);
      lRight.position.set(leftCenterX + sashW / 2 - pFace / 2, 0, -0.008);

      const lGlass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.014), glassMat);
      lGlass.position.set(leftCenterX, 0, -0.008);
      lGlass.castShadow = true;

      // Gaskets for left sash
      const lGTop = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.005, 0.016), gasketMat);
      lGTop.position.set(leftCenterX, glassH / 2 + 0.0025, -0.008);
      const lGBot = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.005, 0.016), gasketMat);
      lGBot.position.set(leftCenterX, -glassH / 2 - 0.0025, -0.008);
      const lGL = new THREE.Mesh(new THREE.BoxGeometry(0.005, glassH, 0.016), gasketMat);
      lGL.position.set(leftCenterX - glassW / 2 - 0.0025, 0, -0.008);
      const lGR = new THREE.Mesh(new THREE.BoxGeometry(0.005, glassH, 0.016), gasketMat);
      lGR.position.set(leftCenterX + glassW / 2 + 0.0025, 0, -0.008);

      // Flush finger latch on left sash
      const fLatch = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.008), hwMat);
      fLatch.position.set(leftCenterX + sashW / 2 - pFace - 0.015, 0, 0.006);

      winGroup.add(lTop, lBot, lLeft, lRight, lGlass, lGTop, lGBot, lGL, lGR, fLatch);

      // Right Sash (Outer Track at Z = +0.018)
      const rightCenterX = daylightW / 4 - 0.005;
      const rTop = new THREE.Mesh(new THREE.BoxGeometry(sashW, pFace, pDepth), frameMat);
      rTop.position.set(rightCenterX, sashH / 2 - pFace / 2, 0.018);
      const rBot = new THREE.Mesh(new THREE.BoxGeometry(sashW, pFace, pDepth), frameMat);
      rBot.position.set(rightCenterX, -sashH / 2 + pFace / 2, 0.018);
      const rLeft = new THREE.Mesh(new THREE.BoxGeometry(pFace, sashH - 2 * pFace, pDepth), frameMat);
      rLeft.position.set(rightCenterX - sashW / 2 + pFace / 2, 0, 0.018);
      const rRight = new THREE.Mesh(new THREE.BoxGeometry(pFace, sashH - 2 * pFace, pDepth), frameMat);
      rRight.position.set(rightCenterX + sashW / 2 - pFace / 2, 0, 0.018);

      const rGlass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.014), glassMat);
      rGlass.position.set(rightCenterX, 0, 0.018);
      rGlass.castShadow = true;

      const rGTop = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.005, 0.016), gasketMat);
      rGTop.position.set(rightCenterX, glassH / 2 + 0.0025, 0.018);
      const rGBot = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.005, 0.016), gasketMat);
      rGBot.position.set(rightCenterX, -glassH / 2 - 0.0025, 0.018);
      const rGL = new THREE.Mesh(new THREE.BoxGeometry(0.005, glassH, 0.016), gasketMat);
      rGL.position.set(rightCenterX - glassW / 2 - 0.0025, 0, 0.018);
      const rGR = new THREE.Mesh(new THREE.BoxGeometry(0.005, glassH, 0.016), gasketMat);
      rGR.position.set(rightCenterX + glassW / 2 + 0.0025, 0, 0.018);

      // Interlocking meeting stile
      const interlock = new THREE.Mesh(new THREE.BoxGeometry(0.024, sashH, 0.038), frameMat);
      interlock.position.set(0, 0, 0.005);

      winGroup.add(rTop, rBot, rLeft, rRight, rGlass, rGTop, rGBot, rGL, rGR, interlock);
    }

    // --- 5. Interior Architectural Casing & Apron Trim ---
    const inZ = -wallT / 2 - 0.006;
    const trimFace = 0.032;
    const inTop = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, trimFace, 0.014), frameMat);
    inTop.position.set(0, h / 2 - trimFace / 2, inZ);
    const inBot = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, trimFace, 0.014), frameMat);
    inBot.position.set(0, -h / 2 + trimFace / 2, inZ);
    const inLeft = new THREE.Mesh(new THREE.BoxGeometry(trimFace, h - 2 * trimFace, 0.014), frameMat);
    inLeft.position.set(-w / 2 + trimFace / 2, 0, inZ);
    const inRight = new THREE.Mesh(new THREE.BoxGeometry(trimFace, h - 2 * trimFace, 0.014), frameMat);
    inRight.position.set(w / 2 - trimFace / 2, 0, inZ);

    const inApron = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.02, 0.045), sillMat);
    inApron.position.set(0, -h / 2 - 0.01, inZ - 0.015);

    winGroup.add(inTop, inBot, inLeft, inRight, inApron);

    // --- 6. Interior Sheer Roller Blind ---
    if (params.hasBlinds !== false) {
      const rollerTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, w - 0.08, 12),
        materials.metalTrimMaterial
      );
      rollerTube.rotation.z = Math.PI / 2;
      rollerTube.position.set(0, h / 2 - 0.035, inZ - 0.01);

      const blindFabric = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.10, 0.16, 0.003),
        materials.bedLinenMaterial
      );
      blindFabric.position.set(0, h / 2 - 0.115, inZ - 0.01);

      winGroup.add(rollerTube, blindFabric);
    }

    return winGroup;
  };

  // =========================================================================
  // 1. BASE SUBFLOOR & DUAL-MATERIAL FLOOR SYSTEM
  // =========================================================================
  if (isExpandable) {
    // Heavy-duty Q235 galvanized steel subfloor chassis
    const subfloorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(expandableWidth, 0.15, houseDepth),
      materials.q235SteelMaterial || materials.chassisMaterial
    );
    subfloorMesh.position.y = 0.075;
    subfloorMesh.receiveShadow = true;
    rootGroup.add(subfloorMesh);

    // 2. Subfloor Substrates & Architectural Surface Flooring (20FT, 30FT, 40FT)
    // 18mm fireproof glass-magnesium (MGO) substrate board in central transport core
    const coreFloorSub = new THREE.Mesh(
      new THREE.PlaneGeometry(coreWidth - 0.02, houseDepth - 0.04),
      materials.mgoBoardMaterial
    );
    coreFloorSub.rotation.x = -Math.PI / 2;
    coreFloorSub.position.set(0, 0.1501, 0);
    coreFloorSub.receiveShadow = true;
    rootGroup.add(coreFloorSub);

    if (!isFoldedMode) {
      // 18mm bamboo plywood subfloor substrates in side wings
      [-1, 1].forEach((dir) => {
        const wingCenter = dir * (coreWidth / 2 + wingWidth / 2);
        const wingFloorSub = new THREE.Mesh(
          new THREE.PlaneGeometry(wingWidth - 0.02, houseDepth - 0.04),
          materials.bambooPlywoodMaterial
        );
        wingFloorSub.rotation.x = -Math.PI / 2;
        wingFloorSub.position.set(wingCenter, 0.1501, 0);
        wingFloorSub.receiveShadow = true;
        rootGroup.add(wingFloorSub);
      });

      // Selected Surface Flooring Finish (Spanning deployed 20FT, 30FT, or 40FT interior)
      const floorL = expandableWidth - 0.08;
      const floorD = houseDepth - 0.08;
      const finishFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(floorL, floorD),
        materials.floorMaterial
      );
      finishFloor.rotation.x = -Math.PI / 2;
      finishFloor.position.set(0, 0.152, 0);
      finishFloor.receiveShadow = true;
      rootGroup.add(finishFloor);

      // Clean galvanized steel threshold transition seam strips where wing floor meets central core
      [-1, 1].forEach((dir) => {
        const seamStrip = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.003, floorD),
          materials.metalTrimMaterial || materials.q235SteelMaterial
        );
        seamStrip.position.set(dir * (coreWidth / 2), 0.152 + 0.0015, 0);
        rootGroup.add(seamStrip);
      });
    } else {
      // Folded mode - single core floor finish
      const floorL = coreWidth - 0.08;
      const floorD = houseDepth - 0.08;
      const finishFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(floorL, floorD),
        materials.floorMaterial
      );
      finishFloor.rotation.x = -Math.PI / 2;
      finishFloor.position.set(0, 0.152, 0);
      finishFloor.receiveShadow = true;
      rootGroup.add(finishFloor);
    }
  } else if (isAppleCabin) {
    // Apple Cabin Flooring Material Zoning (Catalog Specification):
    // 1. Primary Q235 galvanized steel chassis skeleton
    const subfloorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.15, depth),
      materials.q235SteelMaterial
    );
    subfloorMesh.position.y = 0.075;
    subfloorMesh.receiveShadow = true;
    rootGroup.add(subfloorMesh);

    // 2. 18mm fireproof glass-magnesium (MGO) board subfloor
    const mgoSubfloor = new THREE.Mesh(
      new THREE.PlaneGeometry(length - 0.04, depth - 0.04),
      materials.mgoBoardMaterial
    );
    mgoSubfloor.rotation.x = -Math.PI / 2;
    mgoSubfloor.position.set(0, 0.152, 0);
    mgoSubfloor.receiveShadow = true;
    rootGroup.add(mgoSubfloor);

    // 3. High-grade waterproof composite wood flooring or 2.0mm PVC surface
    const floorInnerL = length - 0.08;
    const floorInnerD = depth - 0.08;
    const finishFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorInnerL, floorInnerD),
      materials.compositeWoodFloorMaterial || materials.floorMaterial
    );
    finishFloor.rotation.x = -Math.PI / 2;
    finishFloor.position.set(0, 0.170, 0);
    finishFloor.receiveShadow = true;
    rootGroup.add(finishFloor);
  } else {
    const subfloorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.15, effectiveDepth),
      materials.q235SteelMaterial || materials.chassisMaterial
    );
    subfloorMesh.position.y = 0.075;
    subfloorMesh.receiveShadow = true;
    rootGroup.add(subfloorMesh);

    const floorInnerL = length - wallThickness * 2;
    const floorInnerD = effectiveDepth - wallThickness * 2;
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(floorInnerL, floorInnerD),
      materials.floorMaterial
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0.151, 0);
    floorMesh.receiveShadow = true;
    rootGroup.add(floorMesh);
  }

  // =========================================================================
  // 2. STRUCTURAL ENVELOPE (STRICT CATALOG ARCHITECTURE)
  // =========================================================================
  const roofThickness = 0.22;
  const roofBaseY = height + 0.15 + roofThickness;

  if (modelSeries === 'expandable') {
    // ---------------------------------------------------------------------
    // A. EXPANDABLE CONTAINER HOUSE (20FT, 30FT, 40FT)
    // ---------------------------------------------------------------------
    // Structural Specifications from Wanhai Catalog:
    // Main columns: 150x210x3.0mm profile in Q235 galvanized steel
    const colW = 0.15;
    const colD = 0.21;
    const colGeo = new THREE.BoxGeometry(colW, height, colD);

    // Top beams: 80x140x3.5mm profile in Q235 galvanized steel
    const beamW = 0.08;
    const beamH = 0.14;
    const topBeamLongGeo = new THREE.BoxGeometry(beamW, beamH, houseDepth);
    const topBeamTransGeo = new THREE.BoxGeometry(coreWidth, beamH, beamW);

    // 1. Central Container Spine Structure (2.2m rigid transport core)
    // 4 Corner Columns of the 2.2m central transport core
    [-coreWidth / 2 + colW / 2, coreWidth / 2 - colW / 2].forEach((cx) => {
      [-houseDepth / 2 + colD / 2, houseDepth / 2 - colD / 2].forEach((cz) => {
        const isFront = cz > 0;
        const colZ = isFront ? cz + 0.003 : cz - 0.003;
        const col = new THREE.Mesh(colGeo, materials.q235SteelMaterial);
        col.position.set(cx, height / 2 + 0.15, colZ);
        col.castShadow = true;
        rootGroup.add(col);

        // ISO 1161 container corner castings positioned flush with column exterior
        rootGroup.add(createIsoCornerCasting(cx, 0.08, colZ));
        rootGroup.add(createIsoCornerCasting(cx, height + 0.15 - 0.08, colZ));
      });
    });

    // Intermediate columns along container depth for 30FT / 40FT models
    if (is30ft) {
      [-coreWidth / 2 + colW / 2, coreWidth / 2 - colW / 2].forEach((cx) => {
        const midCol = new THREE.Mesh(colGeo, materials.q235SteelMaterial);
        midCol.position.set(cx, height / 2 + 0.15, 0);
        midCol.castShadow = true;
        rootGroup.add(midCol);
      });
    } else if (is40ft) {
      [-coreWidth / 2 + colW / 2, coreWidth / 2 - colW / 2].forEach((cx) => {
        [-houseDepth / 6, houseDepth / 6].forEach((mz) => {
          const midCol = new THREE.Mesh(colGeo, materials.q235SteelMaterial);
          midCol.position.set(cx, height / 2 + 0.15, mz);
          midCol.castShadow = true;
          rootGroup.add(midCol);
        });
      });
    }

    // Top longitudinal Q235 galvanized beams (80x140x3.5mm) running full depth of central core
    [-coreWidth / 2 + beamW / 2, coreWidth / 2 - beamW / 2].forEach((bx) => {
      const longBeam = new THREE.Mesh(topBeamLongGeo, materials.q235SteelMaterial);
      longBeam.position.set(bx, height + 0.15 - beamH / 2, 0);
      rootGroup.add(longBeam);
    });

    // Transverse top beams at front and rear of 2.2m central core (3mm proud of wall panels)
    [-houseDepth / 2 + beamW / 2, houseDepth / 2 - beamW / 2].forEach((bz) => {
      const isFront = bz > 0;
      const beamZ = isFront ? bz + 0.003 : bz - 0.003;
      const transBeam = new THREE.Mesh(topBeamTransGeo, materials.q235SteelMaterial);
      transBeam.position.set(0, height + 0.15 - beamH / 2, beamZ);
      rootGroup.add(transBeam);
    });

    // Folding hinges connecting side wings to central core
    [-coreWidth / 2, coreWidth / 2].forEach((hx) => {
      const hingeCount = is40ft ? 7 : is30ft ? 5 : 4;
      const hingeSpacing = (houseDepth - 0.8) / (hingeCount - 1);
      for (let i = 0; i < hingeCount; i++) {
        const hz = -houseDepth / 2 + 0.4 + i * hingeSpacing;
        const hinge = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.12, 0.08),
          materials.q235SteelMaterial
        );
        hinge.position.set(hx, height * 0.5, hz);
        rootGroup.add(hinge);
      }
    });

    if (isFoldedMode) {
      // -------------------------------------------------------------------
      // TRANSPORT / FOLDED CONFIGURATION (Strictly 2.2m transport width)
      // -------------------------------------------------------------------
      // Side wings folded vertically against the 2.2m spine
      [-coreWidth / 2 - 0.04, coreWidth / 2 + 0.04].forEach((fx) => {
        const foldedWingPanel = new THREE.Mesh(
          new THREE.BoxGeometry(0.075, height - 0.1, houseDepth - 0.1),
          materials.wallMaterial
        );
        foldedWingPanel.position.set(fx, height / 2 + 0.15, 0);
        foldedWingPanel.castShadow = true;
        rootGroup.add(foldedWingPanel);

        // Transport safety locking bars
        for (let i = -2; i <= 2; i++) {
          const lockBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.09, 0.12, 0.05),
            materials.q235SteelMaterial
          );
          lockBar.position.set(fx + (fx > 0 ? 0.04 : -0.04), height * 0.5, (i * (houseDepth - 0.6)) / 5);
          rootGroup.add(lockBar);
        }
      });

      // Front & Rear End Core Enclosures (75mm bamboo-wood-fiber wall)
      [-houseDepth / 2 + 0.075 / 2, houseDepth / 2 - 0.075 / 2].forEach((ez) => {
        const coreEnd = new THREE.Mesh(
          new THREE.BoxGeometry(coreWidth, height, 0.075),
          materials.wallMaterial
        );
        coreEnd.position.set(0, height / 2 + 0.15, ez);
        coreEnd.castShadow = true;
        rootGroup.add(coreEnd);
      });

      // Central core roof
      const spineRoof = new THREE.Mesh(
        new THREE.BoxGeometry(coreWidth + 0.1, 0.16, houseDepth + 0.1),
        materials.roofMaterial
      );
      spineRoof.position.set(0, height + 0.15 + 0.08, 0);
      roofGroup.add(spineRoof);

    } else {
      // -------------------------------------------------------------------
      // FULLY DEPLOYED EXPANDED CONFIGURATION (5.9m / 6.4m Expanded Width)
      // -------------------------------------------------------------------
      // 1. Outer Deployed Wing Columns (150x210x3.0mm Q235 galvanized steel)
      // Positioned 3mm proud of the infill wall panels to frame the exterior without co-planar Z-fighting
      [-expandableWidth / 2 + colW / 2, expandableWidth / 2 - colW / 2].forEach((ox) => {
        const isRightSide = ox > 0;
        const colOutX = isRightSide ? ox + 0.003 : ox - 0.003;

        [-houseDepth / 2 + colD / 2, houseDepth / 2 - colD / 2].forEach((oz) => {
          const isFront = oz > 0;
          const colOutZ = isFront ? oz + 0.003 : oz - 0.003;
          const wingCol = new THREE.Mesh(colGeo, materials.q235SteelMaterial);
          wingCol.position.set(colOutX, height / 2 + 0.15, colOutZ);
          wingCol.castShadow = true;
          rootGroup.add(wingCol);
        });

        if (is30ft) {
          const midWingCol = new THREE.Mesh(colGeo, materials.q235SteelMaterial);
          midWingCol.position.set(colOutX, height / 2 + 0.15, 0);
          midWingCol.castShadow = true;
          rootGroup.add(midWingCol);
        } else if (is40ft) {
          [-houseDepth / 6, houseDepth / 6].forEach((mz) => {
            const midWingCol = new THREE.Mesh(colGeo, materials.q235SteelMaterial);
            midWingCol.position.set(colOutX, height / 2 + 0.15, mz);
            midWingCol.castShadow = true;
            rootGroup.add(midWingCol);
          });
        }
      });

      // 2. Mechanical Support Leveling Jack Legs (4 under outer corners + intermediate perimeter jacks)
      [-expandableWidth / 2 + 0.25, expandableWidth / 2 - 0.25].forEach((jx) => {
        [-houseDepth / 2 + 0.35, houseDepth / 2 - 0.35].forEach((jz) => {
          rootGroup.add(createSupportJackLeg(jx, jz, 0, 0.15));
        });
        if (houseDepth > 6.0) {
          rootGroup.add(createSupportJackLeg(jx, 0, 0, 0.15));
        }
      });

      // Heavy-Duty Gas-Spring / Hydraulic Deployment Assist Struts
      [-1, 1].forEach((dir) => {
        const coreX = dir * (coreWidth / 2 - 0.08);
        const wingX = dir * (expandableWidth / 2 - 0.25);
        [-houseDepth / 2 + 0.65, houseDepth / 2 - 0.65].forEach((sz) => {
          rootGroup.add(createGasAssistStrut(coreX, 0.22, sz, wingX, 0.12, sz));
        });
      });

      // 3. Exterior Walls (75mm bamboo-wood-fiber board) with Architectural Window Openings
      const wallT = 0.075; // 75mm bamboo-wood-fiber insulation board
      const winW = 0.92;
      const winH = 0.92;
      const doorH = 2.22;
      const doorTopY = 0.15 + doorH; // 2.37m
      const winCenterY = doorTopY - winH / 2; // 1.91m
      const winBottomY = doorTopY - winH; // 1.45m
      const winTopY = doorTopY; // 2.37m
      const wallBelowH = winBottomY - 0.15; // 1.30m
      const headerH = height + 0.15 - winTopY; // ~0.28m
      // Exactly 2 windows on the left side and 2 windows on the right side across all sizes (20ft, 30ft, 40ft)
      const numSideWindows = 2;
      const isWhiteWin =
        state.glazing === 'aluminum-alloy-double-door' ||
        state.glazing === 'broken-bridge-grille-door';

      // --- Outer Side Walls (Left & Right) with Architectural Aperture Cuts ---
      // Exactly two windows on each side (left and right) for balanced natural daylight and cross-ventilation in all rooms
      const sideDepth = houseDepth - wallT * 2;

      [-expandableWidth / 2 + wallT / 2, expandableWidth / 2 - wallT / 2].forEach((sx) => {
        const isRightSide = sx > 0;

        // Continuous lower wall below all side windows
        const sideWallBelow = new THREE.Mesh(
          new THREE.BoxGeometry(wallT, wallBelowH, sideDepth),
          materials.wallMaterial
        );
        sideWallBelow.position.set(sx, 0.15 + wallBelowH / 2, 0);
        sideWallBelow.castShadow = true;
        sideWallBelow.receiveShadow = true;
        rootGroup.add(sideWallBelow);

        // Continuous upper wall header above all side windows
        const sideWallAbove = new THREE.Mesh(
          new THREE.BoxGeometry(wallT, headerH, sideDepth),
          materials.wallMaterial
        );
        sideWallAbove.position.set(sx, winTopY + headerH / 2, 0);
        sideWallAbove.castShadow = true;
        sideWallAbove.receiveShadow = true;
        rootGroup.add(sideWallAbove);

        // Window band wall segments along Z between openings:
        // Precisely 2 side windows: one in the rear room half and one in the front room half
        const zSplits: number[] = [-sideDepth / 2];
        const windowCentersZ: number[] = [];
        const wzRear = -houseDepth * 0.25;
        const wzFront = houseDepth * 0.25;
        windowCentersZ.push(wzRear, wzFront);
        zSplits.push(wzRear - winW / 2, wzRear + winW / 2);
        zSplits.push(wzFront - winW / 2, wzFront + winW / 2);
        zSplits.push(sideDepth / 2);

        // Solid wall segments between window openings
        for (let i = 0; i < zSplits.length - 1; i += 2) {
          const zStart = zSplits[i];
          const zEnd = zSplits[i + 1];
          const segLen = zEnd - zStart;
          if (segLen > 0.001) {
            const segWall = new THREE.Mesh(
              new THREE.BoxGeometry(wallT, winH, segLen),
              materials.wallMaterial
            );
            segWall.position.set(sx, winCenterY, (zStart + zEnd) / 2);
            segWall.castShadow = true;
            segWall.receiveShadow = true;
            rootGroup.add(segWall);
          }
        }

        // Install High-Precision Architectural Window Units in each side aperture
        windowCentersZ.forEach((wz) => {
          const winUnit = createArchitecturalWindowUnit({
            type: 'sliding',
            width: winW,
            height: winH,
            wallThickness: wallT,
            isWhiteFrame: isWhiteWin,
            hasBlinds: true,
          });
          // Local Z faces outward from house:
          // For right wall (sx > 0), local +Z faces +X -> rotation.y = Math.PI / 2
          // For left wall (sx < 0), local +Z faces -X -> rotation.y = -Math.PI / 2
          winUnit.rotation.y = isRightSide ? Math.PI / 2 : -Math.PI / 2;
          winUnit.position.set(sx, winCenterY, wz);
          rootGroup.add(winUnit);
        });
      });

      // --- Rear Wall (at -houseDepth/2) with Architectural Aperture Cuts ---
      const rearZ = -houseDepth / 2 + wallT / 2;
      const rx1 = -expandableWidth / 3;
      const rx2 = expandableWidth / 3;

      // Lower wall below rear windows
      const rearWallBelow = new THREE.Mesh(
        new THREE.BoxGeometry(expandableWidth, wallBelowH, wallT),
        materials.wallMaterial
      );
      rearWallBelow.position.set(0, 0.15 + wallBelowH / 2, rearZ);
      rearWallBelow.castShadow = true;
      rearWallBelow.receiveShadow = true;
      rootGroup.add(rearWallBelow);

      // Upper wall above rear windows
      const rearWallAbove = new THREE.Mesh(
        new THREE.BoxGeometry(expandableWidth, headerH, wallT),
        materials.wallMaterial
      );
      rearWallAbove.position.set(0, winTopY + headerH / 2, rearZ);
      rearWallAbove.castShadow = true;
      rearWallAbove.receiveShadow = true;
      rootGroup.add(rearWallAbove);

      // Window band wall segments along X
      // Left corner wall segment
      const leftSegW = rx1 - winW / 2 - (-expandableWidth / 2);
      if (leftSegW > 0.001) {
        const leftWall = new THREE.Mesh(
          new THREE.BoxGeometry(leftSegW, winH, wallT),
          materials.wallMaterial
        );
        leftWall.position.set(-expandableWidth / 2 + leftSegW / 2, winCenterY, rearZ);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        rootGroup.add(leftWall);
      }

      // Center wall segment between the two rear windows
      const centerSegW = rx2 - winW / 2 - (rx1 + winW / 2);
      if (centerSegW > 0.001) {
        const centerWall = new THREE.Mesh(
          new THREE.BoxGeometry(centerSegW, winH, wallT),
          materials.wallMaterial
        );
        centerWall.position.set(0, winCenterY, rearZ);
        centerWall.castShadow = true;
        centerWall.receiveShadow = true;
        rootGroup.add(centerWall);
      }

      // Right corner wall segment
      const rightSegW = expandableWidth / 2 - (rx2 + winW / 2);
      if (rightSegW > 0.001) {
        const rightWall = new THREE.Mesh(
          new THREE.BoxGeometry(rightSegW, winH, wallT),
          materials.wallMaterial
        );
        rightWall.position.set(expandableWidth / 2 - rightSegW / 2, winCenterY, rearZ);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        rootGroup.add(rightWall);
      }

      // Install High-Precision Architectural Window Units in rear apertures
      [rx1, rx2].forEach((rx) => {
        const rearWinUnit = createArchitecturalWindowUnit({
          type: 'sliding',
          width: winW,
          height: winH,
          wallThickness: wallT,
          isWhiteFrame: isWhiteWin,
          hasBlinds: true,
        });
        // Local Z points outward to -Z -> rotation.y = Math.PI
        rearWinUnit.rotation.y = Math.PI;
        rearWinUnit.position.set(rx, winCenterY, rearZ);
        rootGroup.add(rearWinUnit);
      });

      // 4. FRONT FAÇADE (Main Entrance & Flanking Windows)
      // Front Z plane
      const frontZ = houseDepth / 2 - wallT / 2;

      // =======================================================================
      // MAIN ENTRANCE: 1880x2220mm High-Detail Architectural Entrance Door
      // Exactly centered on the front-facing elevation of the rigid 2.2m central transport core
      // Features true hollow aperture framing, projecting sill & drip canopy, and distinct hardware
      // =======================================================================
      const doorW = 1.88;
      const doorCenterY = 0.15 + doorH / 2; // 1.26m
      const frameThick = 0.06; // 60mm broken-bridge aluminum frame profile

      const isDoubleDoor =
        state.glazing === 'broken-bridge-double-door' ||
        state.glazing === 'aluminum-alloy-double-door' ||
        state.glazing === 'kfc-double-door';
      const isWhiteDoor =
        state.glazing === 'aluminum-alloy-double-door' ||
        state.glazing === 'broken-bridge-grille-door';
      const isKfcCommercial = state.glazing === 'kfc-double-door';
      const hasDoorGrilles =
        state.glazing === 'broken-bridge-grille-door' ||
        state.glazing === 'aluminum-alloy-double-door';

      const doorFrameMat = isWhiteDoor
        ? materials.whiteDoorFrameMaterial
        : (isKfcCommercial ? materials.darkDoorFrameMaterial : materials.q235SteelMaterial);

      // --- 1. Master Perimeter Frame (Hollow 4-Piece Jamb System) ---
      const clearApertureW = doorW - frameThick * 2; // ~1.76m
      const clearApertureH = doorH - frameThick - 0.035; // ~2.125m
      const leafW = clearApertureW / 2; // ~0.88m per door leaf
      const jambH = clearApertureH;
      const jambCenterY = 0.15 + 0.035 + jambH / 2;

      // Left outer jamb (rests flush on threshold, terminates cleanly at lintel)
      const leftDoorJamb = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, jambH, 0.09),
        doorFrameMat
      );
      leftDoorJamb.position.set(-doorW / 2 + frameThick / 2, jambCenterY, frontZ + 0.01);
      leftDoorJamb.castShadow = true;

      // Right outer jamb (rests flush on threshold, terminates cleanly at lintel)
      const rightDoorJamb = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, jambH, 0.09),
        doorFrameMat
      );
      rightDoorJamb.position.set(doorW / 2 - frameThick / 2, jambCenterY, frontZ + 0.01);
      rightDoorJamb.castShadow = true;

      // Top lintel / header (spans full door width above the vertical jambs)
      const topDoorLintel = new THREE.Mesh(
        new THREE.BoxGeometry(doorW, frameThick, 0.09),
        doorFrameMat
      );
      topDoorLintel.position.set(0, doorTopY - frameThick / 2, frontZ + 0.01);
      topDoorLintel.castShadow = true;

      // Extruded heavy-duty aluminum sill / threshold (sits on subfloor with beveled front edge)
      const doorThreshold = new THREE.Mesh(
        new THREE.BoxGeometry(doorW + 0.06, 0.035, 0.13),
        materials.metalTrimMaterial
      );
      doorThreshold.position.set(0, 0.15 + 0.0175, frontZ + 0.03);
      doorThreshold.castShadow = true;

      // Projecting top weather drip hood / canopy cap above the door
      const doorCanopyCap = new THREE.Mesh(
        new THREE.BoxGeometry(doorW + 0.14, 0.03, 0.12),
        doorFrameMat
      );
      doorCanopyCap.position.set(0, doorTopY + 0.015, frontZ + 0.05);
      doorCanopyCap.castShadow = true;

      frontWallGroup.add(leftDoorJamb, rightDoorJamb, topDoorLintel, doorThreshold, doorCanopyCap);

      // --- 2. Inner Door Panels & Operating Hardware ---

      if (isDoubleDoor) {
        // --- FRENCH & COMMERCIAL DOUBLE SWING DOORS ---
        // Center meeting astragal weatherstrip profile
        const centerAstragal = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, clearApertureH, 0.045),
          doorFrameMat
        );
        centerAstragal.position.set(0, doorCenterY - 0.0175, frontZ + 0.015);
        frontWallGroup.add(centerAstragal);

        // Build Left and Right operable door leaves
        [-1, 1].forEach((dir) => {
          const leafCenterX = dir * (leafW / 2);
          const leafGroup = new THREE.Group();

          // Door leaf sash frame (outer stiles & rails)
          const sashRailW = leafW - 0.01;
          const sashTopRail = new THREE.Mesh(
            new THREE.BoxGeometry(sashRailW, 0.065, 0.04),
            doorFrameMat
          );
          sashTopRail.position.set(leafCenterX, doorTopY - frameThick - 0.0325, frontZ + 0.01);

          const sashBottomRailH = isKfcCommercial ? 0.22 : 0.09; // KFC doors have tall commercial bottom rails
          const sashBottomRail = new THREE.Mesh(
            new THREE.BoxGeometry(sashRailW, sashBottomRailH, 0.04),
            doorFrameMat
          );
          sashBottomRail.position.set(leafCenterX, 0.15 + 0.035 + sashBottomRailH / 2, frontZ + 0.01);

          const sashStileH = clearApertureH - 0.065 - sashBottomRailH;
          const sashStileCenterY = 0.15 + 0.035 + sashBottomRailH + sashStileH / 2;
          const sashLeftStile = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, sashStileH, 0.04),
            doorFrameMat
          );
          sashLeftStile.position.set(leafCenterX - sashRailW / 2 + 0.0275, sashStileCenterY, frontZ + 0.01);

          const sashRightStile = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, sashStileH, 0.04),
            doorFrameMat
          );
          sashRightStile.position.set(leafCenterX + sashRailW / 2 - 0.0275, sashStileCenterY, frontZ + 0.01);

          // Clear Low-E tempered glass pane inside sash
          const glassW = sashRailW - 0.11;
          const glassH = sashStileH;
          const doorGlass = new THREE.Mesh(
            new THREE.BoxGeometry(glassW, glassH, 0.018),
            materials.glassMaterial
          );
          doorGlass.position.set(leafCenterX, sashStileCenterY, frontZ + 0.01);
          doorGlass.castShadow = true;

          leafGroup.add(sashTopRail, sashBottomRail, sashLeftStile, sashRightStile, doorGlass);

          // 3 Stainless Steel Butt Hinges on outer jamb
          const hingeX = dir * (doorW / 2 - frameThick / 2 - 0.005);
          [0.45, 1.25, 2.05].forEach((hY) => {
            const hingeKnuckle = new THREE.Mesh(
              new THREE.CylinderGeometry(0.01, 0.01, 0.09, 12),
              materials.metalTrimMaterial
            );
            hingeKnuckle.position.set(hingeX, hY, frontZ + 0.045);
            leafGroup.add(hingeKnuckle);
          });

          if (isKfcCommercial) {
            // Stainless steel protective kickplate on bottom rail
            const kickplate = new THREE.Mesh(
              new THREE.BoxGeometry(sashRailW, 0.22, 0.006),
              materials.metalTrimMaterial
            );
            kickplate.position.set(leafCenterX, 0.15 + 0.035 + 0.11, frontZ + 0.032);
            leafGroup.add(kickplate);

            // Full-length vertical stainless steel tubular push/pull bar (32mm dia x 1.25m tall)
            const handleX = dir * (leafW - 0.10);
            const pullBar = new THREE.Mesh(
              new THREE.CylinderGeometry(0.016, 0.016, 1.25, 16),
              materials.metalTrimMaterial
            );
            pullBar.position.set(handleX, 1.22, frontZ + 0.075);
            // Stanchion brackets connecting bar to door
            [-0.50, 0.50].forEach((sY) => {
              const stanchion = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, 0.05, 12),
                materials.metalTrimMaterial
              );
              stanchion.rotation.x = Math.PI / 2;
              stanchion.position.set(handleX, 1.22 + sY, frontZ + 0.045);
              leafGroup.add(stanchion);
            });
            leafGroup.add(pullBar);
          } else {
            // Architectural French lever handle with escutcheon backplate & keyhole
            const handleX = dir * 0.08;
            const escutcheon = new THREE.Mesh(
              new THREE.BoxGeometry(0.03, 0.18, 0.015),
              materials.metalTrimMaterial
            );
            escutcheon.position.set(handleX, 1.12, frontZ + 0.035);

            const leverHandle = new THREE.Mesh(
              new THREE.BoxGeometry(0.12, 0.02, 0.02),
              materials.metalTrimMaterial
            );
            leverHandle.position.set(handleX + dir * 0.05, 1.12, frontZ + 0.055);
            leafGroup.add(escutcheon, leverHandle);
          }

          // Architectural divided lite grilles / muntin bars
          if (hasDoorGrilles) {
            // Vertical center muntin bar
            const vMuntin = new THREE.Mesh(
              new THREE.BoxGeometry(0.018, glassH, 0.012),
              doorFrameMat
            );
            vMuntin.position.set(leafCenterX, sashStileCenterY, frontZ + 0.021);
            leafGroup.add(vMuntin);

            // 3 Horizontal crossbars dividing into 8 crisp architectural lites (offset 1mm in Z from vertical muntin)
            [-0.45, 0, 0.45].forEach((hOff) => {
              const hMuntin = new THREE.Mesh(
                new THREE.BoxGeometry(glassW, 0.018, 0.010),
                doorFrameMat
              );
              hMuntin.position.set(leafCenterX, sashStileCenterY + hOff, frontZ + 0.020);
              leafGroup.add(hMuntin);
            });
          }

          frontWallGroup.add(leafGroup);
        });

        if (isKfcCommercial) {
          // Overhead commercial hydraulic door closer boxes with articulated arms
          [-0.42, 0.42].forEach((closerX) => {
            const closerBox = new THREE.Mesh(
              new THREE.BoxGeometry(0.28, 0.065, 0.07),
              materials.darkDoorFrameMaterial || materials.metalTrimMaterial
            );
            closerBox.position.set(closerX, doorTopY - 0.04, frontZ + 0.045);

            const armBar = new THREE.Mesh(
              new THREE.BoxGeometry(0.18, 0.012, 0.012),
              materials.metalTrimMaterial
            );
            armBar.position.set(closerX + 0.06, doorTopY - 0.06, frontZ + 0.065);
            frontWallGroup.add(closerBox, armBar);
          });
        }
      } else {
        // --- BROKEN BRIDGE SLIDING PATIO ENTRANCE DOORS ---
        // Staggered dual sliding panels on twin tracks
        const panelW = clearApertureW / 2 + 0.03; // Slight overlap at center
        const panelH = clearApertureH - 0.02;

        // Left Panel (recessed track at z = frontZ - 0.015)
        const leftPanelGroup = new THREE.Group();
        const leftPanelCenterX = -panelW / 2 + 0.015;
        const leftSashTop = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.06, 0.035), doorFrameMat);
        leftSashTop.position.set(leftPanelCenterX, doorTopY - frameThick - 0.03, frontZ - 0.015);
        const leftSashBottom = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.08, 0.035), doorFrameMat);
        leftSashBottom.position.set(leftPanelCenterX, 0.15 + 0.035 + 0.04, frontZ - 0.015);
        const leftSashLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, panelH - 0.14, 0.035), doorFrameMat);
        leftSashLeft.position.set(leftPanelCenterX - panelW / 2 + 0.025, doorCenterY, frontZ - 0.015);
        const leftSashRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, panelH - 0.14, 0.035), doorFrameMat);
        leftSashRight.position.set(leftPanelCenterX + panelW / 2 - 0.025, doorCenterY, frontZ - 0.015);

        const leftGlass = new THREE.Mesh(
          new THREE.BoxGeometry(panelW - 0.112, panelH - 0.152, 0.016),
          materials.glassMaterial
        );
        leftGlass.position.set(leftPanelCenterX, doorCenterY, frontZ - 0.015);
        leftGlass.castShadow = true;

        // Perimeter black gasket seal for left door panel
        const lGTop = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.10, 0.006, 0.02), materials.windowGasketMaterial);
        lGTop.position.set(leftPanelCenterX, doorCenterY + (panelH - 0.14) / 2 - 0.003, frontZ - 0.015);
        const lGBot = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.10, 0.006, 0.02), materials.windowGasketMaterial);
        lGBot.position.set(leftPanelCenterX, doorCenterY - (panelH - 0.14) / 2 + 0.003, frontZ - 0.015);
        const lGL = new THREE.Mesh(new THREE.BoxGeometry(0.006, panelH - 0.14, 0.02), materials.windowGasketMaterial);
        lGL.position.set(leftPanelCenterX - (panelW - 0.10) / 2 + 0.003, doorCenterY, frontZ - 0.015);
        const lGR = new THREE.Mesh(new THREE.BoxGeometry(0.006, panelH - 0.14, 0.02), materials.windowGasketMaterial);
        lGR.position.set(leftPanelCenterX + (panelW - 0.10) / 2 - 0.003, doorCenterY, frontZ - 0.015);

        leftPanelGroup.add(leftSashTop, leftSashBottom, leftSashLeft, leftSashRight, leftGlass, lGTop, lGBot, lGL, lGR);

        // Right Panel (front track at z = frontZ + 0.018)
        const rightPanelGroup = new THREE.Group();
        const rightPanelCenterX = panelW / 2 - 0.015;
        const rightSashTop = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.06, 0.035), doorFrameMat);
        rightSashTop.position.set(rightPanelCenterX, doorTopY - frameThick - 0.03, frontZ + 0.018);
        const rightSashBottom = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.08, 0.035), doorFrameMat);
        rightSashBottom.position.set(rightPanelCenterX, 0.15 + 0.035 + 0.04, frontZ + 0.018);
        const rightSashLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, panelH - 0.14, 0.035), doorFrameMat);
        rightSashLeft.position.set(rightPanelCenterX - panelW / 2 + 0.025, doorCenterY, frontZ + 0.018);
        const rightSashRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, panelH - 0.14, 0.035), doorFrameMat);
        rightSashRight.position.set(rightPanelCenterX + panelW / 2 - 0.025, doorCenterY, frontZ + 0.018);

        const rightGlass = new THREE.Mesh(
          new THREE.BoxGeometry(panelW - 0.112, panelH - 0.152, 0.016),
          materials.glassMaterial
        );
        rightGlass.position.set(rightPanelCenterX, doorCenterY, frontZ + 0.018);
        rightGlass.castShadow = true;

        // Perimeter black gasket seal for right door panel
        const rGTop = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.10, 0.006, 0.02), materials.windowGasketMaterial);
        rGTop.position.set(rightPanelCenterX, doorCenterY + (panelH - 0.14) / 2 - 0.003, frontZ + 0.018);
        const rGBot = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.10, 0.006, 0.02), materials.windowGasketMaterial);
        rGBot.position.set(rightPanelCenterX, doorCenterY - (panelH - 0.14) / 2 + 0.003, frontZ + 0.018);
        const rGL = new THREE.Mesh(new THREE.BoxGeometry(0.006, panelH - 0.14, 0.02), materials.windowGasketMaterial);
        rGL.position.set(rightPanelCenterX - (panelW - 0.10) / 2 + 0.003, doorCenterY, frontZ + 0.018);
        const rGR = new THREE.Mesh(new THREE.BoxGeometry(0.006, panelH - 0.14, 0.02), materials.windowGasketMaterial);
        rGR.position.set(rightPanelCenterX + (panelW - 0.10) / 2 - 0.003, doorCenterY, frontZ + 0.018);

        rightPanelGroup.add(rightSashTop, rightSashBottom, rightSashLeft, rightSashRight, rightGlass, rGTop, rGBot, rGL, rGR);

        // Center meeting interlocking stile
        const centerInterlock = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, panelH, 0.034),
          doorFrameMat
        );
        centerInterlock.position.set(0, doorCenterY, frontZ + 0.002);

        // Stainless steel ergonomic vertical D-pull handle
        const dHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.014, 0.70, 16),
          materials.metalTrimMaterial
        );
        dHandle.position.set(0.06, 1.15, frontZ + 0.065);
        // Handle standoff mounts
        [-0.30, 0.30].forEach((mY) => {
          const mount = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, 0.04, 12),
            materials.metalTrimMaterial
          );
          mount.rotation.x = Math.PI / 2;
          mount.position.set(0.06, 1.15 + mY, frontZ + 0.045);
          frontWallGroup.add(mount);
        });

        frontWallGroup.add(leftPanelGroup, rightPanelGroup, centerInterlock, dHandle);

        // Security Grilles if selected
        if (hasDoorGrilles) {
          [-panelW / 2 + 0.015, panelW / 2 - 0.015].forEach((pX, idx) => {
            const zP = idx === 0 ? frontZ - 0.015 : frontZ + 0.018;
            [-0.20, 0, 0.20].forEach((gX) => {
              const vGrille = new THREE.Mesh(
                new THREE.BoxGeometry(0.015, panelH - 0.14, 0.015),
                doorFrameMat
              );
              vGrille.position.set(pX + gX, doorCenterY, zP + 0.015);
              frontWallGroup.add(vGrille);
            });
          });
        }
      }

      if (state.hasSmartDoorLock) {
        // High-tech illuminated biometric access lock keypad
        const keypad = new THREE.Mesh(
          new THREE.BoxGeometry(0.075, 0.24, 0.035),
          materials.ledStripMaterial
        );
        keypad.position.set(0.12, 1.25, frontZ + 0.06);
        frontWallGroup.add(keypad);
      }

      // Front Header Panel above entrance door (75mm thermal board)
      // Terminates cleanly at the underside of the top transverse structural steel beam to prevent Z-fighting
      const beamBottomY = height + 0.15 - beamH;
      const frontHeaderH = Math.max(0.04, beamBottomY - doorTopY);
      const frontHeader = new THREE.Mesh(
        new THREE.BoxGeometry(coreWidth, frontHeaderH, wallT),
        materials.wallMaterial
      );
      frontHeader.position.set(0, doorTopY + frontHeaderH / 2, frontZ);
      frontWallGroup.add(frontHeader);

      // =======================================================================
      // WING WINDOWS: 920x920mm High-Detail Architectural Windows
      // Horizontally centered within each deployed wing's front wall panel
      // Features hollow frames, projecting sloped sills, and realistic operable sashes
      // Supports Casement (with open sash & stay arm!), Sliding, Tophanging, and Overhanging
      // =======================================================================
      const isCasementWin = state.glazing === 'casement-window';
      const isTopHangingWin = state.glazing === 'tophanging-window';
      const isOverhangingWin = state.glazing === 'overhanging-window';

      // Wing front wall panels & centered windows
      [-1, 1].forEach((dir) => {
        const wingCenterX = dir * (coreWidth / 2 + wingWidth / 2);

        // Solid wall below window (from Y = 0.15 to Y = 1.45, height = 1.30m)
        const wallBelowH = winBottomY - 0.15;
        const wallBelow = new THREE.Mesh(
          new THREE.BoxGeometry(wingWidth, wallBelowH, wallT),
          materials.wallMaterial
        );
        wallBelow.position.set(wingCenterX, 0.15 + wallBelowH / 2, frontZ);
        wallBelow.castShadow = true;
        frontWallGroup.add(wallBelow);

        // Solid wall above window (from Y = 2.37 to Y = 2.65, height = 0.28m)
        const wallAbove = new THREE.Mesh(
          new THREE.BoxGeometry(wingWidth, headerH, wallT),
          materials.wallMaterial
        );
        wallAbove.position.set(wingCenterX, doorTopY + headerH / 2, frontZ);
        wallAbove.castShadow = true;
        frontWallGroup.add(wallAbove);

        // Side wall jambs to the left and right of the 920mm window
        const jambW = (wingWidth - winW) / 2;
        [-1, 1].forEach((jDir) => {
          const jamb = new THREE.Mesh(
            new THREE.BoxGeometry(jambW, winH, wallT),
            materials.wallMaterial
          );
          jamb.position.set(wingCenterX + jDir * (winW / 2 + jambW / 2), winCenterY, frontZ);
          jamb.castShadow = true;
          frontWallGroup.add(jamb);
        });

        // Install High-Precision Architectural Window Unit in front wing opening
        const frontWinUnit = createArchitecturalWindowUnit({
          type: isCasementWin ? 'casement' : isTopHangingWin ? 'tophanging' : isOverhangingWin ? 'overhanging' : 'sliding',
          width: winW,
          height: winH,
          wallThickness: wallT,
          isWhiteFrame: isWhiteWin,
          hasBlinds: true,
        });
        frontWinUnit.position.set(wingCenterX, winCenterY, frontZ);
        frontWallGroup.add(frontWinUnit);
      });

      // =======================================================================
      // ROOF ASSEMBLY:
      // Central core roof with protective overhang.
      // Expanded wing roof panels sit perfectly flush under central core overhang
      // without clipping through the 80x140mm top beams.
      // =======================================================================
      const coreRoofThickness = 0.16;
      const coreRoofOverhangX = 0.08; // 80mm overhang extending past X = ±1.1m
      const coreRoofOverhangZ = 0.10; // 100mm overhang extending past front/rear

      // Central core roof
      const spineRoof = new THREE.Mesh(
        new THREE.BoxGeometry(coreWidth + coreRoofOverhangX * 2, coreRoofThickness, houseDepth + coreRoofOverhangZ * 2),
        materials.roofMaterial
      );
      spineRoof.position.set(0, height + 0.15 + coreRoofThickness / 2, 0);
      spineRoof.castShadow = true;
      roofGroup.add(spineRoof);

      // Expanded wing roof panels
      const wingRoofThickness = 0.09;
      [-1, 1].forEach((dir) => {
        // Tucks directly under the core overhang at X = ±1.1m
        const wingRoofW = wingWidth + 0.05;
        const wingRoofD = houseDepth + coreRoofOverhangZ * 2;
        const wingRoof = new THREE.Mesh(
          new THREE.BoxGeometry(wingRoofW, wingRoofThickness, wingRoofD),
          materials.roofMaterial
        );
        // Positioned flush underneath core roof overhang and clearing the top of the side walls without clipping
        const wingRoofCenterX = dir * (coreWidth / 2 + wingWidth / 2 + 0.025);
        const wingRoofDrop = Math.sin(0.025) * (wingWidth / 2);
        const wingRoofCenterY = height + 0.15 + wingRoofThickness / 2 + wingRoofDrop + 0.005;
        wingRoof.position.set(
          wingRoofCenterX,
          wingRoofCenterY,
          0
        );
        // Rain watershed slope: sloped slightly outward (away from core)
        wingRoof.rotation.z = -dir * 0.025;
        wingRoof.castShadow = true;
        roofGroup.add(wingRoof);

        // Waterproof joint flashing along the seam between core overhang and wing roof
        const flashing = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.03, wingRoofD),
          materials.q235SteelMaterial
        );
        flashing.position.set(dir * (coreWidth / 2 + 0.02), height + 0.15 + 0.01, 0);
        roofGroup.add(flashing);
      });
    }

  } else if (modelSeries === 'space-capsule') {
    // ---------------------------------------------------------------------
    // B. SPACE CAPSULE HOUSE (D2, D5, D7, D8, D9)
    // ---------------------------------------------------------------------
    const isD9 = state.modelId === 'space-capsule-d9';

    // 1. Elevated Chassis Landing Struts
    const skidCount = length > 9.5 ? 6 : 4;
    const skidSpacing = (length - 1.8) / (skidCount / 2 - 1);
    for (let s = 0; s < skidCount / 2; s++) {
      const sx = -length / 2 + 0.9 + s * skidSpacing;
      [-depth / 2 + 0.35, depth / 2 - 0.35].forEach((sz) => {
        const strut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.08, 0.28, 16),
          materials.q235SteelMaterial || materials.chassisMaterial
        );
        strut.position.set(sx, 0.14, sz);
        strut.castShadow = true;
        rootGroup.add(strut);

        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.28, 0.04, 20),
          materials.isoCornerCastingMaterial || materials.chassisMaterial
        );
        pad.position.set(sx, 0.02, sz);
        pad.receiveShadow = true;
        rootGroup.add(pad);
      });
    }

    // 2. Aerodynamic Monocoque Fuselage Shell (Aluminum Alloy + Fluorocarbon)
    const shellGeo = new THREE.BoxGeometry(length, height, depth);
    const shellMesh = new THREE.Mesh(shellGeo, materials.wallMaterial);
    shellMesh.position.set(0, height / 2 + 0.15, 0);
    shellMesh.castShadow = true;
    shellMesh.receiveShadow = true;
    rootGroup.add(shellMesh);

    // 3. Dual Horizontal Cyan LED Accent Channels Along Fuselage
    [-depth / 2 - 0.015, depth / 2 + 0.015].forEach((glowZ) => {
      [height * 0.28, height * 0.92].forEach((glowY) => {
        const cyanStrip = new THREE.Mesh(
          new THREE.BoxGeometry(length * 0.92, 0.035, 0.02),
          materials.capsuleGlowMaterial || materials.ledStripMaterial
        );
        cyanStrip.position.set(-length * 0.03, glowY, glowZ);
        rootGroup.add(cyanStrip);
      });
    });

    // 4. Wraparound Curved Panoramic Glazing (6mm + 18A + 6mm Low-E Glass)
    const cockpitX = length / 2;
    const cockpitRadius = depth / 2 - 0.05;
    const cockpitGeo = new THREE.CylinderGeometry(
      cockpitRadius,
      cockpitRadius,
      height - 0.2,
      32,
      1,
      false,
      -Math.PI / 2,
      Math.PI
    );
    const cockpitGlass = new THREE.Mesh(cockpitGeo, materials.glassMaterial);
    cockpitGlass.position.set(cockpitX - 0.05, height / 2 + 0.15, 0);
    frontWallGroup.add(cockpitGlass);

    // Aerospace canopy structural mullions
    [-Math.PI / 4, 0, Math.PI / 4].forEach((angle) => {
      const mullion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, height - 0.15, 8),
        materials.q235SteelMaterial || materials.chassisMaterial
      );
      mullion.position.set(
        cockpitX - 0.05 + Math.cos(angle) * cockpitRadius,
        height / 2 + 0.15,
        Math.sin(angle) * cockpitRadius
      );
      frontWallGroup.add(mullion);
    });

    // 5. Intelligent Biometric Access Entrance Door (-X end)
    const doorX = -length / 2 + 1.25;
    const doorW = 0.96;
    const doorH = height - 0.3;
    const bioDoor = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.08),
      materials.q235SteelMaterial || materials.chassisMaterial
    );
    bioDoor.position.set(doorX, doorH / 2 + 0.15, depth / 2 + 0.025);
    frontWallGroup.add(bioDoor);

    const keypad = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.24, 0.04),
      materials.capsuleGlowMaterial || materials.ledStripMaterial
    );
    keypad.position.set(doorX + 0.38, 1.35, depth / 2 + 0.065);
    frontWallGroup.add(keypad);

    // Front Low-E window panel (proud of shell to eliminate coplanar flicker)
    const frontGlassW = length - 2.8;
    if (frontGlassW > 1.2) {
      const frontGlass = new THREE.Mesh(
        new THREE.BoxGeometry(frontGlassW, height - 0.45, 0.04),
        materials.glassMaterial
      );
      frontGlass.position.set(doorX + doorW / 2 + frontGlassW / 2 + 0.2, height / 2 + 0.15, depth / 2 + 0.015);
      frontWallGroup.add(frontGlass);
    }

    // 6. Motorized Panoramic Ceiling Starlight Skylight (1.8m x 0.9m)
    const skylightMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.9), materials.glassMaterial);
    skylightMesh.position.set(length * 0.12, height + 0.15 + roofThickness / 2, 0);
    roofGroup.add(skylightMesh);

    const skylightFrame = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.08, 1.02), materials.chassisMaterial);
    skylightFrame.position.set(length * 0.12, height + 0.15 + roofThickness / 2, 0);
    roofGroup.add(skylightFrame);

    // 7. D9 Special Recessed Outdoor Observation Sky Balcony
    if (isD9) {
      const balcW = 2.4;
      const balcD = depth * 0.85;
      const balcX = length / 2 - balcW / 2;
      const balcFloor = new THREE.Mesh(new THREE.BoxGeometry(balcW, 0.04, balcD), materials.woodDeckMaterial);
      balcFloor.position.set(balcX, 0.18, 0);
      rootGroup.add(balcFloor);

      const balcRail = new THREE.Mesh(new THREE.BoxGeometry(balcW, 0.95, 0.02), materials.glassMaterial);
      balcRail.position.set(balcX, 0.18 + 0.48, balcD / 2);
      rootGroup.add(balcRail);
    }

  } else if (modelSeries === 'folding') {
    // ---------------------------------------------------------------------
    // C. FOLDING & FAST-ASSEMBLY CONTAINER HOUSES
    // ---------------------------------------------------------------------
    const isFastAssembly = state.modelId === 'fast-assembly-20ft';
    const isXType = state.modelId === 'folding-x-type-20ft';

    // 1. ISO Standard Container Corner Castings on all 8 corners
    [-length / 2 + 0.08, length / 2 - 0.08].forEach((cx) => {
      [-depth / 2 + 0.08, depth / 2 - 0.08].forEach((cz) => {
        rootGroup.add(createIsoCornerCasting(cx, 0.08, cz));
        rootGroup.add(createIsoCornerCasting(cx, height + 0.15 - 0.08, cz));

        const col = new THREE.Mesh(
          new THREE.BoxGeometry(chassisBeamSize, height, chassisBeamSize),
          materials.q235SteelMaterial || materials.chassisMaterial
        );
        col.position.set(cx, height / 2 + 0.15, cz);
        col.castShadow = true;
        rootGroup.add(col);

        // Crane lifting eye lugs on fast-assembly model
        if (isFastAssembly) {
          const lug = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), materials.q235SteelMaterial);
          lug.position.set(cx, height + 0.15 + 0.08, cz);
          lug.rotation.x = Math.PI / 2;
          roofGroup.add(lug);
        }
      });
    });

    // 2. Rock Wool Sandwich Panels (50mm / 75mm Grade-A Fireproof)
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(length, height, wallThickness),
      materials.corrugatedPanelMaterial || materials.wallMaterial
    );
    backWall.position.set(0, height / 2 + 0.15, -depth / 2 + wallThickness / 2);
    backWall.castShadow = true;
    rootGroup.add(backWall);

    [-length / 2 + wallThickness / 2, length / 2 - wallThickness / 2].forEach((sx) => {
      const sideWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, height, depth - wallThickness),
        materials.corrugatedPanelMaterial || materials.wallMaterial
      );
      sideWall.position.set(sx, height / 2 + 0.15, 0);
      sideWall.castShadow = true;
      rootGroup.add(sideWall);

      // Scissor folding mechanism for X-Type model
      if (isXType) {
        const armLen = Math.hypot(depth * 0.7, height * 0.8);
        const angle = Math.atan2(height * 0.8, depth * 0.7);

        const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, armLen, 0.02), materials.q235SteelMaterial);
        arm1.position.set(sx + (sx > 0 ? 0.08 : -0.08), height / 2 + 0.15, 0);
        arm1.rotation.x = angle;
        rootGroup.add(arm1);

        const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, armLen, 0.02), materials.q235SteelMaterial);
        arm2.position.set(sx + (sx > 0 ? 0.08 : -0.08), height / 2 + 0.15, 0);
        arm2.rotation.x = -angle;
        rootGroup.add(arm2);

        // Center pivot pin
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12), materials.metalTrimMaterial);
        pin.position.set(sx + (sx > 0 ? 0.08 : -0.08), height / 2 + 0.15, 0);
        pin.rotation.z = Math.PI / 2;
        rootGroup.add(pin);
      }
    });

    // Z-Type Horizontal Folding Hinge Beams at Mid-Height
    if (!isFastAssembly && !isXType) {
      [-depth / 2, depth / 2].forEach((fz) => {
        const foldHinge = new THREE.Mesh(
          new THREE.BoxGeometry(length, 0.06, 0.08),
          materials.q235SteelMaterial || materials.chassisMaterial
        );
        foldHinge.position.set(0, height / 2 + 0.15, fz);
        rootGroup.add(foldHinge);
      });
    }

    // Steel sandwich door (900x2000mm) + sliding window with security bars
    const doorX = -length / 2 + 1.35;
    const doorW = 0.90;
    const doorH = 2.00;
    const steelDoor = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.06),
      materials.wallMaterial
    );
    steelDoor.position.set(doorX, doorH / 2 + 0.15, depth / 2 - wallThickness / 2);
    frontWallGroup.add(steelDoor);

    const doorLever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.14, 8),
      materials.metalTrimMaterial
    );
    doorLever.position.set(doorX + 0.36, 1.05, depth / 2 + 0.02);
    doorLever.rotation.z = Math.PI / 2;
    frontWallGroup.add(doorLever);

    // Sliding Window with protective security bars (930x1200mm)
    const winX = length / 4;
    const winW = 1.20;
    const winH = 0.93;
    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.04), materials.glassMaterial);
    winGlass.position.set(winX, 1.45, depth / 2 - wallThickness / 2);
    frontWallGroup.add(winGlass);

    for (let b = -4; b <= 4; b++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, winH, 8), materials.metalTrimMaterial);
      bar.position.set(winX + (b * winW) / 10, 1.45, depth / 2 - wallThickness / 2 + 0.02);
      frontWallGroup.add(bar);
    }

    // Front Wall Enclosures
    const fPanel1 = new THREE.Mesh(
      new THREE.BoxGeometry(doorX - (-length / 2) - doorW / 2, height, wallThickness),
      materials.corrugatedPanelMaterial || materials.wallMaterial
    );
    fPanel1.position.set(-length / 2 + (doorX - (-length / 2) - doorW / 2) / 2, height / 2 + 0.15, depth / 2 - wallThickness / 2);
    frontWallGroup.add(fPanel1);

    const fPanel2 = new THREE.Mesh(
      new THREE.BoxGeometry(length - (doorX + doorW / 2) - winW - 0.2, height, wallThickness),
      materials.corrugatedPanelMaterial || materials.wallMaterial
    );
    fPanel2.position.set(length / 2 - (length - (doorX + doorW / 2) - winW - 0.2) / 2, height / 2 + 0.15, depth / 2 - wallThickness / 2);
    frontWallGroup.add(fPanel2);

    const cRoof = new THREE.Mesh(new THREE.BoxGeometry(length + 0.1, roofThickness, depth + 0.1), materials.roofMaterial);
    cRoof.position.set(0, height + 0.15 + roofThickness / 2, 0);
    roofGroup.add(cRoof);

  } else {
    // ---------------------------------------------------------------------
    // D. APPLE CABIN ARCHITECTURAL SERIES (AC01, AC02, AC03, AC04, AD01, AD03)
    // ---------------------------------------------------------------------
    const cabinBaseH = isDuplex ? 2.48 : height;

    // 1. Signature Rounded Capsule Corners & Seamless Tubular Profile
    // Catalog constraint: Rounded radius geometry applied to all vertical columns
    // and horizontal roof/floor edge caps. Seamless capsule profile.
    const cornerRadius = 0.22; // 220mm rounded capsule corner radius
    const cornerHeight = cabinBaseH;

    // 4 vertical corner columns with smooth rounded capsule radius
    const cornerOffsets = [
      { x: -length / 2 + cornerRadius, z: -depth / 2 + cornerRadius, angle: Math.PI },
      { x: length / 2 - cornerRadius, z: -depth / 2 + cornerRadius, angle: -Math.PI / 2 },
      { x: -length / 2 + cornerRadius, z: depth / 2 - cornerRadius, angle: Math.PI / 2 },
      { x: length / 2 - cornerRadius, z: depth / 2 - cornerRadius, angle: 0 },
    ];

    cornerOffsets.forEach(({ x, z, angle }) => {
      // Rounded corner column: smooth quarter-cylinder profile
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(cornerRadius, cornerRadius, cornerHeight, 20, 1, false, angle, Math.PI / 2),
        materials.q235SteelMaterial
      );
      post.position.set(x, cornerHeight / 2 + 0.15, z);
      post.castShadow = true;
      post.receiveShadow = true;
      rootGroup.add(post);

      // Primary internal load-bearing skeleton: 100x100x2.5mm galvanized steel box column
      const internalSteelCol = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, cornerHeight, 0.10),
        materials.q235SteelMaterial
      );
      internalSteelCol.position.set(x, cornerHeight / 2 + 0.15, z);
      rootGroup.add(internalSteelCol);
    });

    // Horizontal rounded edge caps along top and bottom perimeter (seamless tubular profile)
    const capGeoX = new THREE.CylinderGeometry(cornerRadius, cornerRadius, length - cornerRadius * 2, 16, 1, false, 0, Math.PI);
    const topCapFront = new THREE.Mesh(capGeoX, materials.q235SteelMaterial);
    topCapFront.rotation.z = Math.PI / 2;
    topCapFront.rotation.x = -Math.PI / 2;
    topCapFront.position.set(0, cabinBaseH + 0.15 - cornerRadius, depth / 2 - cornerRadius);
    rootGroup.add(topCapFront);

    const botCapFront = new THREE.Mesh(capGeoX, materials.q235SteelMaterial);
    botCapFront.rotation.z = Math.PI / 2;
    botCapFront.rotation.x = Math.PI / 2;
    botCapFront.position.set(0, 0.15 + cornerRadius, depth / 2 - cornerRadius);
    rootGroup.add(botCapFront);

    const topCapRear = new THREE.Mesh(capGeoX, materials.q235SteelMaterial);
    topCapRear.rotation.z = Math.PI / 2;
    topCapRear.rotation.x = Math.PI / 2;
    topCapRear.position.set(0, cabinBaseH + 0.15 - cornerRadius, -depth / 2 + cornerRadius);
    rootGroup.add(topCapRear);

    const botCapRear = new THREE.Mesh(capGeoX, materials.q235SteelMaterial);
    botCapRear.rotation.z = Math.PI / 2;
    botCapRear.rotation.x = -Math.PI / 2;
    botCapRear.position.set(0, 0.15 + cornerRadius, -depth / 2 + cornerRadius);
    rootGroup.add(botCapRear);

    const capGeoZ = new THREE.CylinderGeometry(cornerRadius, cornerRadius, depth - cornerRadius * 2, 16, 1, false, 0, Math.PI);
    [-length / 2 + cornerRadius, length / 2 - cornerRadius].forEach((sx, idx) => {
      const rotY = idx === 0 ? Math.PI : 0;
      const topSideCap = new THREE.Mesh(capGeoZ, materials.q235SteelMaterial);
      topSideCap.rotation.x = Math.PI / 2;
      topSideCap.rotation.y = rotY;
      topSideCap.position.set(sx, cabinBaseH + 0.15 - cornerRadius, 0);
      rootGroup.add(topSideCap);

      const botSideCap = new THREE.Mesh(capGeoZ, materials.q235SteelMaterial);
      botSideCap.rotation.x = Math.PI / 2;
      botSideCap.rotation.y = rotY + Math.PI;
      botSideCap.position.set(sx, 0.15 + cornerRadius, 0);
      rootGroup.add(botSideCap);
    });

    // Spherical elbow nodes at all 8 capsule vertices for seamless tubular transition
    cornerOffsets.forEach(({ x, z }) => {
      [0.15 + cornerRadius, cabinBaseH + 0.15 - cornerRadius].forEach((yNode) => {
        const sphereCap = new THREE.Mesh(
          new THREE.SphereGeometry(cornerRadius, 14, 14),
          materials.q235SteelMaterial
        );
        sphereCap.position.set(x, yNode, z);
        rootGroup.add(sphereCap);
      });
    });

    // 2. Solid Wall Assembly: 50mm Bamboo Wood Fiber Graphene Insulation Boards
    const wallTGraphene = 0.05; // 50mm integrated board thickness
    const solidBackW = length - cornerRadius * 2;
    const solidBackH = cabinBaseH - cornerRadius * 2;

    const backWallGraphene = new THREE.Mesh(
      new THREE.BoxGeometry(solidBackW, solidBackH, wallTGraphene),
      materials.bambooGrapheneWallMaterial
    );
    backWallGraphene.position.set(0, cabinBaseH / 2 + 0.15, -depth / 2 + wallTGraphene / 2);
    backWallGraphene.castShadow = true;
    backWallGraphene.receiveShadow = true;
    rootGroup.add(backWallGraphene);

    // Solid side walls
    const solidSideW = depth - cornerRadius * 2;
    [-length / 2 + wallTGraphene / 2, length / 2 - wallTGraphene / 2].forEach((sx, sIdx) => {
      const hasPicWin = (isAC02 || isAC04) && sIdx === 1;

      if (!hasPicWin) {
        const sideWall = new THREE.Mesh(
          new THREE.BoxGeometry(wallTGraphene, solidBackH, solidSideW),
          materials.bambooGrapheneWallMaterial
        );
        sideWall.position.set(sx, cabinBaseH / 2 + 0.15, 0);
        sideWall.castShadow = true;
        rootGroup.add(sideWall);
      } else {
        const picWinW = 1.30;
        const picWinH = 1.20;
        const winY = 1.55;
        const wallBottomH = Math.max(0.1, winY - picWinH / 2 - (0.15 + cornerRadius));
        const wallTopH = Math.max(0.1, (cabinBaseH + 0.15 - cornerRadius) - (winY + picWinH / 2));
        const flankW = Math.max(0.1, (solidSideW - picWinW) / 2);

        // Lower wall below window
        const wallBelow = new THREE.Mesh(
          new THREE.BoxGeometry(wallTGraphene, wallBottomH, solidSideW),
          materials.bambooGrapheneWallMaterial
        );
        wallBelow.position.set(sx, 0.15 + cornerRadius + wallBottomH / 2, 0);
        wallBelow.castShadow = true;
        rootGroup.add(wallBelow);

        // Upper wall above window
        const wallAbove = new THREE.Mesh(
          new THREE.BoxGeometry(wallTGraphene, wallTopH, solidSideW),
          materials.bambooGrapheneWallMaterial
        );
        wallAbove.position.set(sx, cabinBaseH + 0.15 - cornerRadius - wallTopH / 2, 0);
        wallAbove.castShadow = true;
        rootGroup.add(wallAbove);

        // Flanking wall segments
        [-1, 1].forEach((fDir) => {
          const flankWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallTGraphene, picWinH, flankW),
            materials.bambooGrapheneWallMaterial
          );
          flankWall.position.set(sx, winY, fDir * (picWinW / 2 + flankW / 2));
          flankWall.castShadow = true;
          rootGroup.add(flankWall);
        });

        // Side picture window with broken-bridge aluminum frame
        const picWinGlass = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, picWinH, picWinW),
          materials.glassMaterial
        );
        picWinGlass.position.set(sx, winY, 0);
        rootGroup.add(picWinGlass);

        const picWinFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, picWinH + 0.08, picWinW + 0.08),
          materials.chassisMaterial
        );
        picWinFrame.position.set(sx, winY, 0);
        rootGroup.add(picWinFrame);
      }

      // Model-specific exterior wood-grain aluminum decorative slats for AC02
      if (isAC02) {
        const numSlats = 16;
        for (let sl = 0; sl < numSlats; sl++) {
          const slatY = 0.15 + cornerRadius + (sl * (solidBackH / numSlats));
          const slat = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.04, solidSideW - 0.1),
            materials.woodgrainSteelMaterial || materials.cabinetWoodNicheMaterial
          );
          slat.position.set(sx + (sIdx === 0 ? -0.015 : 0.015), slatY, 0);
          rootGroup.add(slat);
        }
      }
    });

    // 3. Continuous Floor-to-Ceiling Panoramic Double Glazing Front Facade
    // Continuous curtain wall enclosed in broken-bridge aluminum frames (6+12A+6 Low-E)
    // Completely unobstructed by opaque structural cross-bracing!
    const frontOpenW = length - cornerRadius * 2;
    const frontOpenH = cabinBaseH - cornerRadius * 2;
    const frontGlassCenterY = cabinBaseH / 2 + 0.15;
    const frontElevationZ = depth / 2 - 0.04;

    // Slender broken-bridge aluminum perimeter frame
    const curtainFrameTop = new THREE.Mesh(
      new THREE.BoxGeometry(frontOpenW, 0.05, 0.07),
      materials.chassisMaterial
    );
    curtainFrameTop.position.set(0, cabinBaseH + 0.15 - cornerRadius - 0.025, frontElevationZ);
    frontWallGroup.add(curtainFrameTop);

    const curtainFrameBot = new THREE.Mesh(
      new THREE.BoxGeometry(frontOpenW, 0.05, 0.07),
      materials.chassisMaterial
    );
    curtainFrameBot.position.set(0, 0.15 + cornerRadius + 0.025, frontElevationZ);
    frontWallGroup.add(curtainFrameBot);

    // Integrated Broken-Bridge Aluminum Double Glass Entrance Door
    const isSmallCabin = isAC01 || isDuplex;
    const glassDoorW = isSmallCabin ? 1.10 : 1.88;
    const glassDoorH = frontOpenH - 0.04;
    const doorXPos = isSmallCabin ? -frontOpenW / 2 + glassDoorW / 2 + 0.45 : 0;

    // Door perimeter frame (broken-bridge aluminum) - hollow 4-piece jamb system to keep glass opening clear
    const frameT = 0.055;
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(glassDoorW, frameT, 0.065), materials.chassisMaterial);
    dTop.position.set(doorXPos, frontGlassCenterY + glassDoorH / 2 - frameT / 2, frontElevationZ);
    const dBot = new THREE.Mesh(new THREE.BoxGeometry(glassDoorW, frameT, 0.065), materials.chassisMaterial);
    dBot.position.set(doorXPos, frontGlassCenterY - glassDoorH / 2 + frameT / 2, frontElevationZ);
    const dLeft = new THREE.Mesh(new THREE.BoxGeometry(frameT, glassDoorH - frameT * 2, 0.065), materials.chassisMaterial);
    dLeft.position.set(doorXPos - glassDoorW / 2 + frameT / 2, frontGlassCenterY, frontElevationZ);
    const dRight = new THREE.Mesh(new THREE.BoxGeometry(frameT, glassDoorH - frameT * 2, 0.065), materials.chassisMaterial);
    dRight.position.set(doorXPos + glassDoorW / 2 - frameT / 2, frontGlassCenterY, frontElevationZ);
    frontWallGroup.add(dTop, dBot, dLeft, dRight);

    // Double glass door panels
    if (glassDoorW > 1.5) {
      // Sliding patio door (two bypass panes)
      const halfDoorW = glassDoorW / 2 - 0.02;
      const doorPaneL = new THREE.Mesh(
        new THREE.BoxGeometry(halfDoorW, glassDoorH - 0.08, 0.024),
        materials.glassMaterial
      );
      doorPaneL.position.set(doorXPos - halfDoorW / 2 + 0.01, frontGlassCenterY, frontElevationZ - 0.012);

      const doorPaneR = new THREE.Mesh(
        new THREE.BoxGeometry(halfDoorW, glassDoorH - 0.08, 0.024),
        materials.glassMaterial
      );
      doorPaneR.position.set(doorXPos + halfDoorW / 2 - 0.01, frontGlassCenterY, frontElevationZ + 0.012);
      frontWallGroup.add(doorPaneL, doorPaneR);
    } else {
      // Single full-vision swing patio door
      const singlePane = new THREE.Mesh(
        new THREE.BoxGeometry(glassDoorW - 0.08, glassDoorH - 0.08, 0.024),
        materials.glassMaterial
      );
      singlePane.position.set(doorXPos, frontGlassCenterY, frontElevationZ);
      frontWallGroup.add(singlePane);
    }

    // Vertical stainless steel architectural pull handle
    const pullHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.75, 12),
      materials.metalTrimMaterial
    );
    pullHandle.position.set(doorXPos + (glassDoorW > 1.5 ? 0.06 : glassDoorW / 2 - 0.08), frontGlassCenterY - 0.1, frontElevationZ + 0.045);
    frontWallGroup.add(pullHandle);

    if (state.hasSmartDoorLock) {
      const lockKeypad = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.22, 0.035),
        materials.ledStripMaterial
      );
      lockKeypad.position.set(doorXPos + (glassDoorW > 1.5 ? 0.14 : glassDoorW / 2 + 0.04), frontGlassCenterY, frontElevationZ + 0.045);
      frontWallGroup.add(lockKeypad);
    }

    // Panoramic fixed double glass curtain wall panes (Left & Right Spans)
    // Left span
    const leftCurtainW = (doorXPos - glassDoorW / 2) - (-frontOpenW / 2);
    if (leftCurtainW > 0.15) {
      const leftGlass = new THREE.Mesh(
        new THREE.BoxGeometry(leftCurtainW, frontOpenH - 0.04, 0.028),
        materials.glassMaterial
      );
      leftGlass.position.set(-frontOpenW / 2 + leftCurtainW / 2, frontGlassCenterY, frontElevationZ);
      frontWallGroup.add(leftGlass);

      const numLeftMullions = Math.max(0, Math.floor(leftCurtainW / 1.7));
      for (let lm = 1; lm <= numLeftMullions; lm++) {
        const mul = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, frontOpenH, 0.07),
          materials.chassisMaterial
        );
        mul.position.set(-frontOpenW / 2 + (lm * leftCurtainW) / (numLeftMullions + 1), frontGlassCenterY, frontElevationZ);
        frontWallGroup.add(mul);
      }
    }

    // Right span
    const rightCurtainW = frontOpenW / 2 - (doorXPos + glassDoorW / 2);
    if (rightCurtainW > 0.15) {
      const rightGlass = new THREE.Mesh(
        new THREE.BoxGeometry(rightCurtainW, frontOpenH - 0.04, 0.028),
        materials.glassMaterial
      );
      rightGlass.position.set(doorXPos + glassDoorW / 2 + rightCurtainW / 2, frontGlassCenterY, frontElevationZ);
      frontWallGroup.add(rightGlass);

      const numRightMullions = Math.max(0, Math.floor(rightCurtainW / 1.7));
      for (let rm = 1; rm <= numRightMullions; rm++) {
        const mul = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, frontOpenH, 0.07),
          materials.chassisMaterial
        );
        mul.position.set(doorXPos + glassDoorW / 2 + (rm * rightCurtainW) / (numRightMullions + 1), frontGlassCenterY, frontElevationZ);
        frontWallGroup.add(mul);
      }
    }

    // Ground roof slab
    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(length, roofThickness, depth),
      materials.roofMaterial
    );
    roofSlab.position.set(0, cabinBaseH + 0.15 + roofThickness / 2, 0);
    roofSlab.castShadow = true;
    roofGroup.add(roofSlab);

    // 4. AC03 Model-Specific: Exactly 18.7 m² Rooftop Terrace Deck & Exterior Flight Stairs
    if (isAC03) {
      // Catalog constraint: Exactly 18.7 m² walkable observation deck (8,500mm x 2,200mm = 18.7 m²)
      const deckW = 8.5; // 8,500mm
      const deckD = 2.2; // 2,200mm
      const deckY = cabinBaseH + 0.15 + roofThickness; // Deck floor level (2.48m from ground)
      const deckFloorThick = 0.04;

      // Walkable composite wood decking
      const terraceDeck = new THREE.Mesh(
        new THREE.BoxGeometry(deckW, deckFloorThick, deckD),
        materials.woodDeckMaterial
      );
      terraceDeck.position.set(0, deckY + deckFloorThick / 2, 0);
      terraceDeck.receiveShadow = true;
      rootGroup.add(terraceDeck);

      // Secure Perimeter Glass Railing:
      // Total height with railing reads EXACTLY 3,360mm (3.36m from ground):
      // deckY + deckFloorThick + railH = 3.36m => railH = 3.36 - (2.48 + 0.04) = 0.84m (840mm)
      const railH = 3.36 - (deckY + deckFloorThick);
      const railCenterY = deckY + deckFloorThick + railH / 2;

      // Front & Rear safety glass railings
      [-deckD / 2 + 0.02, deckD / 2 - 0.02].forEach((rz) => {
        const railGlass = new THREE.Mesh(
          new THREE.BoxGeometry(deckW, railH - 0.04, 0.016),
          materials.glassMaterial
        );
        railGlass.position.set(0, railCenterY, rz);
        rootGroup.add(railGlass);

        // Top handrail (stainless steel / broken-bridge aluminum)
        const handrail = new THREE.Mesh(
          new THREE.BoxGeometry(deckW, 0.04, 0.04),
          materials.metalTrimMaterial
        );
        handrail.position.set(0, 3.36 - 0.02, rz);
        rootGroup.add(handrail);
      });

      // Right end safety glass railing
      const rightRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.016, railH - 0.04, deckD - 0.04),
        materials.glassMaterial
      );
      rightRail.position.set(deckW / 2 - 0.02, railCenterY, 0);
      rootGroup.add(rightRail);

      const rightHandrail = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, deckD),
        materials.metalTrimMaterial
      );
      rightHandrail.position.set(deckW / 2 - 0.02, 3.36 - 0.02, 0);
      rootGroup.add(rightHandrail);

      // Left end safety railing (with opening for stairs gate)
      const stairLandingGateW = 0.85;
      const leftRailW = (deckD - stairLandingGateW) / 2;
      [-deckD / 2 + leftRailW / 2, deckD / 2 - leftRailW / 2].forEach((lz) => {
        const leftRail = new THREE.Mesh(
          new THREE.BoxGeometry(0.016, railH - 0.04, leftRailW),
          materials.glassMaterial
        );
        leftRail.position.set(-deckW / 2 + 0.02, railCenterY, lz);
        rootGroup.add(leftRail);

        const lHandrail = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.04, leftRailW),
          materials.metalTrimMaterial
        );
        lHandrail.position.set(-deckW / 2 + 0.02, 3.36 - 0.02, lz);
        rootGroup.add(lHandrail);
      });

      // External Heavy-Duty Steel Flight Staircase (leading up to rooftop terrace):
      // Positioned on exterior solid side (-X end, dock to chassis beam and terrace deck)
      // Zero clipping through front panoramic glass!
      const stairX = -deckW / 2 - 0.58;
      const stairSteps = 14;
      const stairRise = (deckY + deckFloorThick) / stairSteps;
      const stairTreadD = 0.26;
      const stairTreadW = 0.82;
      const stairTotalD = stairSteps * stairTreadD;

      const acStairsGroup = new THREE.Group();
      for (let st = 0; st < stairSteps; st++) {
        const stepY = st * stairRise + stairRise / 2;
        const stepZ = -stairTotalD / 2 + st * stairTreadD + stairTreadD / 2;
        const tread = new THREE.Mesh(
          new THREE.BoxGeometry(stairTreadW, 0.035, stairTreadD - 0.02),
          materials.stairTreadMaterial
        );
        tread.position.set(stairX, stepY, stepZ);
        tread.castShadow = true;
        acStairsGroup.add(tread);
      }

      // Q235 galvanized steel channel stringers
      const stringerLen = Math.hypot(deckY + deckFloorThick, stairTotalD);
      const stringerAng = Math.atan2(deckY + deckFloorThick, stairTotalD);
      [-stairTreadW / 2, stairTreadW / 2].forEach((sxOffset) => {
        const str = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.16, stringerLen + 0.15),
          materials.q235SteelMaterial
        );
        str.position.set(stairX + sxOffset, (deckY + deckFloorThick) / 2, 0);
        str.rotation.x = -stringerAng;
        acStairsGroup.add(str);

        // Safety handrail along staircase
        const railBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, stringerLen, 8),
          materials.metalTrimMaterial
        );
        railBar.position.set(stairX + sxOffset, (deckY + deckFloorThick) / 2 + 0.85, 0);
        railBar.rotation.x = -stringerAng;
        acStairsGroup.add(railBar);
      });

      // Structural steel docking brackets connecting stairs cleanly to cabin frame
      const dockBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.08, 0.12),
        materials.q235SteelMaterial
      );
      dockBase.position.set(-deckW / 2 - 0.29, 0.15, -stairTotalD / 2 + 0.2);
      acStairsGroup.add(dockBase);

      const dockTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.08, 0.12),
        materials.q235SteelMaterial
      );
      dockTop.position.set(-deckW / 2 - 0.29, deckY + deckFloorThick - 0.04, stairTotalD / 2 - 0.2);
      acStairsGroup.add(dockTop);

      rootGroup.add(acStairsGroup);
    }

    // 5. AD Series Model-Specific: Two-Storey Modular Duplex Configurations (AD01 & AD03)
    if (isDuplex) {
      // Catalog constraint: Total height of 4.96m (AD03) or 4.98m (AD01)
      const totalDuplexH = isAD01 ? 4.98 : 4.96;
      const groundH = 2.48;
      const upperH = totalDuplexH - groundH; // 2.50m for AD01, 2.48m for AD03
      const upperBaseY = groundH; // Elevation where upper floor begins

      // Upper floor cantilever module
      // Upper floor is cantilevered, extending outward beyond base footprint
      const upperModuleL = 5.8;
      const upperModuleD = 2.2;
      const cantileverShiftX = 1.85; // 1.85m outward cantilever beyond base at +X
      const upperCenterX = cantileverShiftX / 2; // Center of upper module

      const duplexUpperGroup = new THREE.Group();

      // Inter-storey structural Q235 galvanized steel box beams (150x210x3.0mm)
      const interBeamL = upperModuleL + 0.1;
      [-upperModuleD / 2 + 0.1, upperModuleD / 2 - 0.1].forEach((bz) => {
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(interBeamL, 0.18, 0.15),
          materials.q235SteelMaterial
        );
        beam.position.set(upperCenterX, upperBaseY + 0.09, bz);
        beam.castShadow = true;
        duplexUpperGroup.add(beam);
      });

      // Upper floor 18mm MGO board subfloor & waterproof composite wood flooring
      const upperFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(upperModuleL - 0.04, upperModuleD - 0.04),
        materials.compositeWoodFloorMaterial || materials.floorMaterial
      );
      upperFloor.rotation.x = -Math.PI / 2;
      upperFloor.position.set(upperCenterX, upperBaseY + 0.182, 0);
      upperFloor.receiveShadow = true;
      duplexUpperGroup.add(upperFloor);

      // Upper floor master bedroom module & rounded capsule corners
      const upperSuiteL = 4.2; // Conditioned master suite length
      const upperSuiteCenterX = upperCenterX - (upperModuleL - upperSuiteL) / 2;
      const upperSuiteCornerR = 0.20;

      // Upper suite corner columns with rounded radius
      [
        { x: upperSuiteCenterX - upperSuiteL / 2 + upperSuiteCornerR, z: -upperModuleD / 2 + upperSuiteCornerR },
        { x: upperSuiteCenterX + upperSuiteL / 2 - upperSuiteCornerR, z: -upperModuleD / 2 + upperSuiteCornerR },
        { x: upperSuiteCenterX - upperSuiteL / 2 + upperSuiteCornerR, z: upperModuleD / 2 - upperSuiteCornerR },
        { x: upperSuiteCenterX + upperSuiteL / 2 - upperSuiteCornerR, z: upperModuleD / 2 - upperSuiteCornerR },
      ].forEach(({ x, z }) => {
        const uPost = new THREE.Mesh(
          new THREE.CylinderGeometry(upperSuiteCornerR, upperSuiteCornerR, upperH - 0.18, 16),
          materials.q235SteelMaterial
        );
        uPost.position.set(x, upperBaseY + 0.18 + (upperH - 0.18) / 2, z);
        duplexUpperGroup.add(uPost);
      });

      // Upper floor rear solid wall (50mm bamboo wood fiber graphene insulation)
      const uBackWall = new THREE.Mesh(
        new THREE.BoxGeometry(upperSuiteL - upperSuiteCornerR * 2, upperH - 0.22, 0.05),
        materials.bambooGrapheneWallMaterial
      );
      uBackWall.position.set(upperSuiteCenterX, upperBaseY + 0.18 + (upperH - 0.22) / 2, -upperModuleD / 2 + 0.025);
      duplexUpperGroup.add(uBackWall);

      // Upper floor front panoramic double glazing curtain wall in broken-bridge aluminum
      const uGlassW = upperSuiteL - upperSuiteCornerR * 2;
      const uGlassH = upperH - 0.26;
      const uFrontGlass = new THREE.Mesh(
        new THREE.BoxGeometry(uGlassW, uGlassH, 0.025),
        materials.glassMaterial
      );
      uFrontGlass.position.set(upperSuiteCenterX, upperBaseY + 0.18 + uGlassH / 2 + 0.02, upperModuleD / 2 - 0.035);
      duplexUpperGroup.add(uFrontGlass);

      const uFrame = new THREE.Mesh(
        new THREE.BoxGeometry(uGlassW + 0.04, uGlassH + 0.06, 0.06),
        materials.chassisMaterial
      );
      uFrame.position.set(upperSuiteCenterX, upperBaseY + 0.18 + uGlassH / 2 + 0.02, upperModuleD / 2 - 0.035);
      duplexUpperGroup.add(uFrame);

      // Upper floor cantilever observation balcony deck (extending past upper suite)
      const balcDeckW = upperModuleL - upperSuiteL;
      const balcCenterX = upperCenterX + upperModuleL / 2 - balcDeckW / 2;
      const balcDeck = new THREE.Mesh(
        new THREE.BoxGeometry(balcDeckW, 0.04, upperModuleD),
        materials.woodDeckMaterial
      );
      balcDeck.position.set(balcCenterX, upperBaseY + 0.18 + 0.02, 0);
      duplexUpperGroup.add(balcDeck);

      // Cantilever balcony perimeter safety glass railing (height 0.95m)
      const balcRailH = 0.95;
      const balcFrontRail = new THREE.Mesh(
        new THREE.BoxGeometry(balcDeckW, balcRailH, 0.016),
        materials.glassMaterial
      );
      balcFrontRail.position.set(balcCenterX, upperBaseY + 0.20 + balcRailH / 2, upperModuleD / 2 - 0.02);
      duplexUpperGroup.add(balcFrontRail);

      const balcEndRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.016, balcRailH, upperModuleD),
        materials.glassMaterial
      );
      balcEndRail.position.set(upperCenterX + upperModuleL / 2 - 0.02, upperBaseY + 0.20 + balcRailH / 2, 0);
      duplexUpperGroup.add(balcEndRail);

      // Upper floor roof slab with rounded capsule edge trims
      const upperRoof = new THREE.Mesh(
        new THREE.BoxGeometry(upperModuleL, 0.14, upperModuleD),
        materials.roofMaterial
      );
      upperRoof.position.set(upperCenterX, totalDuplexH - 0.07, 0);
      upperRoof.castShadow = true;
      duplexUpperGroup.add(upperRoof);

      // Catalog constraint: V-shaped or vertical structural Q235 galvanized steel pillars
      // supporting the cantilevered upper floor
      const pillarGroundY = 0.0;
      const pillarTopY = upperBaseY;
      const pillarSpanH = pillarTopY - pillarGroundY;
      const cantileverAnchorX = length / 2 + cantileverShiftX * 0.55;

      [-upperModuleD / 2 + 0.25, upperModuleD / 2 - 0.25].forEach((pz) => {
        // V-shaped galvanized steel pillar struts
        const vSpread = 0.55;
        const vLen = Math.hypot(vSpread, pillarSpanH);
        const vAng = Math.atan2(vSpread, pillarSpanH);

        const vStrutL = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, vLen, 12),
          materials.q235SteelMaterial
        );
        vStrutL.position.set(cantileverAnchorX - vSpread / 2, pillarSpanH / 2, pz);
        vStrutL.rotation.z = -vAng;
        duplexUpperGroup.add(vStrutL);

        const vStrutR = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, vLen, 12),
          materials.q235SteelMaterial
        );
        vStrutR.position.set(cantileverAnchorX + vSpread / 2, pillarSpanH / 2, pz);
        vStrutR.rotation.z = vAng;
        duplexUpperGroup.add(vStrutR);

        // Ground concrete/steel foundation footpads
        const padMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.40, 0.08, 0.40),
          materials.isoCornerCastingMaterial || materials.q235SteelMaterial
        );
        padMesh.position.set(cantileverAnchorX, 0.04, pz);
        duplexUpperGroup.add(padMesh);
      });

      // External Connecting Staircase for AD Duplex:
      // Connects ground level to upper cantilever floor (cleanly docked to structural frame)
      const adStairsGroup = new THREE.Group();
      const adStairX = -length / 2 - 0.60;
      const adSteps = 15;
      const adRise = upperBaseY / adSteps;
      const adTreadD = 0.26;
      const adTreadW = 0.82;
      const adTotalD = adSteps * adTreadD;

      for (let s = 0; s < adSteps; s++) {
        const stepY = s * adRise + adRise / 2;
        const stepZ = -adTotalD / 2 + s * adTreadD + adTreadD / 2;
        const tread = new THREE.Mesh(
          new THREE.BoxGeometry(adTreadW, 0.035, adTreadD - 0.02),
          materials.stairTreadMaterial
        );
        tread.position.set(adStairX, stepY, stepZ);
        tread.castShadow = true;
        adStairsGroup.add(tread);
      }

      const adStringerLen = Math.hypot(upperBaseY, adTotalD);
      const adStringerAng = Math.atan2(upperBaseY, adTotalD);
      [-adTreadW / 2, adTreadW / 2].forEach((sxOffset) => {
        const str = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.16, adStringerLen + 0.15),
          materials.q235SteelMaterial
        );
        str.position.set(adStairX + sxOffset, upperBaseY / 2, 0);
        str.rotation.x = -adStringerAng;
        adStairsGroup.add(str);

        const railBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, adStringerLen, 8),
          materials.metalTrimMaterial
        );
        railBar.position.set(adStairX + sxOffset, upperBaseY / 2 + 0.85, 0);
        railBar.rotation.x = -adStringerAng;
        adStairsGroup.add(railBar);
      });

      // Structural steel docking brackets connecting duplex stairs to cabin chassis
      const adDockBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.60, 0.08, 0.12),
        materials.q235SteelMaterial
      );
      adDockBase.position.set(-length / 2 - 0.30, 0.15, -adTotalD / 2 + 0.2);
      adStairsGroup.add(adDockBase);

      const adDockTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.60, 0.08, 0.12),
        materials.q235SteelMaterial
      );
      adDockTop.position.set(-length / 2 - 0.30, upperBaseY - 0.04, adTotalD / 2 - 0.2);
      adStairsGroup.add(adDockTop);

      duplexUpperGroup.add(adStairsGroup);
      rootGroup.add(duplexUpperGroup);
    }
  }

  rootGroup.add(frontWallGroup);

  // Soffit LED Strip
  if (state.lightingPackage === 'halo-strip-ambient' || state.lightingPackage === 'architectural-luxe-smart') {
    const soffit = new THREE.Mesh(new THREE.BoxGeometry(length + 0.1, 0.03, 0.04), materials.ledStripMaterial);
    soffit.position.set(0, height + 0.13, effectiveDepth / 2 + 0.06);
    roofGroup.add(soffit);
  }

  // =========================================================================
  // 3. ROOFTOP OPTIONS (AC03 OBSERVATION DECK & SOLAR ARRAYS)
  // =========================================================================
  const createDetailedSolarArray = (count: number, cx: number, cz: number) => {
    const group = new THREE.Group();
    const panelW = 1.08;
    const panelL = 1.72;
    const tilt = 0.18;
    const spacingX = panelW + 0.06;
    const totalW = (count - 1) * spacingX + panelW;

    const rail = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.2, 0.04, 0.04), materials.solarRailMaterial);
    rail.position.set(cx, roofBaseY + 0.05, cz + 0.4);
    group.add(rail);

    const railRear = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.2, 0.04, 0.04), materials.solarRailMaterial);
    railRear.position.set(cx, roofBaseY + 0.35, cz - 0.4);
    group.add(railRear);

    for (let i = 0; i < count; i++) {
      const px = cx - totalW / 2 + panelW / 2 + i * spacingX;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.03, panelL), materials.solarMaterial);
      panel.position.set(px, roofBaseY + 0.2, cz);
      panel.rotation.x = tilt;
      panel.castShadow = true;
      group.add(panel);
    }
    return group;
  };

  const createRooftopTerrace = (deckW: number, deckD: number, cx: number, cz: number) => {
    const group = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.BoxGeometry(deckW, 0.04, deckD), materials.woodDeckMaterial);
    floor.position.set(cx, roofBaseY + 0.02, cz);
    floor.receiveShadow = true;
    group.add(floor);

    const railH = 0.95;
    const rf = new THREE.Mesh(new THREE.BoxGeometry(deckW, railH, 0.018), materials.glassMaterial);
    rf.position.set(cx, roofBaseY + 0.04 + railH / 2, cz + deckD / 2);
    group.add(rf);

    const rr = new THREE.Mesh(new THREE.BoxGeometry(deckW, railH, 0.018), materials.glassMaterial);
    rr.position.set(cx, roofBaseY + 0.04 + railH / 2, cz - deckD / 2);
    group.add(rr);

    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.018, railH, deckD), materials.glassMaterial);
    rs.position.set(cx + deckW / 2, roofBaseY + 0.04 + railH / 2, cz);
    group.add(rs);

    return group;
  };

  const createSideFlightStairs = (stairX: number, stairZ: number, targetDeckY: number) => {
    const stairGroup = new THREE.Group();
    const steps = 14;
    const stepRise = targetDeckY / steps;
    const stepDepth = 0.28;
    const stepW = 0.85;

    for (let s = 0; s < steps; s++) {
      const stepY = s * stepRise + stepRise / 2;
      const stepZ = stairZ + (s - steps / 2) * stepDepth;
      const tread = new THREE.Mesh(new THREE.BoxGeometry(stepW, 0.04, stepDepth), materials.stairTreadMaterial);
      tread.position.set(stairX, stepY, stepZ);
      tread.castShadow = true;
      stairGroup.add(tread);
    }

    const stringer = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.15, steps * stepDepth + 0.2),
      materials.q235SteelMaterial || materials.chassisMaterial
    );
    stringer.position.set(stairX - stepW / 2, targetDeckY / 2, stairZ);
    stringer.rotation.x = Math.atan2(targetDeckY, steps * stepDepth);
    stairGroup.add(stringer);

    return stairGroup;
  };

  if (state.roofOption === 'solar-array-3kw' || state.roofOption === 'solar-deck-combo') {
    const solarCount = length > 9 ? 6 : length > 6 ? 4 : 2;
    const solarArray = createDetailedSolarArray(solarCount, state.roofOption === 'solar-deck-combo' ? -length * 0.22 : 0, 0);
    solarGroup.add(solarArray);
  }

  if (!isAC03 && !isDuplex && (state.roofOption === 'rooftop-terrace-deck' || state.roofOption === 'solar-deck-combo')) {
    // Rooftop observation deck for general models
    const deckW = state.roofOption === 'solar-deck-combo' ? length * 0.44 : length * 0.82;
    const deckD = effectiveDepth * 0.82;
    const deckCenterX = state.roofOption === 'solar-deck-combo' ? length * 0.22 : 0;
    const terrace = createRooftopTerrace(deckW, deckD, deckCenterX, 0);
    terraceGroup.add(terrace);

    const stairX = -length / 2 - 0.65;
    const stairs = createSideFlightStairs(stairX, 0, roofBaseY);
    rootGroup.add(stairs);
  }

  roofGroup.add(solarGroup);
  roofGroup.add(terraceGroup);
  rootGroup.add(roofGroup);

  // =========================================================================
  // 4. INTERIOR FITOUT & COLLISION-FREE ZONING (ZERO OVERLAP)
  // =========================================================================
  // =========================================================================
  // 4. INTERIOR FITOUT & COLLISION-FREE ZONING (ZERO OVERLAP)
  // =========================================================================
  if (!isFoldedMode) {
    if (modelSeries === 'expandable') {
      // =====================================================================
      // ARCHITECTURAL INTERIOR FITOUT: DOUBLE-WING EXPANDABLE HOUSE
      // Metric Coordinates & Catalog Specification (Wanhai 20FT/30FT/40FT)
      // Core Width: 2.2m (X: [-1.1m, +1.1m])
      // Total Width: 5.9m (20FT) or 6.4m (30FT/40FT)
      // Left Wing: [-expandableWidth/2, -1.1m] (Kitchenette & Bedroom 2)
      // Right Wing: [+1.1m, +expandableWidth/2] (Master Bedroom Suite)
      // Central Core: [ -1.1m, +1.1m ] (Living Lounge, Dining, & Central Bath Pod)
      // =====================================================================
      const intWallT = 0.075;
      const zRear = -houseDepth / 2 + wallThickness;
      const zFront = houseDepth / 2 - wallThickness;
      const leftWallX = -expandableWidth / 2 + wallThickness;
      const rightWallX = expandableWidth / 2 - wallThickness;
      const leftWingCenterX = -(coreWidth / 2 + wingWidth / 2);
      const rightWingCenterX = coreWidth / 2 + wingWidth / 2;

      // ---------------------------------------------------------------------
      // FLOOR PLAN SPECIFICATION: DYNAMIC LAYOUT GENERATION
      // Authentic Factory Options: 2-Bed Standard, 3-Bed Split, 3-Bed Lounge,
      // 1-Bed Grand Dining, 1-Bed Studio Suite, and 4-Bed Quad Suite
      // ---------------------------------------------------------------------
      const activeFloorPlan: FloorPlanId = (state.floorPlan as FloorPlanId) || '2-bed-1-bath';

      // Reusable Helper: Partition Wall with Optional Doorway
      const addWallSegment = (
        target: THREE.Group,
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number
      ) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials.bambooCharcoalWallMaterial);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        target.add(wall);
        return wall;
      };

      const addDoorOpening = (
        target: THREE.Group,
        doorX: number,
        doorZ: number,
        doorW = 0.82,
        doorH = 2.10,
        isAlongZ = true,
        addDoorLeaf = true
      ) => {
        const headerH = height - doorH;
        if (isAlongZ) {
          // Door along X axis (wall runs along Z)
          const header = new THREE.Mesh(new THREE.BoxGeometry(intWallT, headerH, doorW), materials.bambooCharcoalWallMaterial);
          header.position.set(doorX, 0.15 + doorH + headerH / 2, doorZ);
          const f1 = new THREE.Mesh(new THREE.BoxGeometry(intWallT + 0.02, doorH, 0.05), materials.metalTrimMaterial);
          f1.position.set(doorX, 0.15 + doorH / 2, doorZ - doorW / 2);
          const f2 = new THREE.Mesh(new THREE.BoxGeometry(intWallT + 0.02, doorH, 0.05), materials.metalTrimMaterial);
          f2.position.set(doorX, 0.15 + doorH / 2, doorZ + doorW / 2);
          target.add(header, f1, f2);

          // Wood door leaf swung ajar into the room
          if (addDoorLeaf) {
            const doorThick = 0.035;
            const doorLeaf = new THREE.Mesh(
              new THREE.BoxGeometry(doorThick, doorH - 0.03, doorW - 0.02),
              materials.woodDeckMaterial || materials.cabinetMaterial
            );
            const swingDir = doorX > 0 ? 1 : -1;
            doorLeaf.rotation.y = swingDir * 0.95;
            doorLeaf.position.set(
              doorX + swingDir * 0.28,
              0.15 + (doorH - 0.03) / 2,
              doorZ - doorW / 4
            );
            const handle = new THREE.Mesh(
              new THREE.BoxGeometry(0.10, 0.025, 0.06),
              materials.brassHandleMaterial || materials.metalTrimMaterial
            );
            handle.position.set(
              doorLeaf.position.x + swingDir * 0.03,
              0.15 + 1.0,
              doorLeaf.position.z + 0.22
            );
            target.add(doorLeaf, handle);
          }
        } else {
          // Door along Z axis (wall runs along X)
          const header = new THREE.Mesh(new THREE.BoxGeometry(doorW, headerH, intWallT), materials.bambooCharcoalWallMaterial);
          header.position.set(doorX, 0.15 + doorH + headerH / 2, doorZ);
          const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, doorH, intWallT + 0.02), materials.metalTrimMaterial);
          f1.position.set(doorX - doorW / 2, 0.15 + doorH / 2, doorZ);
          const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, doorH, intWallT + 0.02), materials.metalTrimMaterial);
          f2.position.set(doorX + doorW / 2, 0.15 + doorH / 2, doorZ);
          target.add(header, f1, f2);

          if (addDoorLeaf) {
            const doorThick = 0.035;
            const doorLeaf = new THREE.Mesh(
              new THREE.BoxGeometry(doorW - 0.02, doorH - 0.03, doorThick),
              materials.woodDeckMaterial || materials.cabinetMaterial
            );
            doorLeaf.rotation.y = 0.95;
            doorLeaf.position.set(doorX - doorW / 4, 0.15 + (doorH - 0.03) / 2, doorZ + 0.28);
            target.add(doorLeaf);
          }
        }
      };

      // Reusable Helper: Bedroom Suite (Bed, Mattress, Duvet, Pillows, Nightstands, Lamps, Wardrobes)
      const buildBedSuite = (
        target: THREE.Group,
        opts: {
          x: number;
          z: number;
          headZ?: number;
          bedW?: number;
          bedL?: number;
          dirZ?: number; // 1 = headboard facing rear (at min Z), -1 = headboard facing front (at max Z)
          hasNightstands?: boolean;
          hasWardrobe?: boolean;
          wardrobeX?: number;
          wardrobeZ?: number;
          wardrobeW?: number;
          wardrobeD?: number;
          isWardrobeAlongZ?: boolean;
        }
      ) => {
        const bedGroup = new THREE.Group();
        const bW = opts.bedW || 1.25;
        const bL = opts.bedL || 1.85;
        const dir = opts.dirZ || 1;
        const headZ = opts.headZ !== undefined ? opts.headZ : opts.z - (dir * bL) / 2;
        const centerZ = opts.headZ !== undefined ? headZ + (dir * bL) / 2 : opts.z;

        // Padded Headboard
        const hbH = 1.05;
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.08, hbH, 0.08), materials.sofaBoucleMaterial);
        headboard.position.set(opts.x, 0.15 + hbH / 2, headZ);
        headboard.castShadow = true;
        bedGroup.add(headboard);

        // Bed frame plinth & platform
        const frameH = 0.22;
        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(bW, frameH, bL), materials.sofaWoodFrameMaterial);
        bedFrame.position.set(opts.x, 0.15 + frameH / 2, centerZ);
        bedFrame.castShadow = true;
        bedGroup.add(bedFrame);

        // Mattress with pillow-top feel
        const matH = 0.22;
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(bW - 0.04, matH, bL - 0.04), materials.bedLinenMaterial);
        mattress.position.set(opts.x, 0.15 + frameH + matH / 2, centerZ);
        bedGroup.add(mattress);

        // Layered Duvet / Comforter
        const duvetL = bL * 0.64;
        const duvetZ = centerZ + dir * ((bL - duvetL) / 4);
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(bW - 0.02, 0.12, duvetL), materials.bedDuvetMaterial);
        duvet.position.set(opts.x, 0.15 + frameH + matH + 0.06, duvetZ);
        bedGroup.add(duvet);

        // Bed runner accent throw blanket at foot of bed
        const runnerL = 0.38;
        const runnerZ = centerZ + dir * (bL / 2 - runnerL / 2 - 0.06);
        const runner = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.02, 0.015, runnerL), materials.bedAccentThrowMaterial || materials.sofaBoucleMaterial);
        runner.position.set(opts.x, 0.15 + frameH + matH + 0.125, runnerZ);
        bedGroup.add(runner);

        // Pillows (4 pillows: 2 back upright, 2 front angled)
        const pillowZ = headZ + dir * 0.24;
        [-bW * 0.24, bW * 0.24].forEach((px) => {
          const pillowBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.30), materials.bedLinenMaterial);
          pillowBack.position.set(opts.x + px, 0.15 + frameH + matH + 0.06, pillowZ);
          const pillowFront = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.10, 0.26), materials.bedAccentThrowMaterial || materials.bedLinenMaterial);
          pillowFront.position.set(opts.x + px, 0.15 + frameH + matH + 0.08, pillowZ + dir * 0.14);
          bedGroup.add(pillowBack, pillowFront);
        });

        // Bedside Nightstands & Warm Ambient Table Lamps (Proportionally fitted with zero wall clipping)
        if (opts.hasNightstands !== false) {
          const standW = 0.20;
          const standH = 0.38;
          const standD = 0.28;
          [-bW / 2 - standW / 2 - 0.02, bW / 2 + standW / 2 + 0.02].forEach((nx) => {
            const stand = new THREE.Mesh(new THREE.BoxGeometry(standW, standH, standD), materials.nightstandWoodMaterial);
            stand.position.set(opts.x + nx, 0.15 + standH / 2, pillowZ);
            stand.castShadow = true;

            // Brass drawer knob
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), materials.brassHandleMaterial || materials.metalTrimMaterial);
            knob.position.set(opts.x + nx, 0.15 + standH * 0.65, pillowZ + dir * (standD / 2 + 0.015));

            // Table Lamp: Ceramic base + Glowing shade
            const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.07, 12), materials.ceramicVesselMaterial || materials.metalTrimMaterial);
            lampBase.position.set(opts.x + nx, 0.15 + standH + 0.035, pillowZ);
            const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 16), materials.lampGlowMaterial);
            lampShade.position.set(opts.x + nx, 0.15 + standH + 0.13, pillowZ);

            bedGroup.add(stand, knob, lampBase, lampShade);
          });
        }

        // Full-Height Wardrobe Closet with Panel Seams & Vertical Handles (Optional Turnkey Furniture)
        const shouldRenderWardrobe = Boolean(state.hasWardrobe) && opts.hasWardrobe !== false;
        if (shouldRenderWardrobe && opts.wardrobeX !== undefined && opts.wardrobeZ !== undefined) {
          const wH = 2.22;
          const wD = opts.wardrobeD || 0.52;
          const wW = opts.wardrobeW || 1.10;
          const isZ = opts.isWardrobeAlongZ !== false;

          const wardrobeBody = new THREE.Mesh(
            new THREE.BoxGeometry(isZ ? wD : wW, wH, isZ ? wW : wD),
            materials.cabinetMaterial
          );
          wardrobeBody.position.set(opts.wardrobeX, 0.15 + wH / 2, opts.wardrobeZ);
          wardrobeBody.castShadow = true;

          // Double door split groove
          const split = new THREE.Mesh(
            new THREE.BoxGeometry(isZ ? 0.01 : wW, wH - 0.1, isZ ? 0.01 : 0.01),
            materials.metalTrimMaterial
          );
          split.position.set(
            opts.wardrobeX + (isZ ? -wD / 2 - 0.005 : 0),
            0.15 + wH / 2,
            opts.wardrobeZ + (isZ ? 0 : -wD / 2 - 0.005)
          );

          // Vertical brushed metal bar handles
          const handle1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.28, 0.02), materials.brassHandleMaterial || materials.metalTrimMaterial);
          const handle2 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.28, 0.02), materials.brassHandleMaterial || materials.metalTrimMaterial);
          if (isZ) {
            handle1.position.set(opts.wardrobeX - wD / 2 - 0.015, 0.15 + 1.15, opts.wardrobeZ - 0.04);
            handle2.position.set(opts.wardrobeX - wD / 2 - 0.015, 0.15 + 1.15, opts.wardrobeZ + 0.04);
          } else {
            handle1.position.set(opts.wardrobeX - 0.04, 0.15 + 1.15, opts.wardrobeZ + wD / 2 + 0.015);
            handle2.position.set(opts.wardrobeX + 0.04, 0.15 + 1.15, opts.wardrobeZ + wD / 2 + 0.015);
          }

          bedGroup.add(wardrobeBody, split, handle1, handle2);
        }

        target.add(bedGroup);
      };

      // Reusable Helper: Gourmet Kitchenette Module with Refrigerator & LED Task Lighting
      // Positioned along the rear wall matching the 2D floor plan diagram with guaranteed zero wall bleeding
      const buildKitchen = (target: THREE.Group, kX?: number, kZ?: number, kLen = 1.85, hasFridge = true) => {
        if (state.hasKitchenetteModule === false) return;
        const kGroup = new THREE.Group();
        const kD = 0.54; // counter depth along Z (540mm)
        const kH = 0.88; // counter height (880mm)
        const rearWallClearance = 0.05; // 50mm clearance in front of rear exterior wall
        const leftWallClearance = 0.05; // 50mm clearance inside left exterior wall

        const fW = 0.60; // fridge width along X (600mm)
        const fD = 0.56; // fridge depth along Z (560mm)
        const fH = 1.88; // fridge height (1880mm)

        let startX = leftWallX + leftWallClearance;
        const kitchenRearZ = zRear + rearWallClearance;

        if (hasFridge) {
          const fX = startX + fW / 2;
          const fZ = kitchenRearZ + fD / 2;
          const fridge = new THREE.Mesh(new THREE.BoxGeometry(fW, fH, fD), materials.chassisMaterial);
          fridge.position.set(fX, 0.15 + fH / 2, fZ);
          fridge.castShadow = true;

          // Brushed aluminum door split & vertical bar handle on front face facing room (+Z)
          const doorLine = new THREE.Mesh(new THREE.BoxGeometry(fW, fH, 0.01), materials.metalTrimMaterial);
          doorLine.position.set(fX, 0.15 + fH / 2, fZ + fD / 2 + 0.005);
          const fHandle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.02), materials.brassHandleMaterial || materials.metalTrimMaterial);
          fHandle.position.set(fX + fW / 4, 0.15 + 1.10, fZ + fD / 2 + 0.015);

          kGroup.add(fridge, doorLine, fHandle);
          startX += fW + 0.02;
        }

        // Base Cabinets running across along X from fridge towards center core
        // Ensure cabinets do not collide with center spine wall at -coreWidth / 2
        const maxAvailableLen = Math.max(1.10, (-coreWidth / 2 - 0.06) - startX);
        const actualLen = Math.min(kLen, maxAvailableLen);
        const cabCenterX = startX + actualLen / 2;
        const cabCenterZ = kitchenRearZ + kD / 2;

        const baseCab = new THREE.Mesh(new THREE.BoxGeometry(actualLen, kH, kD), materials.cabinetMaterial);
        baseCab.position.set(cabCenterX, 0.15 + kH / 2, cabCenterZ);
        baseCab.castShadow = true;

        // Quartz / Marble Waterfall Countertop
        const counter = new THREE.Mesh(new THREE.BoxGeometry(actualLen + 0.02, 0.04, kD + 0.03), materials.countertopMaterial);
        counter.position.set(cabCenterX, 0.15 + kH + 0.02, cabCenterZ + 0.01);
        counter.castShadow = true;

        // Stainless Undermount Sink & Curved Gooseneck Faucet (prep zone)
        const sinkX = startX + actualLen * 0.32;
        const sink = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.10, 0.38), materials.chassisMaterial);
        sink.position.set(sinkX, 0.15 + kH - 0.04, cabCenterZ + 0.01);
        const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), materials.metalTrimMaterial);
        faucet.position.set(sinkX, 0.15 + kH + 0.14, cabCenterZ - 0.12);

        // Black Ceramic Induction Cooktop with Illuminated Red/Amber Rings (cook zone)
        const cookX = startX + actualLen * 0.72;
        const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.012, 0.36), materials.applianceGlassMaterial);
        cooktop.position.set(cookX, 0.15 + kH + 0.025, cabCenterZ + 0.01);
        [-0.12, 0.12].forEach((ox) => {
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 16), materials.ledStripMaterial);
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(cookX + ox, 0.15 + kH + 0.032, cabCenterZ + 0.01);
          kGroup.add(ring);
        });

        // Upper Wall Cupboards with Under-Cabinet Warm LED Task Strip
        const upperD = 0.32;
        const upperH = 0.62;
        const upperCab = new THREE.Mesh(new THREE.BoxGeometry(actualLen, upperH, upperD), materials.cabinetMaterial);
        upperCab.position.set(cabCenterX, 0.15 + kH + 0.60 + upperH / 2, kitchenRearZ + upperD / 2);

        const underLed = new THREE.Mesh(new THREE.BoxGeometry(actualLen - 0.08, 0.01, 0.03), materials.ledStripMaterial);
        underLed.position.set(cabCenterX, 0.15 + kH + 0.59, kitchenRearZ + upperD - 0.02);

        kGroup.add(baseCab, counter, sink, faucet, cooktop, upperCab, underLed);
        target.add(kGroup);
      };

      // Reusable Helper: Designer Living Room Lounge (Configurable Facing: East, South, etc.)
      const buildLiving = (
        target: THREE.Group,
        opts: {
          sX: number;
          sZ: number;
          sW?: number;
          facing?: 'east' | 'south'; // 'east' = sofa against left wall facing center; 'south' = sofa facing front
          tvOnWall?: boolean;
          tvWallX?: number;
          tvWallZ?: number;
          mediaWallLength?: number;
          hasExistingWall?: boolean;
        }
      ) => {
        const lGroup = new THREE.Group();
        const sW = opts.sW || 1.95;
        const sD = 0.84;
        const isFacingEast = opts.facing === 'east';

        if (isFacingEast) {
          // =================================================================
          // 1. SOFA: SCANDINAVIAN / ITALIAN LUXURY MODULAR SOFA (Facing East)
          // =================================================================
          // Sofa rests against the LEFT exterior wall (X = leftWallX), facing EAST (+X)
          const sofaX = leftWallX + sD / 2 + 0.08;
          const sofaZ = opts.sZ;
          const armW = 0.16;
          const usableSeatW = sW - armW * 2;
          const numCushions = sW >= 2.0 ? 3 : 2;
          const cushionW = (usableSeatW - 0.03 * (numCushions - 1)) / numCushions;

          // A. Architectural Tapered Metal Legs & Recessed Walnut Plinth
          const legH = 0.08;
          const plinthH = 0.05;
          const plinthD = sD - 0.08;
          const plinthW = sW - 0.08;

          // Solid American walnut plinth base
          const plinth = new THREE.Mesh(
            new THREE.BoxGeometry(plinthD, plinthH, plinthW),
            materials.sofaWoodFrameMaterial || materials.cabinetWoodNicheMaterial
          );
          plinth.position.set(sofaX, 0.15 + legH + plinthH / 2, sofaZ);
          plinth.castShadow = true;
          lGroup.add(plinth);

          // 4 Tapered brushed brass / matte black furniture legs at 4 corners
          const legOffsetsX = [-plinthD / 2 + 0.05, plinthD / 2 - 0.05];
          const legOffsetsZ = [-plinthW / 2 + 0.06, plinthW / 2 - 0.06];
          legOffsetsX.forEach((lx) => {
            legOffsetsZ.forEach((lz) => {
              const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.016, 0.010, legH, 12),
                materials.brassHandleMaterial || materials.metalTrimMaterial
              );
              leg.position.set(sofaX + lx, 0.15 + legH / 2, sofaZ + lz);
              leg.castShadow = true;
              lGroup.add(leg);
            });
          });

          // B. Deep Upholstered Sprung Base Chassis
          const baseH = 0.22;
          const baseY = 0.15 + legH + plinthH + baseH / 2;
          const sofaBase = new THREE.Mesh(
            new THREE.BoxGeometry(sD, baseH, sW),
            materials.sofaBoucleMaterial
          );
          sofaBase.position.set(sofaX, baseY, sofaZ);
          sofaBase.castShadow = true;

          // Subtle tailored piping welt along base edge
          const welt = new THREE.Mesh(
            new THREE.BoxGeometry(sD + 0.01, 0.012, sW + 0.01),
            materials.sofaBoucleMaterial
          );
          welt.position.set(sofaX, baseY + baseH / 2, sofaZ);
          lGroup.add(sofaBase, welt);

          // C. Segmented Plush Feather-Down Seat Cushions
          const seatCushionH = 0.14;
          const seatCushionD = sD - 0.18;
          const seatCushionY = 0.15 + legH + plinthH + baseH + seatCushionH / 2;
          const seatCenterX = sofaX + 0.07;

          for (let i = 0; i < numCushions; i++) {
            const cz = sofaZ - usableSeatW / 2 + cushionW / 2 + i * (cushionW + 0.03);
            const cushion = new THREE.Mesh(
              new THREE.BoxGeometry(seatCushionD, seatCushionH, cushionW),
              materials.sofaBoucleMaterial
            );
            cushion.position.set(seatCenterX, seatCushionY, cz);
            cushion.castShadow = true;

            // Crowned pillow top layer
            const crown = new THREE.Mesh(
              new THREE.BoxGeometry(seatCushionD - 0.04, 0.025, cushionW - 0.04),
              materials.sofaBoucleMaterial
            );
            crown.position.set(seatCenterX, seatCushionY + seatCushionH / 2 + 0.01, cz);

            lGroup.add(cushion, crown);
          }

          // D. Sculpted Ergonomic Backrest Frame & Individual Back Cushions
          const backFrameH = 0.44;
          const backFrameD = 0.18;
          const backFrameX = sofaX - sD / 2 + backFrameD / 2;
          const backFrameY = 0.15 + legH + plinthH + baseH + backFrameH / 2;

          const backFrame = new THREE.Mesh(
            new THREE.BoxGeometry(backFrameD, backFrameH, sW),
            materials.sofaBoucleMaterial
          );
          backFrame.position.set(backFrameX, backFrameY, sofaZ);
          backFrame.castShadow = true;
          lGroup.add(backFrame);

          // Individual plush back pillows tilted slightly back (~7 deg) for ergonomic comfort
          const backCushionH = 0.40;
          const backCushionD = 0.14;
          const backCushionY = seatCushionY + seatCushionH / 2 + backCushionH / 2 - 0.02;
          const backCushionX = backFrameX + backFrameD / 2 + 0.04;

          for (let i = 0; i < numCushions; i++) {
            const cz = sofaZ - usableSeatW / 2 + cushionW / 2 + i * (cushionW + 0.03);
            const bCushion = new THREE.Mesh(
              new THREE.BoxGeometry(backCushionD, backCushionH, cushionW - 0.02),
              materials.sofaBoucleMaterial
            );
            bCushion.position.set(backCushionX, backCushionY, cz);
            bCushion.rotation.z = 0.12; // Reclined comfortably back against frame
            bCushion.castShadow = true;

            // Horizontal tufting detail groove
            const tuft = new THREE.Mesh(
              new THREE.BoxGeometry(0.01, 0.012, cushionW - 0.08),
              materials.chassisMaterial
            );
            tuft.position.set(backCushionX + backCushionD / 2 - 0.01, backCushionY, cz);
            tuft.rotation.z = 0.12;

            lGroup.add(bCushion, tuft);
          }

          // E. Wide Sculpted Track Armrests on Both Ends
          const armH = 0.28;
          const armY = 0.15 + legH + plinthH + baseH + armH / 2;
          [-sW / 2 + armW / 2, sW / 2 - armW / 2].forEach((az) => {
            const arm = new THREE.Mesh(
              new THREE.BoxGeometry(sD, armH, armW),
              materials.sofaBoucleMaterial
            );
            arm.position.set(sofaX, armY, sofaZ + az);
            arm.castShadow = true;

            // Padded armrest top cap
            const armCap = new THREE.Mesh(
              new THREE.BoxGeometry(sD - 0.04, 0.025, armW - 0.02),
              materials.sofaBoucleMaterial
            );
            armCap.position.set(sofaX, armY + armH / 2 + 0.01, sofaZ + az);

            lGroup.add(arm, armCap);
          });

          // F. Designer Multi-Textured Accent Pillows
          // Pair of square textured bouclé pillows
          [-usableSeatW * 0.35, usableSeatW * 0.35].forEach((pz, idx) => {
            const pillow = new THREE.Mesh(
              new THREE.BoxGeometry(0.12, 0.32, 0.32),
              idx === 0 ? materials.sofaCushionAccent1 : materials.sofaCushionAccent2
            );
            pillow.position.set(backCushionX + 0.06, seatCushionY + 0.14, sofaZ + pz);
            pillow.rotation.y = idx === 0 ? 0.24 : -0.24;
            pillow.rotation.z = 0.15;
            pillow.castShadow = true;
            lGroup.add(pillow);
          });

          // Velvet / Terracotta Lumbar Throw Cushion tucked in center/corner
          const lumbarPillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.10, 0.20, 0.36),
            materials.bedAccentThrowMaterial || materials.sofaCushionAccent2
          );
          lumbarPillow.position.set(backCushionX + 0.08, seatCushionY + 0.10, sofaZ - 0.12);
          lumbarPillow.rotation.y = 0.08;
          lumbarPillow.rotation.z = 0.12;
          lGroup.add(lumbarPillow);

          // G. Draped Cashmere / Wool Throw Blanket casually draped over front armrest
          const blanketArmZ = sofaZ + sW / 2 - armW / 2;
          const throwBlanket = new THREE.Mesh(
            new THREE.BoxGeometry(sD * 0.55, 0.015, armW + 0.08),
            materials.bedAccentThrowMaterial || materials.furnitureFabricMaterial
          );
          throwBlanket.position.set(sofaX + 0.06, armY + armH / 2 + 0.025, blanketArmZ);

          const blanketCascade = new THREE.Mesh(
            new THREE.BoxGeometry(0.015, 0.28, armW + 0.06),
            materials.bedAccentThrowMaterial || materials.furnitureFabricMaterial
          );
          blanketCascade.position.set(sofaX + sD * 0.28, armY + armH / 2 - 0.12, blanketArmZ);
          lGroup.add(throwBlanket, blanketCascade);

          // =================================================================
          // 2. COFFEE TABLE & AREA RUG
          // =================================================================
          const tableX = leftWingCenterX + 0.05;
          const tableZ = sofaZ;

          // High-pile luxury designer area rug centered under sofa and table
          const rugW = Math.abs(tableX - sofaX) + sD + 0.55;
          const rugL = sW + 0.55;
          const rugThickness = 0.012; // 12mm true 3D pile depth
          const rugBaseY = 0.153; // Elevated 1mm above floor plane to ensure bottom face never touches floor
          const rugTopY = rugBaseY + rugThickness;
          const rug = new THREE.Mesh(
            new THREE.BoxGeometry(rugW, rugThickness, rugL),
            materials.rugMaterial || materials.furnitureFabricMaterial
          );
          rug.position.set((sofaX + tableX) / 2, rugBaseY + rugThickness / 2, sofaZ);
          rug.receiveShadow = true;
          rug.castShadow = true;
          lGroup.add(rug);

          // Travertine Stone Coffee Table with rounded chamfered profile resting cleanly on rug
          const tbl = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.32, 0.95),
            materials.travertineTableMaterial
          );
          tbl.position.set(tableX, rugTopY + 0.16, tableZ);
          tbl.castShadow = true;

          // Wood serving tray with artisan ceramic vase & books
          const tray = new THREE.Mesh(
            new THREE.BoxGeometry(0.26, 0.02, 0.38),
            materials.sofaWoodFrameMaterial
          );
          tray.position.set(tableX, rugTopY + 0.32 + 0.01, tableZ - 0.12);

          const vase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.06, 0.14, 16),
            materials.ceramicVesselMaterial
          );
          vase.position.set(tableX, rugTopY + 0.32 + 0.09, tableZ - 0.12);

          const book1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.02, 0.24),
            materials.chassisMaterial
          );
          book1.position.set(tableX + 0.02, rugTopY + 0.32 + 0.01, tableZ + 0.18);
          const book2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.018, 0.22),
            materials.sofaCushionAccent1
          );
          book2.position.set(tableX + 0.02, rugTopY + 0.32 + 0.03, tableZ + 0.18);
          book2.rotation.y = 0.15;

          lGroup.add(tbl, tray, vase, book1, book2);

          // Modern Architectural Floor Lamp next to the sofa corner
          const lampX = sofaX - sD / 2 + 0.12;
          const lampZ = sofaZ - sW / 2 - 0.24;
          const lampBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.025, 16),
            materials.countertopMaterial || materials.metalTrimMaterial
          );
          lampBase.position.set(lampX, rugTopY + 0.0125, lampZ);

          const lampStem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.010, 0.010, 1.45, 12),
            materials.brassHandleMaterial || materials.metalTrimMaterial
          );
          lampStem.position.set(lampX, rugTopY + 1.45 / 2, lampZ);

          const lampShade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.18, 0.26, 16),
            materials.candleGlowMaterial || materials.bedLinenMaterial
          );
          lampShade.position.set(lampX, rugTopY + 1.38, lampZ);

          const lampBulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 12, 12),
            materials.candleGlowMaterial
          );
          lampBulb.position.set(lampX, rugTopY + 1.35, lampZ);

          lGroup.add(lampBase, lampStem, lampShade, lampBulb);

          // =================================================================
          // 3. ARCHITECTURAL FEATURE MEDIA WALL & WALL-MOUNTED 65" 4K OLED TV
          // =================================================================
          if (opts.tvOnWall !== false) {
            // Wall position along central corridor spine:
            // Right side of walkway is at X = coreWidth / 2 (+1.10m), facing West (-X) into walkway & living room
            const tvWallX = opts.tvWallX !== undefined ? opts.tvWallX : coreWidth / 2;
            const tvZ = opts.tvWallZ !== undefined ? opts.tvWallZ : sofaZ;
            const mediaWallLength = opts.mediaWallLength || 1.70;
            const mediaWallH = 2.30;
            const isRightWall = tvWallX > 0;
            const hasExistingWall = opts.hasExistingWall !== undefined ? opts.hasExistingWall : isRightWall;

            // A. Structural Solid Media Partition Wall (only if not already an existing corridor wall)
            if (!hasExistingWall) {
              const mediaWall = new THREE.Mesh(
                new THREE.BoxGeometry(intWallT, mediaWallH, mediaWallLength),
                materials.bambooCharcoalWallMaterial
              );
              mediaWall.position.set(tvWallX + intWallT / 2, 0.15 + mediaWallH / 2, tvZ);
              mediaWall.castShadow = true;
              lGroup.add(mediaWall);
            }

            // B. Decorative Acoustic Wood Slat Feature Accent Panel
            // Mounted on living room / walkway side of wall (facing -X)
            const panelW = mediaWallLength - 0.10;
            const panelH = mediaWallH - 0.12;
            const panelX = isRightWall ? tvWallX - intWallT / 2 - 0.005 : tvWallX - 0.008;

            // Dark acoustic felt backer
            const acousticFelt = new THREE.Mesh(
              new THREE.BoxGeometry(0.008, panelH, panelW),
              materials.chassisMaterial
            );
            acousticFelt.position.set(panelX, 0.15 + panelH / 2 + 0.06, tvZ);
            lGroup.add(acousticFelt);

            // Floor-to-ceiling vertical fluted timber slats
            const numSlats = 16;
            const slatSpacing = panelW / (numSlats + 1);
            for (let s = 1; s <= numSlats; s++) {
              const slatZ = tvZ - panelW / 2 + s * slatSpacing;
              const slat = new THREE.Mesh(
                new THREE.BoxGeometry(0.015, panelH, 0.035),
                materials.cabinetWoodNicheMaterial || materials.sofaWoodFrameMaterial
              );
              slat.position.set(panelX - 0.01, 0.15 + panelH / 2 + 0.06, slatZ);
              lGroup.add(slat);
            }

            // Warm Ambient Perimeter LED Back-Glow washing the acoustic slats
            const ledTop = new THREE.Mesh(
              new THREE.BoxGeometry(0.01, 0.015, panelW),
              materials.ledStripMaterial
            );
            ledTop.position.set(panelX - 0.02, 0.15 + panelH + 0.05, tvZ);
            lGroup.add(ledTop);

            // C. Wall-Mounted 65" 4K OLED Smart TV
            const tvScreenW = 1.45;
            const tvScreenH = 0.82;
            const tvY = 0.15 + 1.28;
            const tvScreenX = panelX - 0.035;

            // Heavy-duty slim wall-mount bracket attached to the wall
            const wallBracket = new THREE.Mesh(
              new THREE.BoxGeometry(0.035, 0.40, 0.50),
              materials.chassisMaterial
            );
            wallBracket.position.set(panelX - 0.018, tvY, tvZ);

            // Ultra-slim OLED TV metal chassis & frame
            const tvChassis = new THREE.Mesh(
              new THREE.BoxGeometry(0.025, tvScreenH, tvScreenW),
              materials.chassisMaterial
            );
            tvChassis.position.set(tvScreenX, tvY, tvZ);
            tvChassis.castShadow = true;

            // Glossy black 4K display face with cinematic reflection
            const tvGlass = new THREE.Mesh(
              new THREE.BoxGeometry(0.005, tvScreenH - 0.03, tvScreenW - 0.03),
              materials.applianceGlassMaterial
            );
            tvGlass.position.set(tvScreenX - 0.013, tvY, tvZ);

            // Subtle Ambilight glow behind TV casting soft warm light onto wood slats
            const tvGlow = new THREE.Mesh(
              new THREE.BoxGeometry(0.008, tvScreenH + 0.04, tvScreenW + 0.04),
              materials.ledStripMaterial
            );
            tvGlow.position.set(tvScreenX + 0.015, tvY, tvZ);

            // Metallic micro-bezel frame edge
            const tvBezel = new THREE.Mesh(
              new THREE.BoxGeometry(0.028, tvScreenH, 0.008),
              materials.metalTrimMaterial
            );
            tvBezel.position.set(tvScreenX, tvY, tvZ - tvScreenW / 2);
            const tvBezelR = new THREE.Mesh(
              new THREE.BoxGeometry(0.028, tvScreenH, 0.008),
              materials.metalTrimMaterial
            );
            tvBezelR.position.set(tvScreenX, tvY, tvZ + tvScreenW / 2);

            // D. Cinema Hi-Fi Soundbar Mounted directly under TV
            const soundbarW = 1.05;
            const soundbarH = 0.06;
            const soundbarD = 0.08;
            const soundbarY = tvY - tvScreenH / 2 - 0.08;
            const soundbar = new THREE.Mesh(
              new THREE.BoxGeometry(soundbarD, soundbarH, soundbarW),
              materials.chassisMaterial
            );
            soundbar.position.set(panelX - 0.04, soundbarY, tvZ);
            soundbar.castShadow = true;

            // Soundbar mesh grill & metallic end trim
            const soundbarTrim = new THREE.Mesh(
              new THREE.BoxGeometry(soundbarD + 0.005, 0.008, soundbarW),
              materials.metalTrimMaterial
            );
            soundbarTrim.position.set(panelX - 0.04, soundbarY + soundbarH / 2, tvZ);

            // E. Floating Fluted Oak Media Credenza Console
            const credenzaW = 1.60;
            const credenzaH = 0.28;
            const credenzaD = 0.30;
            const credenzaY = 0.15 + 0.42;
            const credenzaX = panelX - credenzaD / 2;

            const credenza = new THREE.Mesh(
              new THREE.BoxGeometry(credenzaD, credenzaH, credenzaW),
              materials.cabinetWoodNicheMaterial || materials.sofaWoodFrameMaterial
            );
            credenza.position.set(credenzaX, credenzaY, tvZ);
            credenza.castShadow = true;

            // Calacatta quartz top plate on media credenza
            const credenzaTop = new THREE.Mesh(
              new THREE.BoxGeometry(credenzaD + 0.02, 0.025, credenzaW + 0.02),
              materials.countertopMaterial || materials.chassisMaterial
            );
            credenzaTop.position.set(credenzaX, credenzaY + credenzaH / 2 + 0.0125, tvZ);

            // Dual tambour fluted drawer lines & brushed brass handles
            [-0.42, 0.42].forEach((cz) => {
              const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.018, 0.015, 0.18),
                materials.brassHandleMaterial || materials.metalTrimMaterial
              );
              handle.position.set(credenzaX - credenzaD / 2 - 0.01, credenzaY + 0.04, tvZ + cz);
              lGroup.add(handle);
            });

            // Styling decor on credenza top: sculptural ceramic bowl
            const bowl = new THREE.Mesh(
              new THREE.CylinderGeometry(0.09, 0.05, 0.04, 16),
              materials.ceramicVesselMaterial
            );
            bowl.position.set(credenzaX, credenzaY + credenzaH / 2 + 0.045, tvZ + 0.52);

            lGroup.add(
              wallBracket,
              tvChassis,
              tvGlass,
              tvGlow,
              tvBezel,
              tvBezelR,
              soundbar,
              soundbarTrim,
              credenza,
              credenzaTop,
              bowl
            );
          }
        } else {
          // =================================================================
          // SOUTH-FACING SOFA CONFIGURATION (With detailed cushions & plinth)
          // =================================================================
          const sX = opts.sX;
          const sZ = opts.sZ;
          const armW = 0.16;
          const usableSeatW = sW - armW * 2;
          const numCushions = sW >= 2.0 ? 3 : 2;
          const cushionW = (usableSeatW - 0.03 * (numCushions - 1)) / numCushions;

          // A. Walnut Plinth Base & Metal Legs
          const legH = 0.08;
          const plinthH = 0.05;
          const plinthW = sW - 0.08;
          const plinthD = sD - 0.08;

          const plinth = new THREE.Mesh(
            new THREE.BoxGeometry(plinthW, plinthH, plinthD),
            materials.sofaWoodFrameMaterial || materials.cabinetWoodNicheMaterial
          );
          plinth.position.set(sX, 0.15 + legH + plinthH / 2, sZ);
          plinth.castShadow = true;
          lGroup.add(plinth);

          [-plinthW / 2 + 0.06, plinthW / 2 - 0.06].forEach((lx) => {
            [-plinthD / 2 + 0.05, plinthD / 2 - 0.05].forEach((lz) => {
              const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.016, 0.010, legH, 12),
                materials.brassHandleMaterial || materials.metalTrimMaterial
              );
              leg.position.set(sX + lx, 0.15 + legH / 2, sZ + lz);
              lGroup.add(leg);
            });
          });

          // B. Upholstered Base Chassis
          const baseH = 0.22;
          const baseY = 0.15 + legH + plinthH + baseH / 2;
          const sofaBase = new THREE.Mesh(
            new THREE.BoxGeometry(sW, baseH, sD),
            materials.sofaBoucleMaterial
          );
          sofaBase.position.set(sX, baseY, sZ);
          sofaBase.castShadow = true;
          lGroup.add(sofaBase);

          // C. Segmented Seat Cushions
          const seatCushionH = 0.14;
          const seatCushionD = sD - 0.18;
          const seatCushionY = 0.15 + legH + plinthH + baseH + seatCushionH / 2;
          const seatCenterZ = sZ + 0.07;

          for (let i = 0; i < numCushions; i++) {
            const cx = sX - usableSeatW / 2 + cushionW / 2 + i * (cushionW + 0.03);
            const cushion = new THREE.Mesh(
              new THREE.BoxGeometry(cushionW, seatCushionH, seatCushionD),
              materials.sofaBoucleMaterial
            );
            cushion.position.set(cx, seatCushionY, seatCenterZ);
            cushion.castShadow = true;
            lGroup.add(cushion);
          }

          // D. Backrest Frame & Reclined Back Cushions
          const backFrameH = 0.44;
          const backFrameD = 0.18;
          const backFrameZ = sZ - sD / 2 + backFrameD / 2;
          const backFrameY = 0.15 + legH + plinthH + baseH + backFrameH / 2;

          const backFrame = new THREE.Mesh(
            new THREE.BoxGeometry(sW, backFrameH, backFrameD),
            materials.sofaBoucleMaterial
          );
          backFrame.position.set(sX, backFrameY, backFrameZ);
          backFrame.castShadow = true;
          lGroup.add(backFrame);

          for (let i = 0; i < numCushions; i++) {
            const cx = sX - usableSeatW / 2 + cushionW / 2 + i * (cushionW + 0.03);
            const bCushion = new THREE.Mesh(
              new THREE.BoxGeometry(cushionW - 0.02, 0.40, 0.14),
              materials.sofaBoucleMaterial
            );
            bCushion.position.set(cx, seatCushionY + 0.18, backFrameZ + backFrameD / 2 + 0.04);
            bCushion.rotation.x = -0.12;
            bCushion.castShadow = true;
            lGroup.add(bCushion);
          }

          // E. Armrests
          const armH = 0.28;
          const armY = 0.15 + legH + plinthH + baseH + armH / 2;
          [-sW / 2 + armW / 2, sW / 2 - armW / 2].forEach((ax) => {
            const arm = new THREE.Mesh(
              new THREE.BoxGeometry(armW, armH, sD),
              materials.sofaBoucleMaterial
            );
            arm.position.set(sX + ax, armY, sZ);
            arm.castShadow = true;
            lGroup.add(arm);
          });

          // F. Accent Pillows & Draped Blanket
          [-usableSeatW * 0.35, usableSeatW * 0.35].forEach((px, idx) => {
            const pillow = new THREE.Mesh(
              new THREE.BoxGeometry(0.32, 0.32, 0.12),
              idx === 0 ? materials.sofaCushionAccent1 : materials.sofaCushionAccent2
            );
            pillow.position.set(sX + px, seatCushionY + 0.14, backFrameZ + 0.16);
            pillow.rotation.y = idx === 0 ? -0.24 : 0.24;
            pillow.rotation.x = -0.15;
            lGroup.add(pillow);
          });

          const blanketArmX = sX + sW / 2 - armW / 2;
          const throwBlanket = new THREE.Mesh(
            new THREE.BoxGeometry(armW + 0.08, 0.015, sD * 0.55),
            materials.bedAccentThrowMaterial || materials.furnitureFabricMaterial
          );
          throwBlanket.position.set(blanketArmX, armY + armH / 2 + 0.025, sZ + 0.06);
          lGroup.add(throwBlanket);

          // Table & Rug
          const rugThickness = 0.012;
          const rugBaseY = 0.153;
          const rugTopY = rugBaseY + rugThickness;
          const tbl = new THREE.Mesh(
            new THREE.BoxGeometry(sW * 0.55, 0.32, 0.48),
            materials.travertineTableMaterial
          );
          tbl.position.set(sX, rugTopY + 0.16, sZ + 0.65);
          tbl.castShadow = true;

          const rug = new THREE.Mesh(
            new THREE.BoxGeometry(sW + 0.55, rugThickness, 1.75),
            materials.rugMaterial || materials.furnitureFabricMaterial
          );
          rug.position.set(sX, rugBaseY + rugThickness / 2, sZ + 0.35);
          rug.receiveShadow = true;
          rug.castShadow = true;

          lGroup.add(tbl, rug);
        }

        target.add(lGroup);
      };

      // Reusable Helper: Dining Table with Ergonomic Padded Chairs & Table Runner
      const buildDining = (target: THREE.Group, tX: number, tZ: number, seats = 4) => {
        const dGroup = new THREE.Group();
        const is8 = seats === 8;
        const tW = is8 ? 1.75 : 1.15;
        const tD = is8 ? 0.95 : 0.72;
        const tH = 0.75;

        // Solid Wood Dining Table Top with chamfered edge
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(tW, 0.04, tD), materials.sofaWoodFrameMaterial);
        tableTop.position.set(tX, 0.15 + tH, tZ);
        tableTop.castShadow = true;

        // Table Legs
        [-tW / 2 + 0.06, tW / 2 - 0.06].forEach((lx) => {
          [-tD / 2 + 0.06, tD / 2 - 0.06].forEach((lz) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, tH, 12), materials.sofaWoodFrameMaterial);
            leg.position.set(tX + lx, 0.15 + tH / 2, tZ + lz);
            dGroup.add(leg);
          });
        });

        // Fabric Table Runner for Banquet Dining
        if (is8) {
          const runner = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.04, 0.005, 0.34), materials.bedAccentThrowMaterial || materials.sofaBoucleMaterial);
          runner.position.set(tX, 0.15 + tH + 0.022, tZ);
          dGroup.add(runner);
        }

        // Padded Dining Chairs (Seat + Backrest)
        const chairsPerSide = is8 ? 3 : 2;
        const spacing = tW / (chairsPerSide + 1);
        for (let i = 1; i <= chairsPerSide; i++) {
          const cX = tX - tW / 2 + i * spacing;
          // Front chair (+Z)
          const seatF = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.045, 0.36), materials.sofaBoucleMaterial);
          seatF.position.set(cX, 0.15 + 0.45, tZ + tD / 2 + 0.22);
          const backF = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.03), materials.sofaBoucleMaterial);
          backF.position.set(cX, 0.15 + 0.64, tZ + tD / 2 + 0.38);

          // Rear chair (-Z)
          const seatR = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.045, 0.36), materials.sofaBoucleMaterial);
          seatR.position.set(cX, 0.15 + 0.45, tZ - tD / 2 - 0.22);
          const backR = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.03), materials.sofaBoucleMaterial);
          backR.position.set(cX, 0.15 + 0.64, tZ - tD / 2 - 0.38);

          dGroup.add(seatF, backF, seatR, backR);
        }

        // End chairs for 8-person banquet
        if (is8) {
          [-tW / 2 - 0.22, tW / 2 + 0.22].forEach((endX, idx) => {
            const endSeat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.045, 0.36), materials.sofaBoucleMaterial);
            endSeat.position.set(tX + endX, 0.15 + 0.45, tZ);
            const endBack = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.36), materials.sofaBoucleMaterial);
            endBack.position.set(tX + endX + (idx === 0 ? -0.16 : 0.16), 0.15 + 0.64, tZ);
            dGroup.add(endSeat, endBack);
          });
        }

        dGroup.add(tableTop);
        target.add(dGroup);
      };

      // 1. Central Integrated Bathroom Pod (Plumbed in Central Spine in All 6 Plans)
      if (state.hasLuxuryBathPod) {
        const bathGroup = new THREE.Group();
        const bWidth = coreWidth; // 2.20m across X: perfectly flush with spine partition boundaries [-coreWidth / 2, +coreWidth / 2]
        const bDepth = 1.50; // 1.50m along Z [zRear, zRear + bDepth]
        const bHeight = 2.30;
        const bCenterZ = zRear + bDepth / 2;

        // Dedicated Non-Slip Luxury Marble / Porcelain Bathroom Floor Slab
        const bathFloor = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth - 0.02, 0.025, bDepth - 0.02),
          materials.countertopMaterial || materials.chassisMaterial
        );
        bathFloor.position.set(0, 0.15 + 0.0125, bCenterZ);
        bathFloor.receiveShadow = true;
        bathGroup.add(bathFloor);

        // Moisture-Resistant Interior Rear Wall Panel
        const rearWallPanel = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth, bHeight, intWallT),
          materials.bambooCharcoalWallMaterial
        );
        rearWallPanel.position.set(0, 0.15 + bHeight / 2, zRear + intWallT / 2);
        rearWallPanel.castShadow = true;
        bathGroup.add(rearWallPanel);

        // Side Enclosure Partition Walls (intWallT = 0.075m)
        [-bWidth / 2 + intWallT / 2, bWidth / 2 - intWallT / 2].forEach((bx) => {
          const bSide = new THREE.Mesh(new THREE.BoxGeometry(intWallT, bHeight, bDepth), materials.bambooCharcoalWallMaterial);
          bSide.position.set(bx, 0.15 + bHeight / 2, bCenterZ);
          bSide.castShadow = true;
          bathGroup.add(bSide);
        });

        // ===================================================================
        // ENTRANCE ACCESS DOORWAY & FRONT PARTITION WALL (At Z = zRear + bDepth - intWallT / 2)
        // ===================================================================
        // Total pod width = 2.20m across X [-1.10m, +1.10m].
        // Layout:
        // Left Solid Wall (X = -1.10m to -0.60m): 0.50m wide solid wall segment
        // Entrance Doorway (X = -0.60m to +0.20m): 0.80m wide architectural doorway
        // Right Solid Wall (X = +0.20m to +1.10m): 0.90m wide solid privacy wall
        // Guaranteed 100% seamless enclosure: 0.50m + 0.80m + 0.90m = 2.20m (ZERO GAPS)
        const bDoorW = 0.80;
        const bDoorH = 2.10;
        const doorOpeningX = -0.20; // Center of entrance doorway
        const frontWallZ = zRear + bDepth - intWallT / 2;

        const leftFrontW = 0.50;
        const leftFrontX = -bWidth / 2 + leftFrontW / 2; // X = -0.85m
        const leftFrontWall = new THREE.Mesh(
          new THREE.BoxGeometry(leftFrontW, bHeight, intWallT),
          materials.bambooCharcoalWallMaterial
        );
        leftFrontWall.position.set(leftFrontX, 0.15 + bHeight / 2, frontWallZ);
        leftFrontWall.castShadow = true;
        bathGroup.add(leftFrontWall);

        const rightFrontW = 0.90;
        const rightFrontX = bWidth / 2 - rightFrontW / 2; // X = +0.65m
        const rightFrontWall = new THREE.Mesh(
          new THREE.BoxGeometry(rightFrontW, bHeight, intWallT),
          materials.bambooCharcoalWallMaterial
        );
        rightFrontWall.position.set(rightFrontX, 0.15 + bHeight / 2, frontWallZ);
        rightFrontWall.castShadow = true;
        bathGroup.add(rightFrontWall);

        // Header wall segment above the entrance door
        const doorHeaderH = bHeight - bDoorH;
        if (doorHeaderH > 0.01) {
          const doorHeader = new THREE.Mesh(
            new THREE.BoxGeometry(bDoorW, doorHeaderH, intWallT),
            materials.bambooCharcoalWallMaterial
          );
          doorHeader.position.set(doorOpeningX, 0.15 + bDoorH + doorHeaderH / 2, frontWallZ);
          doorHeader.castShadow = true;
          bathGroup.add(doorHeader);
        }

        // Architectural Door Jambs & Casing
        const jambT = 0.04;
        [-bDoorW / 2, bDoorW / 2].forEach((jx) => {
          const jamb = new THREE.Mesh(new THREE.BoxGeometry(jambT, bDoorH, intWallT + 0.02), materials.metalTrimMaterial);
          jamb.position.set(doorOpeningX + jx, 0.15 + bDoorH / 2, frontWallZ);
          bathGroup.add(jamb);
        });
        const headerJamb = new THREE.Mesh(new THREE.BoxGeometry(bDoorW + jambT * 2, 0.04, intWallT + 0.02), materials.metalTrimMaterial);
        headerJamb.position.set(doorOpeningX, 0.15 + bDoorH - 0.02, frontWallZ);
        const threshold = new THREE.Mesh(new THREE.BoxGeometry(bDoorW, 0.015, 0.10), materials.metalTrimMaterial);
        threshold.position.set(doorOpeningX, 0.15 + 0.0075, frontWallZ);
        bathGroup.add(headerJamb, threshold);

        // Entrance Access Door Leaf: Modern acoustic timber door swung open ajar (~22 deg into restroom)
        const doorThick = 0.038;
        const doorLeafW = bDoorW - 0.02;
        const doorLeafH = bDoorH - 0.03;
        const doorHingeX = doorOpeningX - bDoorW / 2 + 0.015; // Hinge on left jamb
        const doorSwingAngle = 0.38; // ~22 degrees open

        const doorGroup = new THREE.Group();
        doorGroup.position.set(doorHingeX, 0.15 + doorLeafH / 2, frontWallZ);
        doorGroup.rotation.y = -doorSwingAngle;

        const doorPanel = new THREE.Mesh(
          new THREE.BoxGeometry(doorLeafW, doorLeafH, doorThick),
          materials.woodDeckMaterial || materials.cabinetMaterial
        );
        doorPanel.position.set(doorLeafW / 2, 0, 0);
        doorPanel.castShadow = true;
        doorGroup.add(doorPanel);

        // Horizontal architectural routing groove lines on door leaf
        [-0.50, -0.15, 0.20, 0.55].forEach((gy) => {
          const groove = new THREE.Mesh(new THREE.BoxGeometry(doorLeafW - 0.06, 0.008, 0.005), materials.chassisMaterial);
          groove.position.set(doorLeafW / 2, gy, doorThick / 2 + 0.002);
          const grooveBack = new THREE.Mesh(new THREE.BoxGeometry(doorLeafW - 0.06, 0.008, 0.005), materials.chassisMaterial);
          grooveBack.position.set(doorLeafW / 2, gy, -doorThick / 2 - 0.002);
          doorGroup.add(groove, grooveBack);
        });

        // Modern brushed brass architectural lever handles on both sides with escutcheon plates
        const handleX = doorLeafW - 0.08;
        const handleY = 0.15 + 1.02 - (0.15 + doorLeafH / 2);
        [-1, 1].forEach((dir) => {
          const escutcheon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.006), materials.brassHandleMaterial || materials.metalTrimMaterial);
          escutcheon.position.set(handleX, handleY, dir * (doorThick / 2 + 0.003));
          const leverStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 8), materials.brassHandleMaterial || materials.metalTrimMaterial);
          leverStem.rotation.x = Math.PI / 2;
          leverStem.position.set(handleX, handleY + 0.02, dir * (doorThick / 2 + 0.02));
          const leverArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.015), materials.brassHandleMaterial || materials.metalTrimMaterial);
          leverArm.position.set(handleX - 0.05, handleY + 0.02, dir * (doorThick / 2 + 0.035));
          doorGroup.add(escutcheon, leverStem, leverArm);
        });
        const indicator = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12), materials.metalTrimMaterial);
        indicator.rotation.x = Math.PI / 2;
        indicator.position.set(handleX, handleY - 0.035, doorThick / 2 + 0.004);
        const thumbturn = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.016), materials.brassHandleMaterial || materials.metalTrimMaterial);
        thumbturn.position.set(handleX, handleY - 0.035, -doorThick / 2 - 0.008);
        doorGroup.add(indicator, thumbturn);
        bathGroup.add(doorGroup);

        // ===================================================================
        // FIXTURE A: WALK-IN RAINFALL SHOWER ENCLOSURE (Left Zone)
        // ===================================================================
        // Spans: Left wall (X = -1.06m) to X = -0.18m (width 0.88m)
        // Z: zRear + intWallT (Z = zRear + 0.075m) to Z = zRear + 0.995m (depth 0.92m)
        const showerTrayW = 0.88;
        const showerTrayD = 0.92;
        const showerCenterX = -bWidth / 2 + intWallT + showerTrayW / 2; // X = -0.62m
        const showerCenterZ = zRear + intWallT + showerTrayD / 2; // Z = zRear + 0.535m

        // 1. Ultra-Low Profile Stone Resin Shower Tray with Linear Trench Drain
        const showerTray = new THREE.Mesh(new THREE.BoxGeometry(showerTrayW, 0.045, showerTrayD), materials.chassisMaterial);
        showerTray.position.set(showerCenterX, 0.1725, showerCenterZ);

        const trenchDrain = new THREE.Mesh(new THREE.BoxGeometry(showerTrayW - 0.12, 0.008, 0.06), materials.metalTrimMaterial);
        trenchDrain.position.set(showerCenterX, 0.196, zRear + intWallT + 0.06);

        // 2. Frameless 10mm Tempered Glass Screen along Z (Dividing shower from dry zone)
        // Runs along X = -0.18m from rear wall to Z = zRear + intWallT + 0.94m
        const glassScreenX = -bWidth / 2 + intWallT + showerTrayW; // X = -0.18m
        const glassScreenD = showerTrayD + 0.02; // 0.94m along Z
        const glassCenterZ = zRear + intWallT + glassScreenD / 2;
        const glassHeight = 2.05;

        const showerGlass = new THREE.Mesh(new THREE.BoxGeometry(0.012, glassHeight, glassScreenD), materials.glassMaterial);
        showerGlass.position.set(glassScreenX, 0.15 + glassHeight / 2, glassCenterZ);

        const glassChannelBottom = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, glassScreenD), materials.chassisMaterial);
        glassChannelBottom.position.set(glassScreenX, 0.15 + 0.0125, glassCenterZ);

        const glassChannelWall = new THREE.Mesh(new THREE.BoxGeometry(0.025, glassHeight, 0.025), materials.chassisMaterial);
        glassChannelWall.position.set(glassScreenX, 0.15 + glassHeight / 2, zRear + intWallT + 0.0125);

        // Stabilizer Bar anchored cleanly to the left wall at the top of the glass
        const stabilizerBar = new THREE.Mesh(new THREE.BoxGeometry(showerTrayW, 0.02, 0.02), materials.metalTrimMaterial);
        stabilizerBar.position.set(showerCenterX, 0.15 + glassHeight - 0.01, zRear + intWallT + showerTrayD - 0.04);

        // 3. Polished Chrome 260mm Round Rainfall Showerhead & Wall Arm with Drop Pipe
        const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 24), materials.metalTrimMaterial);
        showerHead.position.set(showerCenterX, 0.15 + 2.12, showerCenterZ);

        const showerDropPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.10, 12), materials.metalTrimMaterial);
        showerDropPipe.position.set(showerCenterX, 0.15 + 2.17, showerCenterZ);

        const showerArm = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, showerTrayD / 2 + 0.05), materials.metalTrimMaterial);
        showerArm.position.set(showerCenterX, 0.15 + 2.22, zRear + intWallT + showerTrayD / 4);

        // 4. Secondary Hand Shower Wand & Vertical Slider Rail on Left Wall
        const sliderRail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.65, 12), materials.metalTrimMaterial);
        sliderRail.position.set(-bWidth / 2 + intWallT + 0.03, 0.15 + 1.30, showerCenterZ);
        const handWand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.20, 0.02), materials.metalTrimMaterial);
        handWand.position.set(-bWidth / 2 + intWallT + 0.05, 0.15 + 1.40, showerCenterZ);

        // 5. Thermostatic Digital Mixer Valve Plate on Left Wall
        const showerValve = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.12), materials.metalTrimMaterial);
        showerValve.position.set(-bWidth / 2 + intWallT + 0.015, 0.15 + 1.10, showerCenterZ);
        const knob1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 16), materials.metalTrimMaterial);
        knob1.rotation.z = Math.PI / 2;
        knob1.position.set(-bWidth / 2 + intWallT + 0.03, 0.15 + 1.15, showerCenterZ);
        const knob2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 16), materials.metalTrimMaterial);
        knob2.rotation.z = Math.PI / 2;
        knob2.position.set(-bWidth / 2 + intWallT + 0.03, 0.15 + 1.05, showerCenterZ);

        // 6. Recessed Illuminated Shower Niche on Rear Wall
        const nicheW = 0.38;
        const nicheH = 0.28;
        const nicheFrame = new THREE.Mesh(new THREE.BoxGeometry(nicheW, nicheH, 0.03), materials.countertopMaterial);
        nicheFrame.position.set(showerCenterX, 0.15 + 1.45, zRear + intWallT + 0.015);
        const nicheLed = new THREE.Mesh(new THREE.BoxGeometry(nicheW - 0.04, 0.015, 0.01), materials.ledStripMaterial);
        nicheLed.position.set(showerCenterX, 0.15 + 1.45 + nicheH / 2 - 0.015, zRear + intWallT + 0.02);

        bathGroup.add(
          showerTray,
          trenchDrain,
          showerGlass,
          glassChannelBottom,
          glassChannelWall,
          stabilizerBar,
          showerHead,
          showerDropPipe,
          showerArm,
          sliderRail,
          handWand,
          showerValve,
          knob1,
          knob2,
          nicheFrame,
          nicheLed
        );

        // ===================================================================
        // FIXTURE B: ELONGATED WALL-HUNG CERAMIC TOILET (WC) (Rear-Right Zone)
        // ===================================================================
        // Flush against the rear wall lining (Z = zRear + intWallT)
        // Dry zone spans from shower glass (X = -0.18m) to right wall (X = +1.025m)
        // Centered at X = +0.40m with generous legroom (0.88m open space in front)
        const toiletX = 0.40;
        const toiletRearZ = zRear + intWallT;
        const bowlW = 0.36;
        const bowlL = 0.54;
        const bowlCenterZ = toiletRearZ + bowlL / 2; // Z = zRear + 0.345m

        // 1. Ceramic Pedestal Base & Sculpted Bowl
        const tPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, bowlL - 0.08), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tPedestal.position.set(toiletX, 0.15 + 0.11, bowlCenterZ - 0.02);
        tPedestal.castShadow = true;

        const tBowl = new THREE.Mesh(new THREE.BoxGeometry(bowlW, 0.20, bowlL), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tBowl.position.set(toiletX, 0.15 + 0.22 + 0.10, bowlCenterZ);
        tBowl.castShadow = true;

        const tWell = new THREE.Mesh(new THREE.BoxGeometry(bowlW - 0.08, 0.06, bowlL - 0.12), materials.glassMaterial);
        tWell.position.set(toiletX, 0.15 + 0.38, bowlCenterZ + 0.02);

        // 2. Ergonomic Soft-Close Seat Ring & Contoured Lid
        const tSeat = new THREE.Mesh(new THREE.BoxGeometry(bowlW, 0.025, bowlL - 0.04), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tSeat.position.set(toiletX, 0.15 + 0.42 + 0.0125, bowlCenterZ);

        const tLid = new THREE.Mesh(new THREE.BoxGeometry(bowlW, 0.02, bowlL - 0.04), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tLid.position.set(toiletX, 0.15 + 0.445 + 0.01, bowlCenterZ);

        const tHinge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.03), materials.metalTrimMaterial);
        tHinge.position.set(toiletX, 0.15 + 0.44, toiletRearZ + 0.02);

        // 3. Concealed In-Wall Cistern Actuator Plate on Rear Wall
        const flushPlate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.012), materials.metalTrimMaterial);
        flushPlate.position.set(toiletX, 0.15 + 1.15, toiletRearZ + 0.008);
        const flushBtn1 = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.08, 0.008), materials.applianceGlassMaterial);
        flushBtn1.position.set(toiletX - 0.042, 0.15 + 1.15, toiletRearZ + 0.015);
        const flushBtn2 = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.08, 0.008), materials.applianceGlassMaterial);
        flushBtn2.position.set(toiletX + 0.042, 0.15 + 1.15, toiletRearZ + 0.015);

        // 4. Chrome Angle Stop Valve and Braided Stainless Hose
        const waterValve = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 8), materials.metalTrimMaterial);
        waterValve.rotation.z = Math.PI / 2;
        waterValve.position.set(toiletX - 0.22, 0.15 + 0.18, toiletRearZ + 0.02);
        const flexHose = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 16, Math.PI / 2), materials.metalTrimMaterial);
        flexHose.rotation.y = Math.PI / 2;
        flexHose.position.set(toiletX - 0.22, 0.15 + 0.24, toiletRearZ + 0.06);

        // 5. Toilet Paper Holder Mounted on Right Wall beside toilet
        const tpRightWallX = bWidth / 2 - intWallT;
        const tpZ = toiletRearZ + 0.42;
        const tpBracket = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.14), materials.metalTrimMaterial);
        tpBracket.position.set(tpRightWallX - 0.01, 0.15 + 0.72, tpZ);
        const tpRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.12, 16), materials.bedLinenMaterial);
        tpRoll.rotation.x = Math.PI / 2;
        tpRoll.position.set(tpRightWallX - 0.06, 0.15 + 0.72, tpZ);

        bathGroup.add(
          tPedestal,
          tBowl,
          tWell,
          tSeat,
          tLid,
          tHinge,
          flushPlate,
          flushBtn1,
          flushBtn2,
          waterValve,
          flexHose,
          tpBracket,
          tpRoll
        );

        // ===================================================================
        // FIXTURE C: LUXURY FLOATING VANITY SUITE (Front-Right Zone, Along Right Wall)
        // ===================================================================
        // Mounted flush along the solid RIGHT WALL (X = +1.025m), facing LEFT (-X)
        // Perfectly positioned in the front quadrant:
        // Length along Z = 0.68m [Z = zRear + 0.72m to Z = zRear + 1.40m]
        // Depth along X = 0.40m [extends from X = +1.025m inward to X = +0.625m]
        // Provides seamless open clearance between toilet and vanity, with no overlaps!
        const vW = 0.68; // Length along Z
        const vD = 0.40; // Depth along X
        const vH = 0.46; // Height
        const vanityRightX = bWidth / 2 - intWallT; // Flush against right wall at X = +1.025m
        const vanityX = vanityRightX - vD / 2; // X = +0.825m
        const vanityZ = zRear + intWallT + 0.98; // Z = zRear + 1.055m

        // 1. Floating Fluted Oak Vanity Cabinet with soft-close drawers
        const vanityCab = new THREE.Mesh(
          new THREE.BoxGeometry(vD, vH, vW),
          materials.cabinetWoodNicheMaterial || materials.sofaWoodFrameMaterial
        );
        vanityCab.position.set(vanityX, 0.15 + 0.36 + vH / 2, vanityZ);
        vanityCab.castShadow = true;

        // Front face is at X = vanityX - vD / 2 (facing -X into the bathroom)
        const frontFaceX = vanityX - vD / 2;
        const drawerSplit = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.008, vW - 0.04), materials.chassisMaterial);
        drawerSplit.position.set(frontFaceX - 0.003, 0.15 + 0.36 + vH / 2, vanityZ);

        const pull1 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.015, 0.28), materials.brassHandleMaterial || materials.metalTrimMaterial);
        pull1.position.set(frontFaceX - 0.012, 0.15 + 0.36 + vH * 0.75, vanityZ);
        const pull2 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.015, 0.28), materials.brassHandleMaterial || materials.metalTrimMaterial);
        pull2.position.set(frontFaceX - 0.012, 0.15 + 0.36 + vH * 0.25, vanityZ);

        // Lower open shelf with three rolled luxury guest towels
        const towelShelf = new THREE.Mesh(new THREE.BoxGeometry(vD - 0.06, 0.02, vW - 0.06), materials.cabinetMaterial);
        towelShelf.position.set(vanityX, 0.15 + 0.20, vanityZ);
        [-0.15, 0, 0.15].forEach((tz) => {
          const rolledTowel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, vD - 0.10, 12), materials.bedLinenMaterial);
          rolledTowel.rotation.z = Math.PI / 2;
          rolledTowel.position.set(vanityX, 0.15 + 0.25, vanityZ + tz);
          bathGroup.add(rolledTowel);
        });

        // 2. Calacatta Quartz Countertop with Splashback along Right Wall
        const vCounter = new THREE.Mesh(new THREE.BoxGeometry(vD + 0.01, 0.035, vW + 0.01), materials.countertopMaterial);
        vCounter.position.set(vanityX, 0.15 + 0.36 + vH + 0.0175, vanityZ);
        vCounter.castShadow = true;

        // Splashback flush against Right Wall (X = vanityRightX)
        const splashback = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, vW), materials.countertopMaterial);
        splashback.position.set(vanityRightX - 0.01, 0.15 + 0.36 + vH + 0.035 + 0.04, vanityZ);

        // 3. Contemporary Porcelain Vessel Basin Sink (Centered on Countertop)
        const basinW = 0.44; // Along Z
        const basinD = 0.28; // Along X
        const basinH = 0.12;
        const basinY = 0.15 + 0.36 + vH + 0.035 + basinH / 2;

        const vesselBasin = new THREE.Mesh(new THREE.BoxGeometry(basinD, basinH, basinW), materials.ceramicVesselMaterial || materials.countertopMaterial);
        vesselBasin.position.set(vanityX - 0.02, basinY, vanityZ);
        vesselBasin.castShadow = true;

        // Sloped inner basin cavity
        const basinCavity = new THREE.Mesh(new THREE.BoxGeometry(basinD - 0.05, basinH - 0.02, basinW - 0.06), materials.applianceGlassMaterial);
        basinCavity.position.set(vanityX - 0.02, basinY + 0.015, vanityZ);

        // Chrome pop-up drain stopper centered in basin
        const popUpDrain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16), materials.metalTrimMaterial);
        popUpDrain.position.set(vanityX - 0.02, basinY - basinH / 2 + 0.015, vanityZ);

        // 4. Tall Designer Mono-Bloc Mixer Faucet (Mounted behind vessel basin near Right Wall)
        const faucetX = vanityRightX - 0.06;
        const faucetStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12), materials.brassHandleMaterial || materials.metalTrimMaterial);
        faucetStem.position.set(faucetX, basinY + 0.06, vanityZ);
        const faucetSpout = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.015), materials.brassHandleMaterial || materials.metalTrimMaterial);
        faucetSpout.position.set(faucetX - 0.06, basinY + 0.16, vanityZ);
        const faucetLever = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.015), materials.brassHandleMaterial || materials.metalTrimMaterial);
        faucetLever.position.set(faucetX, basinY + 0.17, vanityZ);

        // 5. Amber Glass Soap Dispenser Bottle on counter
        const soapBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.10, 12), materials.candleGlowMaterial || materials.applianceGlassMaterial);
        soapBottle.position.set(vanityX + 0.08, 0.15 + 0.36 + vH + 0.035 + 0.05, vanityZ - 0.20);
        const soapPump = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 8), materials.metalTrimMaterial);
        soapPump.position.set(vanityX + 0.08, 0.15 + 0.36 + vH + 0.035 + 0.11, vanityZ - 0.20);

        // 6. Wall-Mounted Hand Towel Ring with Plush Hand Towel on Front Wall beside Vanity
        const towelRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 8, 16), materials.brassHandleMaterial || materials.metalTrimMaterial);
        towelRing.position.set(vanityX - 0.12, 0.15 + 1.15, frontWallZ - intWallT / 2 - 0.01);
        const hangingTowel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.02), materials.bedLinenMaterial);
        hangingTowel.position.set(vanityX - 0.12, 0.15 + 0.98, frontWallZ - intWallT / 2 - 0.01);

        // 7. Oversized Smart LED Backlit Mirror Mounted Flush Against Right Wall
        // Centered directly over the vanity at vanityZ, facing left (-X) into the bathroom
        const mirrorW = 0.54; // Along Z
        const mirrorH = 0.82; // Along Y
        const mirrorY = 0.15 + 1.50;
        const mirrorWallX = vanityRightX - 0.01;

        // Ambient halo glow behind mirror on right wall
        const mirrorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.01, mirrorH + 0.06, mirrorW + 0.06), materials.ledStripMaterial);
        mirrorGlow.position.set(mirrorWallX, mirrorY, vanityZ);

        // Brushed brass / black perimeter mirror frame
        const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.02, mirrorH, mirrorW), materials.brassHandleMaterial || materials.metalTrimMaterial);
        mirrorFrame.position.set(mirrorWallX - 0.01, mirrorY, vanityZ);

        // High-clarity glass mirror reflection face (facing -X into room)
        const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.005, mirrorH - 0.03, mirrorW - 0.03), materials.glassMaterial);
        mirrorGlass.position.set(mirrorWallX - 0.022, mirrorY, vanityZ);

        // Circular touch sensor icon on mirror surface
        const touchIcon = new THREE.Mesh(new THREE.RingGeometry(0.012, 0.016, 16), materials.ledStripMaterial);
        touchIcon.rotation.y = Math.PI / 2;
        touchIcon.position.set(mirrorWallX - 0.025, mirrorY - 0.28, vanityZ);

        bathGroup.add(
          vanityCab,
          drawerSplit,
          pull1,
          pull2,
          towelShelf,
          vCounter,
          splashback,
          vesselBasin,
          basinCavity,
          popUpDrain,
          faucetStem,
          faucetSpout,
          faucetLever,
          soapBottle,
          soapPump,
          towelRing,
          hangingTowel,
          mirrorGlow,
          mirrorFrame,
          mirrorGlass,
          touchIcon
        );

        interiorGroup.add(bathGroup);
      }

      // 2. Dynamic Layout Construction Based on Active Floor Plan
      const partGroup = new THREE.Group();
      const rightDividerZ = 0.10;
      const leftDividerZ = 0.10;

      switch (activeFloorPlan) {
        case '2-bed-1-bath': {
          // =================================================================
          // PLAN 1: 2 BEDROOMS, 1 RESTROOM, 1 LIVING ROOM (EXECUTIVE FAMILY)
          // =================================================================
          // Right Wing: Split into Master Bedroom (Rear) & Bedroom 2 (Front)
          const rightWingWidth = rightWallX - coreWidth / 2;
          const rightDividerX = coreWidth / 2 + rightWingWidth / 2;
          addWallSegment(partGroup, rightDividerX, height / 2 + 0.15, rightDividerZ, rightWingWidth, height, intWallT);

          // Corridor partition wall along X = coreWidth / 2 with 2 private doors
          // Positioned near central divider wall so doors open into open foyer walkway (never overlapping beds)
          const rearDoorZ = rightDividerZ - 0.55;
          const frontDoorZ = rightDividerZ + 0.55;
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (zRear + rearDoorZ - 0.41) / 2, intWallT, height, (rearDoorZ - 0.41) - zRear);
          addDoorOpening(partGroup, coreWidth / 2, rearDoorZ, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rearDoorZ + 0.41 + rightDividerZ) / 2, intWallT, height, rightDividerZ - (rearDoorZ + 0.41));
          addDoorOpening(partGroup, coreWidth / 2, frontDoorZ, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (frontDoorZ + 0.41 + zFront) / 2, intWallT, height, zFront - (frontDoorZ + 0.41));

          // Right Wing Furniture:
          // Master Bedroom Suite (Rear-Right): Bed headboard against rear wall, entrance door in front of bed
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zRear + 0.08 + 1.85 / 2,
            headZ: zRear + 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rearDoorZ,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Bedroom 2 (Front-Right): Bed headboard against front wall, entrance door in front of bed
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zFront - 0.08 - 1.85 / 2,
            headZ: zFront - 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: -1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: frontDoorZ,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Left Wing Furniture (Matches Initial Floor Plan Diagram Exactly):
          // Rear-Left: Kitchenette with continuous quartz counter, sink, cooktop, upper cabinets & tall fridge along rear wall
          buildKitchen(interiorGroup, undefined, undefined, 1.85, true);

          // Front-Left: Living Room Lounge with detailed sofa against LEFT wall facing EAST (+X),
          // coffee table in center, area rug, and TV console mounted on the wall of the RIGHT side of the walkway (X = coreWidth / 2)
          // just before the entrance of the first room on your right (Bedroom 2, frontDoorZ = 0.65m)
          // In the 40ft flagship expandable (depth 11.8m), positioned closer to the main entrance (tvWallZ = 3.45m)
          // so it sits proudly on the right walkway corridor wall with ~53cm clearance from the structural pillar at mz = 1.97m
          const tvWallZ = is40ft ? 3.45 : (is30ft ? 2.30 : 1.90);
          buildLiving(interiorGroup, {
            sX: leftWingCenterX,
            sZ: tvWallZ,
            sW: is40ft ? 2.10 : 1.95,
            facing: 'east',
            tvOnWall: true,
            tvWallX: coreWidth / 2, // Right side of walkway (+1.10m)
            tvWallZ: tvWallZ,
            mediaWallLength: 1.70,
            hasExistingWall: true,
          });
          break;
        }

        case '3-bed-split-1-bath': {
          // =================================================================
          // PLAN 2: 3 BEDROOMS, 1 RESTROOM, 1 LIVING ROOM (SPLIT-WING)
          // =================================================================
          // Left Wing: Kitchen/Dining (Rear-Left), Divider Wall, Bedroom 1 (Front-Left)
          const leftWingWidth = Math.abs(leftWallX - (-coreWidth / 2));
          const leftDividerX = (-coreWidth / 2 + leftWallX) / 2;
          addWallSegment(partGroup, leftDividerX, height / 2 + 0.15, leftDividerZ, leftWingWidth, height, intWallT);

          // Corridor partition along X = -coreWidth / 2 with private door to Bed 1
          const b1DoorZ = leftDividerZ + 0.55;
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (leftDividerZ + b1DoorZ - 0.41) / 2, intWallT, height, (b1DoorZ - 0.41) - leftDividerZ);
          addDoorOpening(partGroup, -coreWidth / 2, b1DoorZ, 0.82, 2.10, true, true);
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (b1DoorZ + 0.41 + zFront) / 2, intWallT, height, zFront - (b1DoorZ + 0.41));

          // Right Wing: Divider Wall with Bed 2 (Rear) & Bed 3 (Front)
          const rightWingWidth = rightWallX - coreWidth / 2;
          const rightDividerX = coreWidth / 2 + rightWingWidth / 2;
          addWallSegment(partGroup, rightDividerX, height / 2 + 0.15, rightDividerZ, rightWingWidth, height, intWallT);

          const rDoor1Z = rightDividerZ - 0.55;
          const rDoor2Z = rightDividerZ + 0.55;
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (zRear + rDoor1Z - 0.41) / 2, intWallT, height, (rDoor1Z - 0.41) - zRear);
          addDoorOpening(partGroup, coreWidth / 2, rDoor1Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rDoor1Z + 0.41 + rightDividerZ) / 2, intWallT, height, rightDividerZ - (rDoor1Z + 0.41));
          addDoorOpening(partGroup, coreWidth / 2, rDoor2Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rDoor2Z + 0.41 + zFront) / 2, intWallT, height, zFront - (rDoor2Z + 0.41));

          // Furniture:
          // Top-Left Kitchenette + Breakfast Dining Table & Chairs (Matching 2D Diagram)
          buildKitchen(interiorGroup, undefined, undefined, 1.45, true);
          buildDining(interiorGroup, leftWingCenterX, -0.65, 4);

          // Bottom-Left Bedroom 1: Bed headboard against front wall, doorway into open foyer
          buildBedSuite(interiorGroup, {
            x: leftWingCenterX,
            z: zFront - 0.08 - 1.85 / 2,
            headZ: zFront - 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: -1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: leftWallX + 0.26,
            wardrobeZ: b1DoorZ,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Top-Right Bedroom 2: Bed headboard against rear wall, doorway into open foyer
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zRear + 0.08 + 1.85 / 2,
            headZ: zRear + 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rDoor1Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Bottom-Right Bedroom 3: Bed headboard against front wall, doorway into open foyer
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zFront - 0.08 - 1.85 / 2,
            headZ: zFront - 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: -1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rDoor2Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Central Corridor Spine: Dining / Gathering credenza & smart console
          break;
        }

        case '3-bed-kitchen-lounge': {
          // =================================================================
          // PLAN 3: 3 BEDROOMS, 1 RESTROOM, 1 LIVING (PENINSULA KITCHEN)
          // =================================================================
          // Left Wing: Bedroom 1 (Rear), Kitchen Peninsula divider in middle, Living Lounge (Front)
          const leftWingWidth = Math.abs(leftWallX - (-coreWidth / 2));
          const leftDividerX = (-coreWidth / 2 + leftWallX) / 2;
          const kDivZ = -0.32;
          addWallSegment(partGroup, leftDividerX, height / 2 + 0.15, kDivZ, leftWingWidth, height, intWallT);

          // Corridor partition with door to Bedroom 1 (near divider wall so it never overlaps bed)
          const b1DoorZ = kDivZ - 0.55;
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (zRear + b1DoorZ - 0.41) / 2, intWallT, height, (b1DoorZ - 0.41) - zRear);
          addDoorOpening(partGroup, -coreWidth / 2, b1DoorZ, 0.82, 2.10, true, true);
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (b1DoorZ + 0.41 + kDivZ) / 2, intWallT, height, kDivZ - (b1DoorZ + 0.41));

          // Right Wing: Divider Wall with Bed 2 (Rear) & Bed 3 (Front)
          const rightWingWidth = rightWallX - coreWidth / 2;
          const rightDividerX = coreWidth / 2 + rightWingWidth / 2;
          addWallSegment(partGroup, rightDividerX, height / 2 + 0.15, rightDividerZ, rightWingWidth, height, intWallT);

          const rDoor1Z = rightDividerZ - 0.55;
          const rDoor2Z = rightDividerZ + 0.55;
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (zRear + rDoor1Z - 0.41) / 2, intWallT, height, (rDoor1Z - 0.41) - zRear);
          addDoorOpening(partGroup, coreWidth / 2, rDoor1Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rDoor1Z + 0.41 + rightDividerZ) / 2, intWallT, height, rightDividerZ - (rDoor1Z + 0.41));
          addDoorOpening(partGroup, coreWidth / 2, rDoor2Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rDoor2Z + 0.41 + zFront) / 2, intWallT, height, zFront - (rDoor2Z + 0.41));

          // Furniture:
          // Bedroom 1 (Rear-Left): Enclosed bedroom with bed at rear wall, door in walkway
          buildBedSuite(interiorGroup, {
            x: leftWingCenterX,
            z: zRear + 0.08 + 1.85 / 2,
            headZ: zRear + 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: leftWallX + 0.26,
            wardrobeZ: b1DoorZ,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Kitchen Peninsula Counter with Induction Burners & Bar Stools
          const pWidth = leftWingWidth - 0.35;
          const pCounter = new THREE.Mesh(new THREE.BoxGeometry(pWidth, 0.88, 0.54), materials.countertopMaterial);
          pCounter.position.set(leftDividerX - 0.08, 0.15 + 0.44, kDivZ + 0.32);
          pCounter.castShadow = true;
          // Dual induction rings on peninsula
          [-0.22, 0.08].forEach((px) => {
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.08, 16), materials.ledStripMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(leftDividerX - 0.08 + px, 0.15 + 0.88 + 0.015, kDivZ + 0.32);
            interiorGroup.add(ring);
          });
          interiorGroup.add(pCounter);

          // Front-Left Living Lounge: Sofa against left exterior wall facing EAST (+X), coffee table, rug,
          // and TV console mounted on the wall of the RIGHT side of the walkway just before Bedroom 3 entrance
          // In 40ft flagship expandable, positioned closer to the main entrance (tvWallZ = 3.45m) to clear the intermediate pillar
          const tvWallZ = is40ft ? 3.45 : (is30ft ? 2.30 : 1.90);
          buildLiving(interiorGroup, {
            sX: leftWingCenterX,
            sZ: tvWallZ,
            sW: is40ft ? 1.85 : 1.65,
            facing: 'east',
            tvOnWall: true,
            tvWallX: coreWidth / 2, // Right side of walkway (+1.10m)
            tvWallZ: tvWallZ,
            mediaWallLength: 1.70,
            hasExistingWall: true,
          });

          // Bedroom 2 (Rear-Right) & Bedroom 3 (Front-Right): Headboards at end walls, doors never overlap beds
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zRear + 0.08 + 1.85 / 2,
            headZ: zRear + 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rDoor1Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zFront - 0.08 - 1.85 / 2,
            headZ: zFront - 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: -1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rDoor2Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });
          break;
        }

        case '1-bed-grand-dining': {
          // =================================================================
          // PLAN 4: 1 BEDROOM, 1 RESTROOM, 1 LIVING ROOM (GRAND DINING)
          // =================================================================
          // Right Wing: Partition enclosing Master Suite at Rear-Right
          const rightWingWidth = rightWallX - coreWidth / 2;
          const rightDividerX = coreWidth / 2 + rightWingWidth / 2;
          const masterZEnd = -0.32;
          addWallSegment(partGroup, rightDividerX, height / 2 + 0.15, masterZEnd, rightWingWidth, height, intWallT);

          // Corridor wall enclosing master suite with private door near masterZEnd (never overlapping bed)
          const mDoorZ = masterZEnd - 0.55;
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (zRear + mDoorZ - 0.41) / 2, intWallT, height, (mDoorZ - 0.41) - zRear);
          addDoorOpening(partGroup, coreWidth / 2, mDoorZ, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (mDoorZ + 0.41 + masterZEnd) / 2, intWallT, height, masterZEnd - (mDoorZ + 0.41));

          // Master Bed Suite (Rear-Right): King bed at rear wall, dual nightstands, wardrobe
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zRear + 0.08 + 1.95 / 2,
            headZ: zRear + 0.08,
            bedW: 1.50,
            bedL: 1.95,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: mDoorZ,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Left Wing: Extended Linear Gourmet Kitchen with full array of cabinets, sink, cooktop, fridge along rear wall
          buildKitchen(interiorGroup, undefined, undefined, 1.85, true);

          // Center Spine / Great Hall: Grand 8-Person Banquet Dining Table with 8 chairs & runner
          buildDining(interiorGroup, 0, 0.65, 8);

          // Front-Right Wing: Open Sunlit Living Lounge with sofa, coffee table, and area rug
          buildLiving(interiorGroup, {
            sX: rightWingCenterX,
            sZ: 1.20,
            sW: 1.75,
            facing: 'south',
            tvOnWall: false,
          });
          break;
        }

        case '1-bed-studio-suite': {
          // =================================================================
          // PLAN 5: 1 BEDROOM, 1 RESTROOM, 1 LIVING ROOM (EXECUTIVE STUDIO)
          // =================================================================
          // Right Wing: Dedicated Enclosed Master Suite & Executive Office
          const rightWingWidth = rightWallX - coreWidth / 2;
          const mDoorZ = -0.45;
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (zRear + mDoorZ - 0.45) / 2, intWallT, height, mDoorZ - 0.45 - zRear);
          addDoorOpening(partGroup, coreWidth / 2, mDoorZ, 0.90, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (mDoorZ + 0.45 + zFront) / 2, intWallT, height, zFront - (mDoorZ + 0.45));

          // Right Wing Furniture:
          // King Bed at rear with headboard against rear wall
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zRear + 0.08 + 1.95 / 2,
            headZ: zRear + 0.08,
            bedW: 1.50,
            bedL: 1.95,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: 0.10,
            wardrobeW: 0.90,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Executive Work Desk & Ergonomic Swivel Chair overlooking the front window
          const desk = new THREE.Mesh(new THREE.BoxGeometry(1.20, 0.04, 0.58), materials.sofaWoodFrameMaterial);
          desk.position.set(rightWingCenterX, 0.15 + 0.74, zFront - 0.65);
          desk.castShadow = true;

          // Laptop on desk
          const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.01, 0.20), materials.metalTrimMaterial);
          laptopBase.position.set(rightWingCenterX, 0.15 + 0.765, zFront - 0.65);
          const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.01), materials.applianceGlassMaterial);
          laptopScreen.position.set(rightWingCenterX, 0.15 + 0.85, zFront - 0.74);
          laptopScreen.rotation.x = -0.18;

          // Ergonomic Swivel Chair
          const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.44), materials.sofaBoucleMaterial);
          chairSeat.position.set(rightWingCenterX, 0.15 + 0.46, zFront - 1.10);
          const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.04), materials.sofaBoucleMaterial);
          chairBack.position.set(rightWingCenterX, 0.15 + 0.68, zFront - 1.30);
          const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.24, 0.42, 12), materials.metalTrimMaterial);
          chairBase.position.set(rightWingCenterX, 0.15 + 0.21, zFront - 1.10);

          interiorGroup.add(desk, laptopBase, laptopScreen, chairSeat, chairBack, chairBase);

          // Left Wing: Chef's Kitchen (Rear) + 4-Person Dining Nook (Front)
          buildKitchen(interiorGroup, undefined, undefined, 1.80, true);
          buildDining(interiorGroup, leftWingCenterX, 1.15, 4);

          // Wall-mounted TV Credenza on corridor partition
          const tvX = -coreWidth / 2 + 0.03;
          const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.72, 1.20), materials.applianceGlassMaterial);
          tvScreen.position.set(tvX, 0.15 + 1.30, 0.65);
          const credenza = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 1.30), materials.cabinetMaterial);
          credenza.position.set(tvX + 0.12, 0.15 + 0.42, 0.65);
          interiorGroup.add(tvScreen, credenza);
          break;
        }

        case '4-bed-quad-suite': {
          // =================================================================
          // PLAN 6: 4 BEDROOMS, 1 RESTROOM (QUAD-SUITE)
          // =================================================================
          // Left Wing: Divider Wall separating Bed 1 (Rear) from Bed 2 (Front)
          const leftWingWidth = Math.abs(leftWallX - (-coreWidth / 2));
          const leftDividerX = (-coreWidth / 2 + leftWallX) / 2;
          addWallSegment(partGroup, leftDividerX, height / 2 + 0.15, leftDividerZ, leftWingWidth, height, intWallT);

          // Left corridor wall with 2 private doors near divider wall (never overlapping beds)
          const lDoor1Z = leftDividerZ - 0.55;
          const lDoor2Z = leftDividerZ + 0.55;
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (zRear + lDoor1Z - 0.41) / 2, intWallT, height, (lDoor1Z - 0.41) - zRear);
          addDoorOpening(partGroup, -coreWidth / 2, lDoor1Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (lDoor1Z + 0.41 + leftDividerZ) / 2, intWallT, height, leftDividerZ - (lDoor1Z + 0.41));
          addDoorOpening(partGroup, -coreWidth / 2, lDoor2Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, -coreWidth / 2, height / 2 + 0.15, (lDoor2Z + 0.41 + zFront) / 2, intWallT, height, zFront - (lDoor2Z + 0.41));

          // Right Wing: Divider Wall separating Bed 3 (Rear) from Bed 4 (Front)
          const rightWingWidth = rightWallX - coreWidth / 2;
          const rightDividerX = coreWidth / 2 + rightWingWidth / 2;
          addWallSegment(partGroup, rightDividerX, height / 2 + 0.15, rightDividerZ, rightWingWidth, height, intWallT);

          // Right corridor wall with 2 private doors near divider wall (never overlapping beds)
          const rDoor1Z = rightDividerZ - 0.55;
          const rDoor2Z = rightDividerZ + 0.55;
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (zRear + rDoor1Z - 0.41) / 2, intWallT, height, (rDoor1Z - 0.41) - zRear);
          addDoorOpening(partGroup, coreWidth / 2, rDoor1Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rDoor1Z + 0.41 + rightDividerZ) / 2, intWallT, height, rightDividerZ - (rDoor1Z + 0.41));
          addDoorOpening(partGroup, coreWidth / 2, rDoor2Z, 0.82, 2.10, true, true);
          addWallSegment(partGroup, coreWidth / 2, height / 2 + 0.15, (rDoor2Z + 0.41 + zFront) / 2, intWallT, height, zFront - (rDoor2Z + 0.41));

          // Bed 1: Rear-Left Bedroom (headboard against rear wall)
          buildBedSuite(interiorGroup, {
            x: leftWingCenterX,
            z: zRear + 0.08 + 1.85 / 2,
            headZ: zRear + 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: leftWallX + 0.26,
            wardrobeZ: lDoor1Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Bed 2: Front-Left Bedroom (headboard against front wall)
          buildBedSuite(interiorGroup, {
            x: leftWingCenterX,
            z: zFront - 0.08 - 1.85 / 2,
            headZ: zFront - 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: -1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: leftWallX + 0.26,
            wardrobeZ: lDoor2Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Bed 3: Rear-Right Bedroom (headboard against rear wall)
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zRear + 0.08 + 1.85 / 2,
            headZ: zRear + 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: 1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rDoor1Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });

          // Bed 4: Front-Right Bedroom (headboard against front wall)
          buildBedSuite(interiorGroup, {
            x: rightWingCenterX,
            z: zFront - 0.08 - 1.85 / 2,
            headZ: zFront - 0.08,
            bedW: 1.25,
            bedL: 1.85,
            dirZ: -1,
            hasNightstands: true,
            hasWardrobe: Boolean(state.hasWardrobe),
            wardrobeX: rightWallX - 0.26,
            wardrobeZ: rDoor2Z,
            wardrobeW: 0.80,
            wardrobeD: 0.50,
            isWardrobeAlongZ: true,
          });
          break;
        }
      }

      interiorGroup.add(partGroup);

      // ---------------------------------------------------------------------
      // 7. HVAC MINI-SPLIT & SMART HOME AUTOMATION
      // ---------------------------------------------------------------------
      if (state.hasHvacMiniSplit) {
        // Indoor blower unit mounted above the bathroom entry in the central spine
        const indoorHvac = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.18), materials.cabinetMaterial);
        indoorHvac.position.set(0, 0.15 + 2.15, zRear + 1.45);
        interiorGroup.add(indoorHvac);

        // Outdoor heat-pump compressor unit mounted on rear chassis spine
        const outdoorComp = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.35), materials.q235SteelMaterial || materials.chassisMaterial);
        outdoorComp.position.set(0, 0.55, -houseDepth / 2 - 0.22);
        outdoorComp.castShadow = true;
        rootGroup.add(outdoorComp);
      }

      // Smart digital home automation pad by entrance door
      const smartPad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.02), materials.capsuleGlowMaterial || materials.ledStripMaterial);
      smartPad.position.set(coreWidth / 2 - 0.15, 0.15 + 1.25, zFront - 0.20);
      interiorGroup.add(smartPad);

      // ---------------------------------------------------------------------
      // 8. ARCHITECTURAL RECESSED LED DOWNLIGHTS
      // ---------------------------------------------------------------------
      const downlightCoords = [
        // Central Great Room downlights
        { x: 0, z: 1.5 },
        { x: 0, z: -0.4 },
        { x: 0, z: 0.5 },
        // Kitchenette downlights
        { x: leftWingCenterX, z: 1.2 },
        // Bedroom 2 downlight
        { x: leftWingCenterX, z: -houseDepth / 4 },
        // Master Bedroom downlights
        { x: rightWingCenterX, z: -houseDepth / 4 },
        { x: rightWingCenterX, z: 0.8 },
      ];

      downlightCoords.forEach((pt, idx) => {
        const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), materials.downlightMaterial);
        fixture.position.set(pt.x, height + 0.14, pt.z);
        interiorGroup.add(fixture);

        // Populate interior point lights for illumination modes
        if (idx < 5) {
          const ptLight = new THREE.PointLight(
            state.lightingPackage === 'halo-strip-ambient' ? 0xffaa44 : 0xfff4e6,
            isNight ? 7.5 : isGolden ? 5.0 : 2.5,
            5.5,
            1.5
          );
          ptLight.position.set(pt.x, height - 0.15, pt.z);
          interiorLights.push(ptLight);
          interiorGroup.add(ptLight);
        }
      });

    } else {
      let bathPodW = 1.45;
      let bathPodD = Math.min(1.8, isExpandable ? houseDepth * 0.35 : effectiveDepth * 0.5);
      let bathX = -length / 2 + bathPodW / 2 + 0.15;
      let bathZ = -effectiveDepth / 2 + bathPodD / 2 + 0.15;

      if (modelSeries === 'space-capsule') {
        bathX = -length / 2 + 1.25;
        bathZ = -effectiveDepth / 2 + bathPodD / 2 + 0.2;
      } else if (isAppleCabin) {
        // In Apple Cabin (depth 2.2m or 3.5m for AC02):
        // Push bathroom pod strictly against solid rear wall (-Z) and solid side wall (-X)
        // Constrain pod depth so front wall maintains absolute physical clearance (>0.94m aisle)
        // from front panoramic double glass curtain wall.
        const podD = depth > 3.0 ? 1.40 : 1.10;
        bathPodW = 1.40;
        bathPodD = podD;
        bathX = -length / 2 + wallThickness + bathPodW / 2 + 0.12;
        bathZ = -depth / 2 + wallThickness + bathPodD / 2;
      }

      // A. Integrated Luxury Bathroom Pod
      if (state.hasLuxuryBathPod) {
        const bathPodGroup = new THREE.Group();

        const bathWallMat = materials.bambooCharcoalWallMaterial || materials.interiorWallMaterial;
        const bathWallT = isAppleCabin ? 0.05 : 0.08;

        const partWallSide = new THREE.Mesh(
          new THREE.BoxGeometry(bathWallT, height - 0.1, bathPodD),
          bathWallMat
        );
        partWallSide.position.set(bathX + bathPodW / 2, (height - 0.1) / 2 + 0.15, bathZ);
        partWallSide.castShadow = true;
        bathPodGroup.add(partWallSide);

        const doorGap = 0.74;
        const frontWallW = bathPodW - doorGap;
        const partWallFront = new THREE.Mesh(
          new THREE.BoxGeometry(frontWallW, height - 0.1, bathWallT),
          bathWallMat
        );
        partWallFront.position.set(bathX - doorGap / 2, (height - 0.1) / 2 + 0.15, bathZ + bathPodD / 2);
        bathPodGroup.add(partWallFront);

        // Access Door with Frame, Lever Handle and Privacy Latch
        const doorLeafW = doorGap - 0.02;
        const doorLeafH = height - 0.22;
        const doorLeaf = new THREE.Mesh(
          new THREE.BoxGeometry(doorLeafW, doorLeafH, 0.035),
          materials.woodDeckMaterial || materials.cabinetMaterial
        );
        doorLeaf.position.set(bathX + frontWallW / 2 + 0.06, 0.15 + doorLeafH / 2, bathZ + bathPodD / 2 - 0.06);
        doorLeaf.rotation.y = -0.32; // Swung slightly open into bathroom

        const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.02, 0.04), materials.brassHandleMaterial || materials.metalTrimMaterial);
        doorHandle.position.set(bathX + frontWallW / 2 + doorLeafW * 0.4, 0.15 + 1.02, bathZ + bathPodD / 2);

        bathPodGroup.add(doorLeaf, doorHandle);

        // Shower Enclosure
        const showerTray = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.8), materials.chassisMaterial);
        showerTray.position.set(bathX - bathPodW / 2 + 0.45, 0.175, bathZ - bathPodD / 2 + 0.45);
        bathPodGroup.add(showerTray);

        const showerGlass = new THREE.Mesh(new THREE.BoxGeometry(0.8, height - 0.4, 0.018), materials.glassMaterial);
        showerGlass.position.set(bathX - bathPodW / 2 + 0.45, height / 2 + 0.1, bathZ - bathPodD / 2 + 0.85);
        bathPodGroup.add(showerGlass);

        const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), materials.metalTrimMaterial);
        showerHead.position.set(bathX - bathPodW / 2 + 0.45, height - 0.25, bathZ - bathPodD / 2 + 0.45);
        const showerArm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.35), materials.metalTrimMaterial);
        showerArm.position.set(bathX - bathPodW / 2 + 0.45, height - 0.20, bathZ - bathPodD / 2 + 0.30);
        bathPodGroup.add(showerHead, showerArm);

        // Upgraded Porcelain Toilet (WC)
        const tBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.40, 0.52), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tBase.position.set(bathX + 0.25, 0.15 + 0.20, bathZ - bathPodD / 2 + 0.32);
        const tSeat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.46), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tSeat.position.set(bathX + 0.25, 0.15 + 0.415, bathZ - bathPodD / 2 + 0.34);
        const tTank = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.18), materials.ceramicVesselMaterial || materials.countertopMaterial);
        tTank.position.set(bathX + 0.25, 0.15 + 0.59, bathZ - bathPodD / 2 + 0.10);
        const flushPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.015), materials.metalTrimMaterial);
        flushPlate.position.set(bathX + 0.25, 0.15 + 1.15, bathZ - bathPodD / 2 + 0.01);
        bathPodGroup.add(tBase, tSeat, tTank, flushPlate);

        // Upgraded Floating Vanity with Vessel Basin, Faucet & Backlit Mirror
        const vanity = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.44, 0.42),
          materials.cabinetWoodNicheMaterial || materials.sofaWoodFrameMaterial
        );
        vanity.position.set(bathX + 0.25, 0.15 + 0.55, bathZ + 0.35);
        vanity.castShadow = true;

        const vTop = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.03, 0.44), materials.countertopMaterial);
        vTop.position.set(bathX + 0.25, 0.15 + 0.785, bathZ + 0.35);

        const basin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.32), materials.ceramicVesselMaterial || materials.countertopMaterial);
        basin.position.set(bathX + 0.25, 0.15 + 0.86, bathZ + 0.35);

        const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 12), materials.brassHandleMaterial || materials.metalTrimMaterial);
        faucet.position.set(bathX + 0.42, 0.15 + 0.89, bathZ + 0.35);
        const spout = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.015, 0.015), materials.brassHandleMaterial || materials.metalTrimMaterial);
        spout.position.set(bathX + 0.36, 0.15 + 0.96, bathZ + 0.35);

        const mirrorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.78, 0.015), materials.ledStripMaterial);
        mirrorGlow.position.set(bathX + 0.25, 0.15 + 1.45, bathZ + 0.35);
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.74, 0.02), materials.glassMaterial);
        mirror.position.set(bathX + 0.25, 0.15 + 1.45, bathZ + 0.35 - 0.01);

        bathPodGroup.add(vanity, vTop, basin, faucet, spout, mirrorGlow, mirror);

        interiorGroup.add(bathPodGroup);
      }

      // B. Gourmet Kitchenette Module
      if (state.hasKitchenetteModule) {
        const kitchenGroup = new THREE.Group();
        const kitchenLength = Math.min(2.8, Math.max(1.8, length * 0.28));
        const kDepth = 0.54;
        const kHeight = 0.88;

        const rearWallZ = isAppleCabin ? -depth / 2 : -effectiveDepth / 2;
        const kitchenRearZ = rearWallZ + wallThickness + 0.05;
        const kitchenZ = kitchenRearZ + kDepth / 2;

        let kitchenX = Math.min(length / 2 - kitchenLength / 2 - 1.2, (state.hasLuxuryBathPod ? bathX + bathPodW / 2 + 0.25 : -length / 2 + 0.8) + kitchenLength / 2);
        if (isAppleCabin) {
          kitchenX = state.hasLuxuryBathPod
            ? bathX + bathPodW / 2 + 0.25 + kitchenLength / 2
            : -length / 2 + wallThickness + kitchenLength / 2 + 0.2;
        }

        const lowerCab = new THREE.Mesh(new THREE.BoxGeometry(kitchenLength, kHeight, kDepth), materials.cabinetMaterial);
        lowerCab.position.set(kitchenX, 0.15 + kHeight / 2, kitchenZ);
        lowerCab.castShadow = true;
        kitchenGroup.add(lowerCab);

        const counter = new THREE.Mesh(new THREE.BoxGeometry(kitchenLength + 0.04, 0.04, kDepth + 0.03), materials.countertopMaterial);
        counter.position.set(kitchenX, 0.15 + kHeight + 0.02, kitchenZ + 0.01);
        counter.castShadow = true;
        kitchenGroup.add(counter);

        const sinkX = kitchenX - kitchenLength / 4;
        const sinkMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.36), materials.chassisMaterial);
        sinkMesh.position.set(sinkX, 0.15 + kHeight - 0.04, kitchenZ);
        kitchenGroup.add(sinkMesh);

        const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), materials.metalTrimMaterial);
        faucet.position.set(sinkX, 0.15 + kHeight + 0.14, kitchenZ - 0.12);
        kitchenGroup.add(faucet);

        const cookX = kitchenX + kitchenLength / 4;
        const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.01, 0.38), materials.chassisMaterial);
        cooktop.position.set(cookX, 0.15 + kHeight + 0.025, kitchenZ);
        kitchenGroup.add(cooktop);

        const upperH = 0.62;
        const upperD = 0.32;
        const upperCab = new THREE.Mesh(new THREE.BoxGeometry(kitchenLength, upperH, upperD), materials.cabinetMaterial);
        upperCab.position.set(
          kitchenX,
          0.15 + kHeight + 0.65 + upperH / 2,
          kitchenRearZ + upperD / 2
        );
        upperCab.castShadow = true;
        kitchenGroup.add(upperCab);

        const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(kitchenLength - 0.1, 0.015, 0.02), materials.ledStripMaterial);
        ledStrip.position.set(
          kitchenX,
          0.15 + kHeight + 0.64,
          kitchenRearZ + upperD - 0.02
        );
        kitchenGroup.add(ledStrip);

        interiorGroup.add(kitchenGroup);
      }

      // C. Luxury Bedroom Suite
      if (state.hasLuxuryBedSuite) {
        const bedGroup = new THREE.Group();
        const bedW = length > 8 ? 1.65 : 1.45;
        const bedL = 2.0;

        let bedX = length / 2 - bedL / 2 - 0.45;
        let bedZ = -effectiveDepth / 2 + bedW / 2 + 0.25;
        let bedY = 0.15;
        let bedRotationY = 0;

        if (modelSeries === 'space-capsule') {
          // Space Capsule: positioned inside the 270° panoramic observation cockpit
          bedX = length / 2 - 1.45;
          bedZ = 0;
          bedRotationY = Math.PI / 2;
        } else if (isDuplex) {
          // AD Duplex: master bedroom suite is elevated on the upper cantilever level
          bedX = 1.0;
          bedZ = -depth / 2 + bedW / 2 + 0.22;
          bedY = 2.48 + 0.18; // Upper floor elevation
          bedRotationY = 0;
        } else if (isAC02) {
          bedX = length / 2 - 1.85;
          bedZ = 0;
          bedRotationY = Math.PI / 2;
        } else if (isAppleCabin) {
          // AC01, AC03, AC04: pushed against solid rear wall on opposite end (+X)
          bedX = length / 2 - bedL / 2 - 0.35;
          bedZ = -depth / 2 + bedW / 2 + 0.20;
          bedRotationY = 0;
        }

        const frame = new THREE.Mesh(new THREE.BoxGeometry(bedL, 0.22, bedW), materials.sofaWoodFrameMaterial || materials.chassisMaterial);
        frame.position.set(bedX, bedY + 0.11, bedZ);
        frame.rotation.y = bedRotationY;
        frame.castShadow = true;
        bedGroup.add(frame);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(bedL - 0.06, 0.24, bedW - 0.06), materials.bedLinenMaterial);
        mattress.position.set(bedX, bedY + 0.22 + 0.12, bedZ);
        mattress.rotation.y = bedRotationY;
        bedGroup.add(mattress);

        const duvet = new THREE.Mesh(new THREE.BoxGeometry((bedL - 0.06) * 0.72, 0.14, bedW - 0.04), materials.bedDuvetMaterial);
        duvet.position.set(bedX + (bedRotationY === 0 ? 0.25 : 0), bedY + 0.35 + 0.07, bedZ + (bedRotationY === Math.PI / 2 ? 0.25 : 0));
        duvet.rotation.y = bedRotationY;
        bedGroup.add(duvet);

        [-bedW * 0.25, bedW * 0.25].forEach((pz) => {
          const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.52), materials.bedLinenMaterial);
          pillow.position.set(bedX - (bedRotationY === 0 ? bedL / 2 - 0.3 : 0), bedY + 0.46 + 0.06, bedZ + (bedRotationY === 0 ? pz : 0));
          pillow.rotation.y = bedRotationY;
          bedGroup.add(pillow);
        });

        [-bedW / 2 - 0.28, bedW / 2 + 0.28].forEach((nz) => {
          const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), materials.nightstandWoodMaterial || materials.cabinetMaterial);
          stand.position.set(bedX - (bedRotationY === 0 ? bedL / 2 - 0.25 : 0), bedY + 0.14, bedZ + (bedRotationY === 0 ? nz : 0));
          bedGroup.add(stand);

          const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.18, 12), materials.lampGlowMaterial || materials.ledStripMaterial);
          lamp.position.set(bedX - (bedRotationY === 0 ? bedL / 2 - 0.25 : 0), bedY + 0.37, bedZ + (bedRotationY === 0 ? nz : 0));
          bedGroup.add(lamp);
        });

        interiorGroup.add(bedGroup);
      }

      // D. Designer Living Room Lounge
      const hasSpaceForLounge = length > 6.2 || modelSeries === 'space-capsule';
      if (hasSpaceForLounge) {
        const loungeGroup = new THREE.Group();
        let sofaX = 0;
        let sofaZ = 0.2;
        let sofaW = Math.min(2.2, Math.max(1.6, length * 0.28));

        if (state.modelId === 'one-bedroom') {
          sofaX = -0.85;
          sofaZ = 0.15;
        } else if (state.modelId === 'two-bedroom') {
          sofaX = 0;
          sofaZ = 0.2;
        } else if (modelSeries === 'space-capsule') {
          sofaX = 0;
          sofaZ = 0.1;
        }

        const sofaD = 0.82;
        const armW = 0.15;
        const usableW = sofaW - armW * 2;
        const legH = 0.07;
        const plinthH = 0.04;

        // Plinth & Legs
        const plinth = new THREE.Mesh(
          new THREE.BoxGeometry(sofaW - 0.06, plinthH, sofaD - 0.06),
          materials.sofaWoodFrameMaterial || materials.cabinetMaterial
        );
        plinth.position.set(sofaX, 0.15 + legH + plinthH / 2, sofaZ);
        loungeGroup.add(plinth);

        [-sofaW / 2 + 0.10, sofaW / 2 - 0.10].forEach((lx) => {
          [-sofaD / 2 + 0.08, sofaD / 2 - 0.08].forEach((lz) => {
            const leg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.015, 0.010, legH, 10),
              materials.brassHandleMaterial || materials.metalTrimMaterial
            );
            leg.position.set(sofaX + lx, 0.15 + legH / 2, sofaZ + lz);
            loungeGroup.add(leg);
          });
        });

        // Upholstered Base
        const baseH = 0.20;
        const sofaBase = new THREE.Mesh(
          new THREE.BoxGeometry(sofaW, baseH, sofaD),
          materials.sofaBoucleMaterial || materials.furnitureFabricMaterial
        );
        sofaBase.position.set(sofaX, 0.15 + legH + plinthH + baseH / 2, sofaZ);
        sofaBase.castShadow = true;
        loungeGroup.add(sofaBase);

        // Segmented Dual Cushions
        const cushionW = (usableW - 0.02) / 2;
        [-usableW / 4 - 0.01, usableW / 4 + 0.01].forEach((cx) => {
          const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(cushionW, 0.13, sofaD - 0.16),
            materials.sofaBoucleMaterial || materials.furnitureFabricMaterial
          );
          cushion.position.set(sofaX + cx, 0.15 + legH + plinthH + baseH + 0.065, sofaZ + 0.06);
          cushion.castShadow = true;
          loungeGroup.add(cushion);
        });

        // Backrest Frame & Cushions
        const backFrameH = 0.42;
        const sofaBack = new THREE.Mesh(
          new THREE.BoxGeometry(sofaW, backFrameH, 0.16),
          materials.sofaBoucleMaterial || materials.furnitureFabricMaterial
        );
        sofaBack.position.set(sofaX, 0.15 + legH + plinthH + baseH + backFrameH / 2, sofaZ - sofaD / 2 + 0.08);
        sofaBack.castShadow = true;
        loungeGroup.add(sofaBack);

        // Sculpted Armrests
        [-sofaW / 2 + armW / 2, sofaW / 2 - armW / 2].forEach((ax) => {
          const arm = new THREE.Mesh(
            new THREE.BoxGeometry(armW, 0.26, sofaD),
            materials.sofaBoucleMaterial || materials.furnitureFabricMaterial
          );
          arm.position.set(sofaX + ax, 0.15 + legH + plinthH + baseH + 0.13, sofaZ);
          loungeGroup.add(arm);
        });

        // Accent Pillows
        [-usableW * 0.32, usableW * 0.32].forEach((px, idx) => {
          const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.28, 0.10),
            idx === 0 ? materials.sofaCushionAccent1 : materials.sofaCushionAccent2
          );
          pillow.position.set(sofaX + px, 0.15 + legH + plinthH + baseH + 0.20, sofaZ - sofaD / 2 + 0.18);
          pillow.rotation.y = idx === 0 ? -0.22 : 0.22;
          pillow.rotation.x = -0.15;
          loungeGroup.add(pillow);
        });

        // Coffee Table
        const tableW = Math.min(1.0, sofaW * 0.58);
        const tableD = 0.45;
        const maxTableZ = effectiveDepth / 2 - wallThickness - tableD / 2 - 0.15;
        const tableZ = Math.min(maxTableZ, sofaZ + sofaD / 2 + 0.35 + tableD / 2);

        // Area Rug with true 3D pile depth
        const rugD = Math.min(1.6, effectiveDepth - 0.6);
        const rugThickness = 0.012;
        const rugBaseY = 0.153;
        const rugTopY = rugBaseY + rugThickness;
        const rug = new THREE.Mesh(
          new THREE.BoxGeometry(sofaW + 0.4, rugThickness, rugD),
          materials.rugMaterial || materials.furnitureFabricMaterial
        );
        rug.position.set(sofaX, rugBaseY + rugThickness / 2, (sofaZ + tableZ) / 2);
        rug.receiveShadow = true;
        rug.castShadow = true;
        loungeGroup.add(rug);

        const table = new THREE.Mesh(new THREE.BoxGeometry(tableW, 0.30, tableD), materials.travertineTableMaterial || materials.cabinetMaterial);
        table.position.set(sofaX, rugTopY + 0.15, tableZ);
        table.castShadow = true;
        loungeGroup.add(table);

        // Wall-Mounted TV on Front Wall
        const tvWallZ = effectiveDepth / 2 - wallThickness;
        const tvY = 0.15 + 1.25;
        const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.35, sofaW * 0.85), 0.76, 0.025), materials.chassisMaterial);
        tvScreen.position.set(sofaX, tvY, tvWallZ - 0.02);
        const tvGlass = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.32, sofaW * 0.85 - 0.03), 0.73, 0.005), materials.applianceGlassMaterial);
        tvGlass.position.set(sofaX, tvY, tvWallZ - 0.035);
        const tvGlow = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.36, sofaW * 0.85 + 0.04), 0.78, 0.008), materials.ledStripMaterial);
        tvGlow.position.set(sofaX, tvY, tvWallZ - 0.005);

        // Floating media shelf under TV
        const mediaShelf = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.45, sofaW * 0.9), 0.18, 0.22), materials.cabinetMaterial);
        mediaShelf.position.set(sofaX, 0.15 + 0.50, tvWallZ - 0.11);
        loungeGroup.add(tvScreen, tvGlass, tvGlow, mediaShelf);

        interiorGroup.add(loungeGroup);
      }

      // E. HVAC Mini-Split (Indoor & Outdoor)
      if (state.hasHvacMiniSplit) {
        const hvacX = length * 0.25;
        const indoorHvac = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.18), materials.cabinetMaterial);
        indoorHvac.position.set(
          hvacX,
          height - 0.22,
          -effectiveDepth / 2 + 0.1 + wallThickness
        );
        interiorGroup.add(indoorHvac);

        const outdoorComp = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.35), materials.q235SteelMaterial || materials.chassisMaterial);
        outdoorComp.position.set(
          hvacX,
          0.55,
          -effectiveDepth / 2 - 0.22
        );
        outdoorComp.castShadow = true;
        rootGroup.add(outdoorComp);
      }

      // F. Smart Control Panel
      const smartPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.28, 0.02),
        materials.capsuleGlowMaterial || materials.ledStripMaterial
      );
      smartPanel.position.set(bathX + bathPodW / 2 + 0.05, 1.35, bathZ + bathPodD / 2);
      interiorGroup.add(smartPanel);

      // G. Interior Point Lights
      const lightCount = length > 9 ? 6 : length > 6 ? 4 : 2;
      const lightSpacing = (length - 1.8) / (lightCount + 1);

      for (let i = 1; i <= lightCount; i++) {
        const spotPos = -length / 2 + 0.9 + i * lightSpacing;
        const spotX = spotPos;
        const spotZ = 0;
        const spotFixture = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), materials.downlightMaterial);
        spotFixture.position.set(spotX, height + 0.14, spotZ);
        interiorGroup.add(spotFixture);

        const ptLight = new THREE.PointLight(
          state.lightingPackage === 'halo-strip-ambient' ? 0xffaa44 : 0xfff4e6,
          isNight ? 10.0 : isGolden ? 6.5 : 3.5,
          6.0,
          1.5
        );
        ptLight.position.set(spotX, height - 0.12, spotZ);
        interiorLights.push(ptLight);
        interiorGroup.add(ptLight);
      }
    }
  }

  rootGroup.add(interiorGroup);

  // =========================================================================
  // 5. EXTERIOR PERGOLA & PATIO DECK
  // =========================================================================
  if (state.hasExteriorPergolaDeck && !isFoldedMode) {
    const deckDepth = 2.8;
    const deckWidth = isExpandable ? expandableWidth + 0.6 : length + 0.6;
    const deckCenterZ = (isExpandable ? houseDepth : effectiveDepth) / 2 + deckDepth / 2;
    const deckBaseY = 0.12;

    const deckFloor = new THREE.Mesh(
      new THREE.BoxGeometry(deckWidth, deckBaseY, deckDepth),
      materials.woodDeckMaterial
    );
    deckFloor.position.set(0, deckBaseY / 2, deckCenterZ);
    deckFloor.receiveShadow = true;
    pergolaGroup.add(deckFloor);

    const postGeo = new THREE.BoxGeometry(0.12, height + 0.2, 0.12);
    [
      [-deckWidth / 2 + 0.15, deckCenterZ - deckDepth / 2 + 0.15],
      [deckWidth / 2 - 0.15, deckCenterZ - deckDepth / 2 + 0.15],
      [-deckWidth / 2 + 0.15, deckCenterZ + deckDepth / 2 - 0.15],
      [deckWidth / 2 - 0.15, deckCenterZ + deckDepth / 2 - 0.15],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(postGeo, materials.q235SteelMaterial || materials.chassisMaterial);
      col.position.set(px, (height + 0.2) / 2, pz);
      col.castShadow = true;
      pergolaGroup.add(col);
    });

    const ringY = height + 0.2 + 0.06;
    const ringBeamFront = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 0.12, 0.12), materials.chassisMaterial);
    ringBeamFront.position.set(0, ringY, deckCenterZ + deckDepth / 2 - 0.15);
    pergolaGroup.add(ringBeamFront);

    const numLouvers = Math.round(deckWidth / 0.35);
    for (let l = 0; l < numLouvers; l++) {
      const lx = -deckWidth / 2 + 0.3 + l * 0.35;
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, deckDepth - 0.3), materials.chassisMaterial);
      louver.position.set(lx, ringY + 0.04, deckCenterZ);
      louver.rotation.z = Math.PI / 4;
      pergolaGroup.add(louver);
    }

    const pRail = new THREE.Mesh(new THREE.BoxGeometry(deckWidth - 0.6, 0.95, 0.016), materials.glassMaterial);
    pRail.position.set(0, deckBaseY + 0.48, deckCenterZ + deckDepth / 2 - 0.08);
    pergolaGroup.add(pRail);

    rootGroup.add(pergolaGroup);
  }

  // =========================================================================
  // 6. BIO-DIGESTER / SEPTIC SYSTEM
  // =========================================================================
  if (state.hasBioDigester) {
    const bioGroup = new THREE.Group();
    const bioX = -(isExpandable ? expandableWidth : length) / 2 + 1.2;
    const bioZ = -(isExpandable ? houseDepth : effectiveDepth) / 2 - 1.2;

    const tankHatch = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16), materials.chassisMaterial);
    tankHatch.position.set(bioX, 0.06, bioZ);
    bioGroup.add(tankHatch);

    const ventPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 12), materials.chassisMaterial);
    ventPipe.position.set(bioX - 0.4, 0.9, bioZ);
    bioGroup.add(ventPipe);

    rootGroup.add(bioGroup);
  }

  // =========================================================================
  // 7. PRECISE 3D HOTSPOT COORDINATES
  // =========================================================================
  const hotspotPositions = {
    walls: new THREE.Vector3(isExpandable ? -expandableWidth / 2 : -length / 2, height * 0.6, 0),
    glazing: new THREE.Vector3(0, 1.26, isExpandable ? houseDepth / 2 + 0.1 : effectiveDepth / 2 + 0.1),
    lighting: new THREE.Vector3(0, height + 0.1, 0),
    flooring: new THREE.Vector3(0, 0.2, 0.4),
    roof: new THREE.Vector3(0, height + roofThickness + 0.3, 0),
    kitchenette: new THREE.Vector3(
      isExpandable ? -expandableWidth / 2 + 0.65 : 0,
      1.1,
      isExpandable ? 1.15 : -effectiveDepth / 2 + 0.65
    ),
    bath: new THREE.Vector3(
      isExpandable ? 0 : -length / 2 + 1.2,
      1.3,
      isExpandable ? -houseDepth / 2 + 0.95 : -effectiveDepth / 2 + 1.0
    ),
    bedroom: new THREE.Vector3(
      isDuplex ? 1.0 : (isExpandable ? (coreWidth / 2 + wingWidth / 2) : (modelSeries === 'space-capsule' ? length / 2 - 1.2 : length / 2 - 1.4)),
      isDuplex ? 3.2 : 1.1,
      isDuplex ? 0 : (isExpandable ? -houseDepth / 2 + 1.1 : (modelSeries === 'space-capsule' ? 0 : (depth > 4 ? 0.4 : -effectiveDepth / 4)))
    ),
    living: new THREE.Vector3(isExpandable ? -0.10 : 0, 0.8, isExpandable ? 1.45 : 0.45),
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
