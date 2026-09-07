import * as THREE from 'three';
import { CustomizationState, LightingMode } from '../../types';

// Procedural procedural canvas textures for crisp realism without heavy image downloads
export function createProceduralPlankTexture(colorHex: string, grainDarkHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle grain lines
    ctx.fillStyle = grainDarkHex;
    for (let y = 0; y < 512; y += 32) {
      ctx.fillRect(0, y, 512, 1);
      // Random subtle plank seams
      for (let x = (y * 37) % 128; x < 512; x += 128) {
        ctx.fillRect(x, y, 1, 32);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createCarvedRibbedNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#8080ff'; // flat normal base
    ctx.fillRect(0, 0, 128, 128);

    // Horizontal ridges
    for (let y = 0; y < 128; y += 8) {
      ctx.fillStyle = '#6060ff';
      ctx.fillRect(0, y, 128, 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 8);
  return texture;
}

export function createSolarGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#10243e';
    ctx.fillRect(0, 0, 256, 256);

    // Silicon wafer lines
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }

    // Busbars
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(85, 0);
    ctx.lineTo(85, 256);
    ctx.moveTo(170, 0);
    ctx.lineTo(170, 256);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export interface MaterialLibrary {
  wallMaterial: THREE.MeshPhysicalMaterial;
  chassisMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  floorMaterial: THREE.MeshStandardMaterial;
  roofMaterial: THREE.MeshStandardMaterial;
  solarMaterial: THREE.MeshStandardMaterial;
  ledStripMaterial: THREE.MeshStandardMaterial;
  downlightMaterial: THREE.MeshStandardMaterial;
  woodDeckMaterial: THREE.MeshStandardMaterial;
  interiorWallMaterial: THREE.MeshStandardMaterial;
  countertopMaterial: THREE.MeshStandardMaterial;
  cabinetMaterial: THREE.MeshStandardMaterial;
  metalTrimMaterial: THREE.MeshStandardMaterial;
  furnitureFabricMaterial: THREE.MeshStandardMaterial;
}

export function createMaterialLibrary(
  state: CustomizationState,
  lightingMode: LightingMode,
  activeOptions?: any
): MaterialLibrary {
  // Wall cladding parameters based on state
  let wallColor = activeOptions?.wallOpt?.color || '#f8fafc';
  let wallRoughness = activeOptions?.wallOpt?.roughness ?? 0.35;
  let wallMetalness = activeOptions?.wallOpt?.metalness ?? 0.15;
  let wallClearcoat = activeOptions?.wallOpt?.clearcoat ?? 0;
  let wallBumpMap: THREE.Texture | null = null;

  switch (state.wallCladding) {
    case 'carved-metal-slate':
      wallBumpMap = createCarvedRibbedNormalTexture();
      break;
    case 'wpc-nordic-oak':
      break;
  }

  // Glazing parameters
  let glassColor = '#dbeafe';
  let glassTransmission = 0.9;
  let glassOpacity = 0.35;
  let glassRoughness = 0.05;

  switch (state.glazing) {
    case 'low-e-clear':
      glassColor = '#bfdbfe';
      glassTransmission = 0.88;
      glassOpacity = 0.3;
      break;
    case 'low-e-bronze':
      glassColor = '#b45309';
      glassTransmission = 0.7;
      glassOpacity = 0.5;
      break;
    case 'floor-ceiling-curtain':
      glassColor = '#93c5fd';
      glassTransmission = 0.92;
      glassOpacity = 0.25;
      break;
    case 'privacy-smart-glass':
      glassColor = state.hasElectricBlinds ? '#f1f5f9' : '#e0e7ff';
      glassTransmission = state.hasElectricBlinds ? 0.3 : 0.85;
      glassOpacity = state.hasElectricBlinds ? 0.85 : 0.35;
      glassRoughness = state.hasElectricBlinds ? 0.5 : 0.05;
      break;
  }

  // Flooring parameters
  let floorBaseColor = activeOptions?.floorOpt?.color || '#dfd3c3';
  let floorGrainColor = '#bfae98';
  let floorRoughness = 0.45;
  let floorMetalness = 0.05;

  switch (state.flooring) {
    case 'spc-nordic-oak':
      floorGrainColor = '#c7b7a1';
      break;
    case 'spc-terrazzo-grey':
      floorGrainColor = '#64748b';
      floorRoughness = 0.3;
      floorMetalness = 0.1;
      break;
    case 'spc-american-walnut':
      floorGrainColor = '#382517';
      break;
    case 'polished-marble-white':
      floorGrainColor = '#cbd5e1';
      floorRoughness = 0.15;
      floorMetalness = 0.1;
      break;
    case 'deep-forest-green':
      floorGrainColor = '#09250c';
      floorRoughness = 0.1;
      floorMetalness = 0.1;
      break;
    case 'peechit-navy':
      floorGrainColor = '#00004d';
      floorRoughness = 0.8;
      floorMetalness = 0.05;
      break;
  }

  const floorTexture = createProceduralPlankTexture(floorBaseColor, floorGrainColor);

  // Cabinetry parameters
  let cabinetColor = activeOptions?.cabOpt?.color || '#1e293b';
  let cabinetRoughness = 0.4;
  let cabinetMetalness = 0.2;

  switch (state.cabinetry) {
    case 'matte-black':
      cabinetRoughness = 0.6;
      cabinetMetalness = 0.1;
      break;
    case 'gloss-white':
      cabinetRoughness = 0.1;
      cabinetMetalness = 0.05;
      break;
    case 'deep-forest-green':
      cabinetRoughness = 0.6;
      cabinetMetalness = 0.1;
      break;
    case 'peechit-navy':
      cabinetRoughness = 0.6;
      cabinetMetalness = 0.1;
      break;
  }

  // LED and lighting colors
  const isNight = lightingMode === 'night-ambient';
  const isGolden = lightingMode === 'golden-hour';

  const ledGlowIntensity = isNight ? 3.0 : isGolden ? 1.8 : 0.8;
  const downlightIntensity = isNight ? 2.5 : isGolden ? 1.4 : 0.5;

  let ledColorHex = '#ffedd5';
  if (state.lightingPackage === 'halo-strip-ambient') {
    ledColorHex = '#f59e0b';
  } else if (state.lightingPackage === 'architectural-luxe-smart') {
    ledColorHex = isNight ? '#38bdf8' : '#fbbf24';
  }

  return {
    wallMaterial: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(wallColor),
      roughness: wallRoughness,
      metalness: wallMetalness,
      clearcoat: wallClearcoat,
      bumpMap: wallBumpMap,
      bumpScale: 0.05,
    }),
    chassisMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111827'), // Boxabl / Apple Cabin deep graphite frame
      roughness: 0.3,
      metalness: 0.7,
    }),
    glassMaterial: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(glassColor),
      transparent: true,
      opacity: glassOpacity,
      transmission: glassTransmission,
      roughness: glassRoughness,
      metalness: 0.1,
      ior: 1.52,
      thickness: 0.1,
      depthWrite: false,
    }),
    floorMaterial: new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: floorRoughness,
      metalness: floorMetalness,
    }),
    roofMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334155'),
      roughness: 0.4,
      metalness: 0.3,
    }),
    solarMaterial: new THREE.MeshStandardMaterial({
      map: createSolarGridTexture(),
      roughness: 0.15,
      metalness: 0.85,
    }),
    ledStripMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color(ledColorHex),
      emissive: new THREE.Color(ledColorHex),
      emissiveIntensity: ledGlowIntensity,
      roughness: 0.2,
    }),
    downlightMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fffbeb'),
      emissive: new THREE.Color('#fef08a'),
      emissiveIntensity: downlightIntensity,
      roughness: 0.1,
    }),
    woodDeckMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#a16207'),
      roughness: 0.7,
      metalness: 0.05,
    }),
    interiorWallMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.6,
      metalness: 0.05,
    }),
    countertopMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f1f5f9'),
      roughness: 0.2,
      metalness: 0.1,
    }),
    cabinetMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color(cabinetColor),
      roughness: cabinetRoughness,
      metalness: cabinetMetalness,
    }),
    metalTrimMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e8f0'),
      roughness: 0.25,
      metalness: 0.8,
    }),
    furnitureFabricMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#64748b'),
      roughness: 0.8,
      metalness: 0.05,
    }),
  };
}
