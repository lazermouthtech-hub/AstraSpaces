import * as THREE from 'three';
import { CustomizationState, FloorPlanId } from '../../types';

export interface ExpandableRoomWaypoint {
  id: string;
  label: string;
  shortLabel: string;
  category: 'hall' | 'living' | 'kitchen' | 'bath' | 'bedroom' | 'study';
  pos: [number, number, number];
  lookAt: [number, number, number];
}

export interface ExpandableInteriorBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
  floorY: number;
  eyeY: number;
}

export interface ExpandableHouseMeta {
  isExpandable: boolean;
  is10ft: boolean;
  is20ft: boolean;
  is30ft: boolean;
  is40ft: boolean;
  deployedWidth: number;
  houseDepth: number;
  coreWidth: number;
  wingWidth: number;
  leftWingCenterX: number;
  rightWingCenterX: number;
  bounds: ExpandableInteriorBounds;
  waypoints: ExpandableRoomWaypoint[];
}

export function isExpandableModelId(modelId: string): boolean {
  return modelId.includes('expandable');
}

export function getExpandableDimensions(modelId: string): {
  isExpandable: boolean;
  is10ft: boolean;
  is20ft: boolean;
  is30ft: boolean;
  is40ft: boolean;
  deployedWidth: number;
  houseDepth: number;
  coreWidth: number;
  wingWidth: number;
} {
  const isExpandable = isExpandableModelId(modelId);
  const is10ft = modelId.includes('10ft');
  const is30ft = modelId.includes('30ft');
  const is40ft = modelId.includes('40ft');
  const is20ft = !is10ft && !is30ft && !is40ft && isExpandable;

  const coreWidth = 2.2;
  const deployedWidth = is10ft || is20ft ? 5.9 : 6.4;
  const houseDepth = is10ft ? 3.1 : is20ft ? 6.4 : is30ft ? 9.0 : 11.8;
  const wingWidth = (deployedWidth - coreWidth) / 2;

  return {
    isExpandable,
    is10ft,
    is20ft,
    is30ft,
    is40ft,
    deployedWidth,
    houseDepth,
    coreWidth,
    wingWidth,
  };
}

export function getExpandableHouseMeta(state: CustomizationState): ExpandableHouseMeta {
  const dims = getExpandableDimensions(state.modelId);
  const {
    isExpandable,
    is10ft,
    is20ft,
    is30ft,
    is40ft,
    deployedWidth,
    houseDepth,
    coreWidth,
    wingWidth,
  } = dims;

  const wallT = 0.12;
  const zRear = -houseDepth / 2 + wallT;
  const zFront = houseDepth / 2 - wallT;
  const leftWallX = -deployedWidth / 2 + wallT;
  const rightWallX = deployedWidth / 2 - wallT;
  const leftWingCenterX = -(coreWidth / 2 + wingWidth / 2);
  const rightWingCenterX = coreWidth / 2 + wingWidth / 2;

  const floorY = 0.15;
  const eyeY = is10ft ? 1.40 : 1.46;

  const bounds: ExpandableInteriorBounds = {
    minX: leftWallX + 0.30,
    maxX: rightWallX - 0.30,
    minZ: zRear + 0.30,
    maxZ: zFront - 0.30,
    minY: 1.15,
    maxY: 2.05,
    floorY,
    eyeY,
  };

  if (!isExpandable) {
    return {
      ...dims,
      leftWingCenterX,
      rightWingCenterX,
      bounds,
      waypoints: [],
    };
  }

  const waypoints: ExpandableRoomWaypoint[] = [];
  const activeFloorPlan: FloorPlanId = (state.floorPlan as FloorPlanId) || '2-bed-1-bath';
  const hasBath = state.hasLuxuryBathPod !== false;
  const hasKitchen = state.hasKitchenetteModule !== false;

  const bathWaypoint: ExpandableRoomWaypoint | null = hasBath
    ? {
        id: 'bathroom',
        label: 'Bathroom Pod',
        shortLabel: 'Bath',
        category: 'bath',
        pos: is10ft
          ? [-0.22, 1.38, zRear + 1.12]
          : [-0.24, eyeY, zRear + 1.32],
        lookAt: is10ft
          ? [0.16, 0.96, zRear + 0.48]
          : [0.18, 0.98, zRear + 0.56],
      }
    : null;

  if (is10ft) {
    waypoints.push({
      id: 'entrance',
      label: 'Central Entry',
      shortLabel: 'Entry',
      category: 'hall',
      pos: [0, 1.40, zFront - 0.42],
      lookAt: [0, 1.10, -0.35],
    });

    if (hasKitchen) {
      waypoints.push({
        id: 'kitchen',
        label: 'Kitchenette',
        shortLabel: 'Kitchen',
        category: 'kitchen',
        pos: [-1.45, 1.40, zFront - 0.45],
        lookAt: [-1.75, 0.96, zRear + 0.55],
      });
    } else {
      waypoints.push({
        id: 'living',
        label: 'Living Studio',
        shortLabel: 'Living',
        category: 'living',
        pos: [-0.95, 1.40, zFront - 0.48],
        lookAt: [leftWingCenterX - 0.15, 0.88, 0.05],
      });
    }

    waypoints.push({
      id: 'bedroom-1',
      label: 'Master Suite',
      shortLabel: 'Master Bed',
      category: 'bedroom',
      pos: [1.10, 1.40, zFront - 0.48],
      lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.85],
    });

    if (bathWaypoint) waypoints.push(bathWaypoint);

    return {
      ...dims,
      leftWingCenterX,
      rightWingCenterX,
      bounds,
      waypoints,
    };
  }

  switch (activeFloorPlan) {
    case '1-bed-grand-dining': {
      waypoints.push({
        id: 'entrance',
        label: 'Grand Hall Entry',
        shortLabel: 'Entry',
        category: 'hall',
        pos: [0, eyeY, zFront - 0.65],
        lookAt: [0, 1.00, 0.45],
      });
      waypoints.push({
        id: 'living',
        label: 'Sunlit Living Lounge',
        shortLabel: 'Living',
        category: 'living',
        pos: [rightWingCenterX - 0.85, eyeY, Math.min(zFront - 0.55, 2.35)],
        lookAt: [rightWingCenterX, 0.88, 1.15],
      });
      waypoints.push({
        id: 'dining',
        label: 'Grand Banquet Dining',
        shortLabel: 'Dining',
        category: 'living',
        pos: [0.80, eyeY, Math.min(zFront - 0.65, 2.25)],
        lookAt: [0, 0.90, 0.65],
      });
      if (hasKitchen) {
        waypoints.push({
          id: 'kitchen',
          label: 'Gourmet Kitchen',
          shortLabel: 'Kitchen',
          category: 'kitchen',
          pos: [leftWallX + 0.48, eyeY, zRear + 2.35],
          lookAt: [-coreWidth / 2 - 0.55, 0.98, zRear + 0.65],
        });
      }
      waypoints.push({
        id: 'bedroom-1',
        label: 'Master Suite',
        shortLabel: 'Master Bed',
        category: 'bedroom',
        pos: [rightWingCenterX - 0.45, eyeY, Math.min(-0.70, zRear + 2.60)],
        lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.90],
      });
      if (bathWaypoint) waypoints.push(bathWaypoint);
      break;
    }

    case '1-bed-studio-suite': {
      waypoints.push({
        id: 'entrance',
        label: 'Central Gallery',
        shortLabel: 'Entry',
        category: 'hall',
        pos: [0, eyeY, zFront - 0.65],
        lookAt: [-0.35, 1.05, 0.35],
      });
      waypoints.push({
        id: 'kitchen',
        label: 'Kitchen & Dining',
        shortLabel: 'Kitchen',
        category: 'kitchen',
        pos: [-0.55, eyeY, Math.min(zFront - 0.65, 2.40)],
        lookAt: [leftWingCenterX, 1.00, zRear + 1.10],
      });
      waypoints.push({
        id: 'bedroom-1',
        label: 'Executive Master Suite',
        shortLabel: 'Master Bed',
        category: 'bedroom',
        pos: [rightWingCenterX - 0.45, eyeY, Math.min(0.10, zRear + 2.75)],
        lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.95],
      });
      waypoints.push({
        id: 'study',
        label: 'Executive Office',
        shortLabel: 'Office',
        category: 'study',
        pos: [rightWingCenterX - 0.45, eyeY, Math.max(0.45, zFront - 2.15)],
        lookAt: [rightWingCenterX, 0.95, zFront - 0.65],
      });
      if (bathWaypoint) waypoints.push(bathWaypoint);
      break;
    }

    case '3-bed-split-1-bath': {
      if (is40ft) {
        waypoints.push({
          id: 'entrance',
          label: 'Central Foyer',
          shortLabel: 'Entry',
          category: 'hall',
          pos: [0, eyeY, 4.95],
          lookAt: [0, 1.10, 0.2],
        });
        waypoints.push({
          id: 'living',
          label: 'Great Room Lounge',
          shortLabel: 'Living',
          category: 'living',
          pos: [0.55, eyeY, 2.15],
          lookAt: [leftWingCenterX, 0.90, 0.96],
        });
        if (hasKitchen) {
          waypoints.push({
            id: 'kitchen',
            label: 'Chef Kitchen & Dining',
            shortLabel: 'Kitchen',
            category: 'kitchen',
            pos: [leftWallX + 0.52, eyeY, -2.55],
            lookAt: [-coreWidth / 2 - 0.55, 1.00, -4.95],
          });
        }
        waypoints.push({
          id: 'study',
          label: 'Executive Study',
          shortLabel: 'Study',
          category: 'study',
          pos: [leftWingCenterX + 0.65, eyeY, 2.50],
          lookAt: [leftWingCenterX, 0.95, 4.00],
        });
        waypoints.push({
          id: 'bedroom-1',
          label: 'Master Bedroom (Bay 1)',
          shortLabel: 'Master Bed',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, -2.65],
          lookAt: [rightWingCenterX + 0.10, 0.85, -4.80],
        });
        waypoints.push({
          id: 'bedroom-2',
          label: 'Bedroom 2 (Bay 2)',
          shortLabel: 'Bed 2',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, 1.20],
          lookAt: [rightWingCenterX + 0.10, 0.85, -0.95],
        });
        waypoints.push({
          id: 'bedroom-3',
          label: 'Bedroom 3 (Bay 3)',
          shortLabel: 'Bed 3',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, 2.65],
          lookAt: [rightWingCenterX + 0.10, 0.85, 4.80],
        });
        if (bathWaypoint) waypoints.push(bathWaypoint);
      } else {
        waypoints.push({
          id: 'entrance',
          label: 'Central Hall',
          shortLabel: 'Entry',
          category: 'hall',
          pos: [0, eyeY, zFront - 0.65],
          lookAt: [0, 1.10, -0.5],
        });
        waypoints.push({
          id: 'kitchen',
          label: 'Kitchen & Dining',
          shortLabel: 'Kitchen',
          category: 'kitchen',
          pos: [leftWallX + 0.48, eyeY, -0.35],
          lookAt: [-coreWidth / 2 - 0.55, 0.98, zRear + 0.75],
        });
        waypoints.push({
          id: 'bedroom-1',
          label: 'Bedroom 1 (Front-L)',
          shortLabel: 'Bed 1',
          category: 'bedroom',
          pos: [leftWingCenterX + 0.45, eyeY, Math.max(0.45, zFront - 2.60)],
          lookAt: [leftWingCenterX - 0.10, 0.85, zFront - 0.85],
        });
        waypoints.push({
          id: 'bedroom-2',
          label: 'Master Bed (Rear-R)',
          shortLabel: 'Master Bed',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, Math.min(-0.35, zRear + 2.60)],
          lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.85],
        });
        waypoints.push({
          id: 'bedroom-3',
          label: 'Bedroom 3 (Front-R)',
          shortLabel: 'Bed 3',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, Math.max(0.45, zFront - 2.60)],
          lookAt: [rightWingCenterX + 0.10, 0.85, zFront - 0.85],
        });
        if (bathWaypoint) waypoints.push(bathWaypoint);
      }
      break;
    }

    case '3-bed-kitchen-lounge': {
      if (is40ft) {
        waypoints.push({
          id: 'entrance',
          label: 'Central Foyer',
          shortLabel: 'Entry',
          category: 'hall',
          pos: [0, eyeY, 5.05],
          lookAt: [0, 1.10, 0.5],
        });
        waypoints.push({
          id: 'living',
          label: 'Front Living Lounge',
          shortLabel: 'Living',
          category: 'living',
          pos: [0.55, eyeY, 5.10],
          lookAt: [leftWingCenterX, 0.90, 4.20],
        });
        waypoints.push({
          id: 'kitchen',
          label: 'Peninsula Kitchen',
          shortLabel: 'Kitchen',
          category: 'kitchen',
          pos: [0.35, eyeY, 0.95],
          lookAt: [leftWingCenterX, 1.00, -0.20],
        });
        waypoints.push({
          id: 'study',
          label: 'Media & Work Nook',
          shortLabel: 'Study',
          category: 'study',
          pos: [0.35, eyeY, 1.25],
          lookAt: [rightWingCenterX, 0.95, 0.00],
        });
        waypoints.push({
          id: 'bedroom-1',
          label: 'Master Bedroom (Rear-L)',
          shortLabel: 'Master Bed',
          category: 'bedroom',
          pos: [leftWingCenterX + 0.45, eyeY, -2.65],
          lookAt: [leftWingCenterX - 0.10, 0.85, -4.80],
        });
        waypoints.push({
          id: 'bedroom-2',
          label: 'Bedroom 2 (Rear-R)',
          shortLabel: 'Bed 2',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, -2.65],
          lookAt: [rightWingCenterX + 0.10, 0.85, -4.80],
        });
        waypoints.push({
          id: 'bedroom-3',
          label: 'Bedroom 3 (Front-R)',
          shortLabel: 'Bed 3',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, 2.65],
          lookAt: [rightWingCenterX + 0.10, 0.85, 4.80],
        });
        if (bathWaypoint) waypoints.push(bathWaypoint);
      } else {
        const tvWallZ = is30ft ? 2.30 : 1.90;
        waypoints.push({
          id: 'entrance',
          label: 'Central Hall',
          shortLabel: 'Entry',
          category: 'hall',
          pos: [0, eyeY, zFront - 0.65],
          lookAt: [leftWingCenterX * 0.4, 1.05, 0.5],
        });
        waypoints.push({
          id: 'living',
          label: 'Lounge & Peninsula',
          shortLabel: 'Living',
          category: 'living',
          pos: [0.60, eyeY, Math.min(zFront - 0.55, tvWallZ + 0.90)],
          lookAt: [leftWingCenterX, 0.92, tvWallZ - 0.35],
        });
        waypoints.push({
          id: 'bedroom-1',
          label: 'Master Bed (Rear-L)',
          shortLabel: 'Master Bed',
          category: 'bedroom',
          pos: [leftWingCenterX + 0.45, eyeY, Math.min(-0.68, zRear + 2.55)],
          lookAt: [leftWingCenterX - 0.10, 0.85, zRear + 0.85],
        });
        waypoints.push({
          id: 'bedroom-2',
          label: 'Bedroom 2 (Rear-R)',
          shortLabel: 'Bed 2',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, Math.min(-0.35, zRear + 2.60)],
          lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.85],
        });
        waypoints.push({
          id: 'bedroom-3',
          label: 'Bedroom 3 (Front-R)',
          shortLabel: 'Bed 3',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, Math.max(0.45, zFront - 2.60)],
          lookAt: [rightWingCenterX + 0.10, 0.85, zFront - 0.85],
        });
        if (bathWaypoint) waypoints.push(bathWaypoint);
      }
      break;
    }

    case '4-bed-quad-suite': {
      if (is40ft) {
        waypoints.push({
          id: 'entrance',
          label: 'Central Corridor',
          shortLabel: 'Entry',
          category: 'hall',
          pos: [0, eyeY, 5.05],
          lookAt: [0, 1.15, 0],
        });
        waypoints.push({
          id: 'living',
          label: 'Great Room Lounge',
          shortLabel: 'Living',
          category: 'living',
          pos: [0.55, eyeY, 1.95],
          lookAt: [leftWingCenterX, 0.90, 0.96],
        });
        if (hasKitchen) {
          waypoints.push({
            id: 'kitchen',
            label: 'Kitchen & Dining',
            shortLabel: 'Kitchen',
            category: 'kitchen',
            pos: [leftWingCenterX + 0.65, eyeY, -2.50],
            lookAt: [leftWingCenterX, 1.05, -4.80],
          });
        }
        waypoints.push({
          id: 'bedroom-1',
          label: 'Bedroom 1 (Master)',
          shortLabel: 'Bed 1',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, -2.65],
          lookAt: [rightWingCenterX + 0.10, 0.85, -4.80],
        });
        waypoints.push({
          id: 'bedroom-2',
          label: 'Bedroom 2 (Mid-R)',
          shortLabel: 'Bed 2',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, 1.20],
          lookAt: [rightWingCenterX + 0.10, 0.85, -0.95],
        });
        waypoints.push({
          id: 'bedroom-3',
          label: 'Bedroom 3 (Front-R)',
          shortLabel: 'Bed 3',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, 2.65],
          lookAt: [rightWingCenterX + 0.10, 0.85, 4.80],
        });
        waypoints.push({
          id: 'bedroom-4',
          label: 'Bedroom 4 (Front-L)',
          shortLabel: 'Bed 4',
          category: 'bedroom',
          pos: [leftWingCenterX + 0.45, eyeY, 2.65],
          lookAt: [leftWingCenterX - 0.10, 0.85, 4.80],
        });
        if (bathWaypoint) waypoints.push(bathWaypoint);
      } else {
        waypoints.push({
          id: 'entrance',
          label: 'Central Corridor',
          shortLabel: 'Corridor',
          category: 'hall',
          pos: [0, eyeY, zFront - 0.65],
          lookAt: [0, 1.15, zRear + 1.80],
        });
        waypoints.push({
          id: 'bedroom-1',
          label: 'Bedroom 1 (Rear-L)',
          shortLabel: 'Bed 1',
          category: 'bedroom',
          pos: [leftWingCenterX + 0.45, eyeY, Math.min(-0.35, zRear + 2.60)],
          lookAt: [leftWingCenterX - 0.10, 0.85, zRear + 0.85],
        });
        waypoints.push({
          id: 'bedroom-2',
          label: 'Bedroom 2 (Front-L)',
          shortLabel: 'Bed 2',
          category: 'bedroom',
          pos: [leftWingCenterX + 0.45, eyeY, Math.max(0.45, zFront - 2.60)],
          lookAt: [leftWingCenterX - 0.10, 0.85, zFront - 0.85],
        });
        waypoints.push({
          id: 'bedroom-3',
          label: 'Bedroom 3 (Rear-R)',
          shortLabel: 'Bed 3',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, Math.min(-0.35, zRear + 2.60)],
          lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.85],
        });
        waypoints.push({
          id: 'bedroom-4',
          label: 'Bedroom 4 (Front-R)',
          shortLabel: 'Bed 4',
          category: 'bedroom',
          pos: [rightWingCenterX - 0.45, eyeY, Math.max(0.45, zFront - 2.60)],
          lookAt: [rightWingCenterX + 0.10, 0.85, zFront - 0.85],
        });
        if (bathWaypoint) waypoints.push(bathWaypoint);
      }
      break;
    }

    case '2-bed-1-bath':
    default: {
      const tvWallZ = is40ft ? 4.20 : is30ft ? 2.30 : 1.90;
      waypoints.push({
        id: 'entrance',
        label: 'Central Entry Hall',
        shortLabel: 'Entry',
        category: 'hall',
        pos: [0, eyeY, zFront - 0.68],
        lookAt: [0, 1.15, zRear + 1.80],
      });
      waypoints.push({
        id: 'living',
        label: 'Living Lounge',
        shortLabel: 'Living',
        category: 'living',
        pos: [0.60, eyeY, Math.min(zFront - 0.55, tvWallZ + 0.90)],
        lookAt: [leftWingCenterX, 0.90, tvWallZ],
      });
      if (hasKitchen) {
        waypoints.push({
          id: 'kitchen',
          label: 'Gourmet Kitchen',
          shortLabel: 'Kitchen',
          category: 'kitchen',
          pos: [leftWallX + 0.48, eyeY, zRear + 2.35],
          lookAt: [-coreWidth / 2 - 0.55, 0.98, zRear + 0.65],
        });
      }
      waypoints.push({
        id: 'bedroom-1',
        label: 'Master Bedroom',
        shortLabel: 'Master Bed',
        category: 'bedroom',
        pos: [rightWingCenterX - 0.45, eyeY, Math.min(-0.35, zRear + 2.60)],
        lookAt: [rightWingCenterX + 0.10, 0.85, zRear + 0.85],
      });
      waypoints.push({
        id: 'bedroom-2',
        label: 'Bedroom 2',
        shortLabel: 'Bed 2',
        category: 'bedroom',
        pos: [rightWingCenterX - 0.45, eyeY, Math.max(0.45, zFront - 2.60)],
        lookAt: [rightWingCenterX + 0.10, 0.85, zFront - 0.85],
      });
      if (bathWaypoint) waypoints.push(bathWaypoint);
      break;
    }
  }

  return {
    ...dims,
    leftWingCenterX,
    rightWingCenterX,
    bounds,
    waypoints,
  };
}

export function clampToExpandableInterior(
  vec: THREE.Vector3,
  bounds: ExpandableInteriorBounds
): THREE.Vector3 {
  vec.x = THREE.MathUtils.clamp(vec.x, bounds.minX, bounds.maxX);
  vec.y = THREE.MathUtils.clamp(vec.y, bounds.minY, bounds.maxY);
  vec.z = THREE.MathUtils.clamp(vec.z, bounds.minZ, bounds.maxZ);
  return vec;
}

export function findNearestWaypointId(
  pos: THREE.Vector3,
  waypoints: ExpandableRoomWaypoint[]
): string | null {
  if (!waypoints.length) return null;
  let bestId = waypoints[0].id;
  let bestDistSq = Infinity;
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const dx = pos.x - wp.pos[0];
    const dz = pos.z - wp.pos[2];
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestId = wp.id;
    }
  }
  return bestId;
}
