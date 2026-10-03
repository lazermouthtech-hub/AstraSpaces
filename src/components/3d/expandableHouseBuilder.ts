import * as THREE from 'three';
import { CustomizationState } from '../../types';
import { MaterialLibrary } from './materials';

export interface ExpandableInteriorParams {
  expandableWidth: number;
  coreWidth: number;
  wingWidth: number;
  houseDepth: number;
  height: number;
  wallT: number;
  effectiveBedrooms: number;
  state: CustomizationState;
  materials: MaterialLibrary;
  interiorGroup: THREE.Group;
  interiorLights: THREE.PointLight[];
  doorTopY: number;
  isFoldedMode: boolean;
}

/**
 * Builds the complete catalog-compliant procedural interior for the Wanhai Double-Wing Expandable House series.
 * Strictly adheres to specifications:
 * 1. Restroom pod and primary plumbing strictly within the rigid 2.2m central core (X in [-1.1, +1.1])
 *    leaving clearance to folding hinges.
 * 2. Side wings (6.4m total deployed width) dedicated to living lounge and private bedroom suites.
 * 3. Supports 1-bedroom, 2-bedroom, 3-bedroom, and 4-bedroom layouts (each with 1 restroom and 1 living room).
 * 4. L-shaped kitchen cabinet in central living space with absolute clearance from entrance corridor.
 * 5. Sofa and television in living room zone without obstructing internal partition doors.
 * 6. Restroom enclosed in 75mm partition walls with toilet, bathroom vanity, mirror, shower, and door.
 * 7. Each bedroom includes a bed, wardrobe, 75mm partition walls, and dedicated internal bedroom door.
 * 8. Hard clearance: zero clipping through exterior 75mm walls, zero intersection with fold-lines (X = ±1.1m).
 */
export function buildExpandableInterior(params: ExpandableInteriorParams): void {
  const {
    expandableWidth,
    coreWidth,
    wingWidth,
    houseDepth,
    height,
    wallT,
    effectiveBedrooms,
    state,
    materials,
    interiorGroup,
    interiorLights,
    isFoldedMode,
  } = params;

  if (isFoldedMode) return;

  const floorY = 0.15;
  const innerWallXMin = -expandableWidth / 2 + wallT; // -3.125m
  const innerWallXMax = expandableWidth / 2 - wallT;  // +3.125m
  const innerWallZRear = -houseDepth / 2 + wallT;
  const innerWallZFront = houseDepth / 2 - wallT;

  const partWallT = 0.075; // 75mm partition walls
  const wallH = height - 0.08;

  // Hinge fold-line limits (Chassis fold lines at X = ±1.10m)
  // Internal core fittings must remain inside [-1.02, +1.02]
  // Wing fittings must remain in [-3.12, -1.18] or [+1.18, +3.12]
  const coreInnerXMin = -coreWidth / 2 + 0.08; // -1.02m
  const coreInnerXMax = coreWidth / 2 - 0.08;  // +1.02m
  const leftWingInnerXMax = -coreWidth / 2 - 0.08; // -1.18m
  const rightWingInnerXMin = coreWidth / 2 + 0.08;  // +1.18m

  const wallMat = materials.bambooCharcoalWallMaterial || materials.interiorWallMaterial;
  const frameMat = materials.q235SteelMaterial || materials.chassisMaterial;
  const doorWoodMat = materials.woodDeckMaterial || materials.cabinetMaterial;
  const handleMat = materials.metalTrimMaterial;

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------
  const createPartitionWall = (w: number, d: number, x: number, z: number, h = wallH) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.set(x, floorY + h / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    interiorGroup.add(wall);
    return wall;
  };

  const createInteriorDoor = (x: number, z: number, rotationY = 0) => {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(x, floorY, z);
    doorGroup.rotation.y = rotationY;

    const doorW = 0.75;
    const doorH = 2.05;

    // Door Frame
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + 0.04, doorH + 0.03, partWallT + 0.015),
      frameMat
    );
    frameMesh.position.set(0, doorH / 2, 0);
    doorGroup.add(frameMesh);

    // Door Leaf
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.035),
      doorWoodMat
    );
    leaf.position.set(0, doorH / 2, 0);
    leaf.castShadow = true;
    doorGroup.add(leaf);

    // Handle Rosette & Lever
    [-0.025, 0.025].forEach((offsetZ) => {
      const handleBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.01, 16),
        handleMat
      );
      handleBase.rotation.x = Math.PI / 2;
      handleBase.position.set(doorW / 2 - 0.10, 1.0, offsetZ);
      doorGroup.add(handleBase);

      const handleLever = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.018, 0.012),
        handleMat
      );
      handleLever.position.set(doorW / 2 - 0.15, 1.0, offsetZ + (offsetZ > 0 ? 0.015 : -0.015));
      doorGroup.add(handleLever);
    });

    interiorGroup.add(doorGroup);
  };

  const createBed = (centerX: number, centerZ: number, rotY = 0, isLarge = false) => {
    const bedGroup = new THREE.Group();
    bedGroup.position.set(centerX, floorY, centerZ);
    bedGroup.rotation.y = rotY;

    const bedL = 2.0;
    const bedW = isLarge ? 1.60 : 1.45;

    // Bed Platform Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(bedW, 0.22, bedL),
      materials.sofaWoodFrameMaterial || materials.chassisMaterial
    );
    frame.position.set(0, 0.11, 0);
    frame.castShadow = true;
    bedGroup.add(frame);

    // Luxury Mattress
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(bedW - 0.06, 0.22, bedL - 0.06),
      materials.bedLinenMaterial
    );
    mattress.position.set(0, 0.22 + 0.11, 0);
    bedGroup.add(mattress);

    // Duvet / Quilt
    const duvet = new THREE.Mesh(
      new THREE.BoxGeometry(bedW - 0.04, 0.12, (bedL - 0.06) * 0.72),
      materials.bedDuvetMaterial
    );
    duvet.position.set(0, 0.44 + 0.06, (bedL * 0.14));
    bedGroup.add(duvet);

    // Pillows
    [-bedW * 0.25, bedW * 0.25].forEach((px) => {
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.50, 0.12, 0.36),
        materials.bedLinenMaterial
      );
      pillow.position.set(px, 0.48, -bedL / 2 + 0.28);
      bedGroup.add(pillow);
    });

    // Nightstand with Table Lamp
    const nightstandX = -bedW / 2 - 0.26;
    const nightstandZ = -bedL / 2 + 0.30;
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.40, 0.42, 0.40),
      materials.nightstandWoodMaterial || materials.cabinetMaterial
    );
    stand.position.set(nightstandX, 0.21, nightstandZ);
    stand.castShadow = true;
    bedGroup.add(stand);

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.02, 12),
      handleMat
    );
    lampBase.position.set(nightstandX, 0.43, nightstandZ);
    bedGroup.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.12, 0.18, 16),
      materials.lampGlowMaterial || materials.ledStripMaterial
    );
    lampShade.position.set(nightstandX, 0.54, nightstandZ);
    bedGroup.add(lampShade);

    interiorGroup.add(bedGroup);
  };

  const createWardrobe = (centerX: number, centerZ: number, rotY = 0, width = 0.90) => {
    const wardGroup = new THREE.Group();
    wardGroup.position.set(centerX, floorY, centerZ);
    wardGroup.rotation.y = rotY;

    const wardD = 0.50;
    const wardH = 2.15;

    // Wardrobe Main Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, wardH, wardD),
      materials.cabinetMaterial || materials.interiorWallMaterial
    );
    body.position.set(0, wardH / 2, 0);
    body.castShadow = true;
    wardGroup.add(body);

    // Wardrobe Doors
    [-width * 0.24, width * 0.24].forEach((dx) => {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.48, wardH - 0.06, 0.015),
        materials.cabinetMaterial || materials.interiorWallMaterial
      );
      door.position.set(dx, wardH / 2, wardD / 2 + 0.008);
      wardGroup.add(door);

      // Handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.55, 8),
        handleMat
      );
      handle.position.set(dx + (dx > 0 ? -0.10 : 0.10), wardH * 0.52, wardD / 2 + 0.025);
      wardGroup.add(handle);
    });

    interiorGroup.add(wardGroup);
  };

  // ---------------------------------------------------------------------------
  // 1. INTEGRATED RESTROOM POD (Rigid 2.2m central transport core)
  // Completely inside X in [-1.02, +1.02] - ZERO interference with floor hinges!
  // ---------------------------------------------------------------------------
  const bathPodW = 1.80; // 1.80m width
  const bathPodD = 1.55; // 1.55m depth
  const bathPodZCenter = innerWallZRear + bathPodD / 2; // Positioned firmly at rear of core
  const bathPodXCenter = 0;

  // Enclosing 75mm partition walls
  // Left wall of restroom
  createPartitionWall(partWallT, bathPodD, bathPodXCenter - bathPodW / 2, bathPodZCenter);
  // Right wall of restroom
  createPartitionWall(partWallT, bathPodD, bathPodXCenter + bathPodW / 2, bathPodZCenter);

  // Front wall of restroom with door opening (750mm opening)
  const bathDoorW = 0.75;
  const frontWallSegW = (bathPodW - bathDoorW) / 2;
  // Left segment
  createPartitionWall(
    frontWallSegW,
    partWallT,
    bathPodXCenter - bathPodW / 2 + frontWallSegW / 2,
    bathPodZCenter + bathPodD / 2
  );
  // Right segment
  createPartitionWall(
    frontWallSegW,
    partWallT,
    bathPodXCenter + bathPodW / 2 - frontWallSegW / 2,
    bathPodZCenter + bathPodD / 2
  );
  // Door lintel above bathroom door
  const bathLintelH = wallH - 2.05;
  if (bathLintelH > 0.05) {
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(bathDoorW, bathLintelH, partWallT),
      wallMat
    );
    lintel.position.set(bathPodXCenter, floorY + 2.05 + bathLintelH / 2, bathPodZCenter + bathPodD / 2);
    interiorGroup.add(lintel);
  }

  // Bathroom Door
  createInteriorDoor(bathPodXCenter, bathPodZCenter + bathPodD / 2, 0);

  // Restroom Internal Fittings: Toilet, Bathroom Vanity, Mirror, Shower
  const toilet = new THREE.Group();
  const bowl = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.38, 0.52),
    materials.countertopMaterial
  );
  bowl.position.set(0, 0.19, 0);
  toilet.add(bowl);
  const tank = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.45, 0.22),
    materials.countertopMaterial
  );
  tank.position.set(0, 0.45, -0.22);
  toilet.add(tank);
  const flushBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.01, 16),
    handleMat
  );
  flushBtn.position.set(0, 0.68, -0.22);
  toilet.add(flushBtn);
  toilet.position.set(bathPodXCenter + 0.48, floorY, bathPodZCenter - 0.35);
  interiorGroup.add(toilet);

  // Bathroom Vanity & Sink
  const vanity = new THREE.Group();
  const vanityBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.60, 0.55, 0.44),
    materials.cabinetMaterial
  );
  vanityBase.position.set(0, 0.275, 0);
  vanityBase.castShadow = true;
  vanity.add(vanityBase);

  const basin = new THREE.Mesh(
    new THREE.BoxGeometry(0.50, 0.12, 0.38),
    materials.countertopMaterial
  );
  basin.position.set(0, 0.55 + 0.06, 0);
  vanity.add(basin);

  const faucet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12),
    handleMat
  );
  faucet.position.set(0, 0.72, -0.12);
  vanity.add(faucet);

  const mirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.78, 0.02),
    materials.ledStripMaterial
  );
  mirror.position.set(0, 1.35, -0.21);
  vanity.add(mirror);

  vanity.position.set(bathPodXCenter - 0.48, floorY, bathPodZCenter - 0.35);
  interiorGroup.add(vanity);

  // Shower Tray & Glass Partition
  const showerTray = new THREE.Mesh(
    new THREE.BoxGeometry(0.80, 0.05, 0.75),
    materials.chassisMaterial
  );
  showerTray.position.set(bathPodXCenter - 0.45, floorY + 0.025, bathPodZCenter + 0.35);
  interiorGroup.add(showerTray);

  const showerGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, wallH - 0.2, 0.75),
    materials.glassMaterial
  );
  showerGlass.position.set(bathPodXCenter - 0.05, floorY + (wallH - 0.2) / 2, bathPodZCenter + 0.35);
  interiorGroup.add(showerGlass);

  const showerHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16),
    handleMat
  );
  showerHead.position.set(bathPodXCenter - 0.45, floorY + wallH - 0.2, bathPodZCenter + 0.45);
  interiorGroup.add(showerHead);

  // ---------------------------------------------------------------------------
  // 2. L-SHAPED KITCHEN CABINET (Central Living Space)
  // Absolute physical clearance from main entrance corridor (door at Z = +houseDepth/2)
  // ---------------------------------------------------------------------------
  const kitchenGroup = new THREE.Group();
  const kHeight = 0.88;
  const kDepth = 0.60;

  // Positioned directly in front of the restroom pod in the central zone
  // Long arm runs across X: 1.30m length
  const kLongArmW = 1.35;
  const kLongArmZ = bathPodZCenter + bathPodD / 2 + 0.55 + kDepth / 2; // Well clear of bathroom door
  const kLongArmX = 0.15; // Shifted slightly right, leaving corridor open

  const baseCabLong = new THREE.Mesh(
    new THREE.BoxGeometry(kLongArmW, kHeight, kDepth),
    materials.cabinetMaterial
  );
  baseCabLong.position.set(kLongArmX, floorY + kHeight / 2, kLongArmZ);
  baseCabLong.castShadow = true;
  kitchenGroup.add(baseCabLong);

  // Return arm (L-shape leg running along Z toward front): 0.85m length
  const kReturnL = 0.85;
  const kReturnX = kLongArmX - kLongArmW / 2 + kDepth / 2; // -0.225m
  const kReturnZ = kLongArmZ + kDepth / 2 + kReturnL / 2;

  const baseCabReturn = new THREE.Mesh(
    new THREE.BoxGeometry(kDepth, kHeight, kReturnL),
    materials.cabinetMaterial
  );
  baseCabReturn.position.set(kReturnX, floorY + kHeight / 2, kReturnZ);
  baseCabReturn.castShadow = true;
  kitchenGroup.add(baseCabReturn);

  // L-Shaped Countertop in stone/quartz
  const topLong = new THREE.Mesh(
    new THREE.BoxGeometry(kLongArmW + 0.02, 0.04, kDepth + 0.02),
    materials.countertopMaterial
  );
  topLong.position.set(kLongArmX, floorY + kHeight + 0.02, kLongArmZ);
  kitchenGroup.add(topLong);

  const topReturn = new THREE.Mesh(
    new THREE.BoxGeometry(kDepth + 0.02, 0.04, kReturnL),
    materials.countertopMaterial
  );
  topReturn.position.set(kReturnX, floorY + kHeight + 0.02, kReturnZ);
  kitchenGroup.add(topReturn);

  // Stainless Steel Sink on return arm
  const kSink = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.10, 0.44),
    materials.chassisMaterial
  );
  kSink.position.set(kReturnX, floorY + kHeight - 0.03, kReturnZ);
  kitchenGroup.add(kSink);

  const kFaucet = new THREE.Mesh(
    new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI),
    handleMat
  );
  kFaucet.position.set(kReturnX, floorY + kHeight + 0.14, kReturnZ - 0.15);
  kitchenGroup.add(kFaucet);

  // Induction Cooktop on long arm
  const kCooktop = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.015, 0.38),
    materials.chassisMaterial
  );
  kCooktop.position.set(kLongArmX + 0.28, floorY + kHeight + 0.025, kLongArmZ);
  kitchenGroup.add(kCooktop);

  // Overhead wall cabinet with LED task light
  const upperH = 0.65;
  const upperCab = new THREE.Mesh(
    new THREE.BoxGeometry(kLongArmW, upperH, 0.35),
    materials.cabinetMaterial
  );
  upperCab.position.set(kLongArmX, floorY + kHeight + 0.65 + upperH / 2, kLongArmZ);
  upperCab.castShadow = true;
  kitchenGroup.add(upperCab);

  const taskLed = new THREE.Mesh(
    new THREE.BoxGeometry(kLongArmW - 0.1, 0.015, 0.02),
    materials.ledStripMaterial
  );
  taskLed.position.set(kLongArmX, floorY + kHeight + 0.64, kLongArmZ);
  kitchenGroup.add(taskLed);

  interiorGroup.add(kitchenGroup);

  // ---------------------------------------------------------------------------
  // 3. LIVING ROOM ZONE (Sofa, Coffee Table, TV Console & 55" TV)
  // Placed without obstructing internal partition doors or main entrance corridor
  // ---------------------------------------------------------------------------
  const createLivingZone = (sofaX: number, sofaZ: number, tvX: number, tvZ: number, sofaW = 1.95) => {
    const loungeGroup = new THREE.Group();
    const sofaD = 0.78;

    // Sofa Base
    const sofaBase = new THREE.Mesh(
      new THREE.BoxGeometry(sofaW, 0.25, sofaD),
      materials.sofaBoucleMaterial || materials.furnitureFabricMaterial
    );
    sofaBase.position.set(sofaX, floorY + 0.125, sofaZ);
    sofaBase.castShadow = true;
    loungeGroup.add(sofaBase);

    // Sofa Backrest
    const sofaBack = new THREE.Mesh(
      new THREE.BoxGeometry(sofaW, 0.44, 0.18),
      materials.sofaBoucleMaterial || materials.furnitureFabricMaterial
    );
    sofaBack.position.set(sofaX, floorY + 0.25 + 0.22, sofaZ - sofaD / 2 + 0.09);
    loungeGroup.add(sofaBack);

    // Coffee Table
    const tableW = 0.85;
    const tableD = 0.45;
    const tableZ = sofaZ + sofaD / 2 + 0.38 + tableD / 2;
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(tableW, 0.30, tableD),
      materials.travertineTableMaterial || materials.cabinetMaterial
    );
    table.position.set(sofaX, floorY + 0.15, tableZ);
    table.castShadow = true;
    loungeGroup.add(table);

    // Area Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(sofaW + 0.4, 1.6),
      materials.furnitureFabricMaterial
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(sofaX, floorY + 0.002, (sofaZ + tableZ) / 2);
    loungeGroup.add(rug);

    // TV Console & 55" Widescreen Television
    const tvConsole = new THREE.Mesh(
      new THREE.BoxGeometry(1.20, 0.42, 0.34),
      materials.cabinetMaterial
    );
    tvConsole.position.set(tvX, floorY + 0.21, tvZ);
    tvConsole.castShadow = true;
    loungeGroup.add(tvConsole);

    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.65, 0.03),
      materials.chassisMaterial
    );
    tvScreen.position.set(tvX, floorY + 0.42 + 0.35, tvZ);
    loungeGroup.add(tvScreen);

    // TV Stand / Bezel
    const tvBezel = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.68, 0.015),
      handleMat
    );
    tvBezel.position.set(tvX, floorY + 0.42 + 0.35, tvZ - 0.01);
    loungeGroup.add(tvBezel);

    interiorGroup.add(loungeGroup);
  };

  // ---------------------------------------------------------------------------
  // 4. MODULAR BEDROOM CONFIGURATIONS (1-BR, 2-BR, 3-BR, 4-BR)
  // Dedicated bedroom partitions (75mm), beds, wardrobes, and private doors.
  // Strictly zero clipping through exterior walls or chassis fold lines (X = ±1.1m)!
  // ---------------------------------------------------------------------------

  if (effectiveBedrooms === 1) {
    // -------------------------------------------------------------------------
    // 1-BEDROOM LAYOUT (Grand Master Suite in Right Wing, Living Lounge in Left Wing)
    // -------------------------------------------------------------------------
    // Master Bedroom in Right Wing:
    // Partition wall along fold line clearance X = 1.15m (full wing depth with door)
    const suiteDepth = houseDepth - 2 * wallT;
    const doorPosZ = 0.35;
    const doorW = 0.75;
    const wallRearL = (bathPodZCenter + bathPodD / 2) - innerWallZRear;
    const wallFrontL = suiteDepth - wallRearL - doorW;

    // Longitudinal partition along Right Wing
    createPartitionWall(
      partWallT,
      (houseDepth / 2 - doorPosZ - doorW / 2),
      rightWingInnerXMin - 0.04,
      (doorPosZ + doorW / 2 + innerWallZFront) / 2
    );
    createPartitionWall(
      partWallT,
      (doorPosZ - doorW / 2 - innerWallZRear),
      rightWingInnerXMin - 0.04,
      (innerWallZRear + doorPosZ - doorW / 2) / 2
    );
    createInteriorDoor(rightWingInnerXMin - 0.04, doorPosZ, Math.PI / 2);

    // Master Bedroom Furniture
    const bedX = rightWingInnerXMin + wingWidth / 2 - 0.15;
    createBed(bedX, -0.6, 0, true);
    createWardrobe(innerWallXMax - 0.28, innerWallZFront - 0.70, 0, 1.10);

    // Living Lounge in Left Wing
    const loungeX = leftWingInnerXMax - wingWidth / 2 + 0.15;
    createLivingZone(loungeX, 0.15, innerWallXMin + 0.22, 0.95);

  } else if (effectiveBedrooms === 2) {
    // -------------------------------------------------------------------------
    // 2-BEDROOM LAYOUT (Standard Catalog 20FT, 30FT, 40FT)
    // Bedroom 1: Left Wing Rear
    // Bedroom 2: Right Wing Rear
    // Living Lounge: Front Wing / Central Open Area
    // -------------------------------------------------------------------------
    const bedRoomSplitZ = -0.15;
    const rearRoomDepth = bedRoomSplitZ - innerWallZRear;

    // Left Wing Bedroom 1 (Rear)
    // Transverse partition wall separating rear bedroom from front living room
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      leftWingInnerXMax - (wingWidth - 0.08) / 2,
      bedRoomSplitZ
    );
    // Longitudinal partition wall along spine with dedicated bedroom door
    const doorZ1 = bedRoomSplitZ - 0.65;
    createPartitionWall(
      partWallT,
      (bedRoomSplitZ - doorZ1 - 0.38),
      leftWingInnerXMax + 0.04,
      (bedRoomSplitZ + doorZ1 + 0.38) / 2
    );
    createPartitionWall(
      partWallT,
      (doorZ1 - 0.38 - innerWallZRear),
      leftWingInnerXMax + 0.04,
      (innerWallZRear + doorZ1 - 0.38) / 2
    );
    createInteriorDoor(leftWingInnerXMax + 0.04, doorZ1, Math.PI / 2);

    // Bedroom 1 Furniture: Bed, Wardrobe, Nightstand
    const bed1X = leftWingInnerXMax - (wingWidth - 0.08) / 2;
    const bed1Z = (innerWallZRear + bedRoomSplitZ) / 2 - 0.15;
    createBed(bed1X, bed1Z, 0);
    createWardrobe(innerWallXMin + 0.28, bedRoomSplitZ - 0.40, Math.PI / 2, 0.90);

    // Right Wing Bedroom 2 (Rear)
    // Transverse partition wall
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      rightWingInnerXMin + (wingWidth - 0.08) / 2,
      bedRoomSplitZ
    );
    // Longitudinal partition wall with dedicated bedroom door
    const doorZ2 = bedRoomSplitZ - 0.65;
    createPartitionWall(
      partWallT,
      (bedRoomSplitZ - doorZ2 - 0.38),
      rightWingInnerXMin - 0.04,
      (bedRoomSplitZ + doorZ2 + 0.38) / 2
    );
    createPartitionWall(
      partWallT,
      (doorZ2 - 0.38 - innerWallZRear),
      rightWingInnerXMin - 0.04,
      (innerWallZRear + doorZ2 - 0.38) / 2
    );
    createInteriorDoor(rightWingInnerXMin - 0.04, doorZ2, Math.PI / 2);

    // Bedroom 2 Furniture: Bed, Wardrobe, Nightstand
    const bed2X = rightWingInnerXMin + (wingWidth - 0.08) / 2;
    createBed(bed2X, bed1Z, 0);
    createWardrobe(innerWallXMax - 0.28, bedRoomSplitZ - 0.40, -Math.PI / 2, 0.90);

    // Living Lounge in Front Left Wing
    const loungeX = leftWingInnerXMax - (wingWidth - 0.08) / 2;
    const loungeZ = (bedRoomSplitZ + innerWallZFront) / 2 - 0.20;
    createLivingZone(loungeX, loungeZ, innerWallXMin + 0.22, loungeZ + 0.75);

  } else if (effectiveBedrooms === 3) {
    // -------------------------------------------------------------------------
    // 3-BEDROOM LAYOUT (Standard Catalog 30FT)
    // Bedroom 1: Left Wing Rear
    // Bedroom 2: Right Wing Rear
    // Bedroom 3: Right Wing Front
    // Living Lounge: Left Wing Front
    // -------------------------------------------------------------------------
    const rearSplitZ = -0.35;
    const frontSplitZ = 0.35;

    // Bedroom 1 (Left Rear)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      leftWingInnerXMax - (wingWidth - 0.08) / 2,
      rearSplitZ
    );
    const door1Z = rearSplitZ - 0.65;
    createPartitionWall(
      partWallT,
      (rearSplitZ - door1Z - 0.38),
      leftWingInnerXMax + 0.04,
      (rearSplitZ + door1Z + 0.38) / 2
    );
    createPartitionWall(
      partWallT,
      (door1Z - 0.38 - innerWallZRear),
      leftWingInnerXMax + 0.04,
      (innerWallZRear + door1Z - 0.38) / 2
    );
    createInteriorDoor(leftWingInnerXMax + 0.04, door1Z, Math.PI / 2);

    const b1X = leftWingInnerXMax - (wingWidth - 0.08) / 2;
    const b1Z = (innerWallZRear + rearSplitZ) / 2 - 0.15;
    createBed(b1X, b1Z, 0);
    createWardrobe(innerWallXMin + 0.28, rearSplitZ - 0.40, Math.PI / 2, 0.90);

    // Bedroom 2 (Right Rear)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      rightWingInnerXMin + (wingWidth - 0.08) / 2,
      rearSplitZ
    );
    const door2Z = rearSplitZ - 0.65;
    createPartitionWall(
      partWallT,
      (rearSplitZ - door2Z - 0.38),
      rightWingInnerXMin - 0.04,
      (rearSplitZ + door2Z + 0.38) / 2
    );
    createPartitionWall(
      partWallT,
      (door2Z - 0.38 - innerWallZRear),
      rightWingInnerXMin - 0.04,
      (innerWallZRear + door2Z - 0.38) / 2
    );
    createInteriorDoor(rightWingInnerXMin - 0.04, door2Z, Math.PI / 2);

    const b2X = rightWingInnerXMin + (wingWidth - 0.08) / 2;
    createBed(b2X, b1Z, 0);
    createWardrobe(innerWallXMax - 0.28, rearSplitZ - 0.40, -Math.PI / 2, 0.90);

    // Bedroom 3 (Right Front)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      rightWingInnerXMin + (wingWidth - 0.08) / 2,
      frontSplitZ
    );
    const door3Z = frontSplitZ + 0.65;
    createPartitionWall(
      partWallT,
      (door3Z - 0.38 - frontSplitZ),
      rightWingInnerXMin - 0.04,
      (frontSplitZ + door3Z - 0.38) / 2
    );
    createPartitionWall(
      partWallT,
      (innerWallZFront - door3Z - 0.38),
      rightWingInnerXMin - 0.04,
      (door3Z + 0.38 + innerWallZFront) / 2
    );
    createInteriorDoor(rightWingInnerXMin - 0.04, door3Z, Math.PI / 2);

    const b3X = rightWingInnerXMin + (wingWidth - 0.08) / 2;
    const b3Z = (frontSplitZ + innerWallZFront) / 2 + 0.15;
    createBed(b3X, b3Z, 0);
    createWardrobe(innerWallXMax - 0.28, frontSplitZ + 0.40, -Math.PI / 2, 0.90);

    // Living Lounge in Left Front Wing
    const loungeX = leftWingInnerXMax - (wingWidth - 0.08) / 2;
    const loungeZ = (frontSplitZ + innerWallZFront) / 2;
    createLivingZone(loungeX, loungeZ - 0.30, innerWallXMin + 0.22, loungeZ + 0.65);

  } else {
    // -------------------------------------------------------------------------
    // 4-BEDROOM LAYOUT (Standard Catalog 40FT Flagship)
    // Bedroom 1: Left Wing Rear
    // Bedroom 2: Right Wing Rear
    // Bedroom 3: Left Wing Front
    // Bedroom 4: Right Wing Front
    // Living Lounge: Central Open Great Room
    // -------------------------------------------------------------------------
    const rearSplitZ = -1.10;
    const frontSplitZ = 1.10;

    // Bedroom 1 (Left Rear)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      leftWingInnerXMax - (wingWidth - 0.08) / 2,
      rearSplitZ
    );
    createInteriorDoor(leftWingInnerXMax + 0.04, rearSplitZ - 0.65, Math.PI / 2);
    createPartitionWall(
      partWallT,
      rearSplitZ - 0.65 - 0.38 - innerWallZRear,
      leftWingInnerXMax + 0.04,
      (innerWallZRear + rearSplitZ - 1.03) / 2
    );
    const b1X = leftWingInnerXMax - (wingWidth - 0.08) / 2;
    const b1Z = (innerWallZRear + rearSplitZ) / 2;
    createBed(b1X, b1Z, 0);
    createWardrobe(innerWallXMin + 0.28, rearSplitZ - 0.45, Math.PI / 2, 0.90);

    // Bedroom 2 (Right Rear)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      rightWingInnerXMin + (wingWidth - 0.08) / 2,
      rearSplitZ
    );
    createInteriorDoor(rightWingInnerXMin - 0.04, rearSplitZ - 0.65, Math.PI / 2);
    createPartitionWall(
      partWallT,
      rearSplitZ - 0.65 - 0.38 - innerWallZRear,
      rightWingInnerXMin - 0.04,
      (innerWallZRear + rearSplitZ - 1.03) / 2
    );
    const b2X = rightWingInnerXMin + (wingWidth - 0.08) / 2;
    createBed(b2X, b1Z, 0);
    createWardrobe(innerWallXMax - 0.28, rearSplitZ - 0.45, -Math.PI / 2, 0.90);

    // Bedroom 3 (Left Front)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      leftWingInnerXMax - (wingWidth - 0.08) / 2,
      frontSplitZ
    );
    createInteriorDoor(leftWingInnerXMax + 0.04, frontSplitZ + 0.65, Math.PI / 2);
    createPartitionWall(
      partWallT,
      innerWallZFront - (frontSplitZ + 0.65 + 0.38),
      leftWingInnerXMax + 0.04,
      (frontSplitZ + 1.03 + innerWallZFront) / 2
    );
    const b3X = leftWingInnerXMax - (wingWidth - 0.08) / 2;
    const b3Z = (frontSplitZ + innerWallZFront) / 2;
    createBed(b3X, b3Z, 0);
    createWardrobe(innerWallXMin + 0.28, frontSplitZ + 0.45, Math.PI / 2, 0.90);

    // Bedroom 4 (Right Front)
    createPartitionWall(
      wingWidth - 0.08,
      partWallT,
      rightWingInnerXMin + (wingWidth - 0.08) / 2,
      frontSplitZ
    );
    createInteriorDoor(rightWingInnerXMin - 0.04, frontSplitZ + 0.65, Math.PI / 2);
    createPartitionWall(
      partWallT,
      innerWallZFront - (frontSplitZ + 0.65 + 0.38),
      rightWingInnerXMin - 0.04,
      (frontSplitZ + 1.03 + innerWallZFront) / 2
    );
    const b4X = rightWingInnerXMin + (wingWidth - 0.08) / 2;
    createBed(b4X, b3Z, 0);
    createWardrobe(innerWallXMax - 0.28, frontSplitZ + 0.45, -Math.PI / 2, 0.90);

    // Living Lounge in Central Great Room
    createLivingZone(0, 0.0, 0, 0.95, 1.80);
  }

  // Ambient interior lighting
  const ambientInteriorLight = new THREE.PointLight('#fff7ed', 0.65, 8.0);
  ambientInteriorLight.position.set(0, height - 0.35, 0.2);
  interiorGroup.add(ambientInteriorLight);
  interiorLights.push(ambientInteriorLight);
}
