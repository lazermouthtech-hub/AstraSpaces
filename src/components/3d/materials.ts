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
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Deep Midnight Obsidian Anti-Reflective Silicon Base
    ctx.fillStyle = '#060d19';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle crystalline depth gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, 'rgba(8, 20, 38, 0.9)');
    grad.addColorStop(0.5, 'rgba(10, 24, 46, 0.7)');
    grad.addColorStop(1, 'rgba(6, 14, 26, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. High-Efficiency Half-Cut Cell Matrix: 6 Columns x 12 Rows
    const cols = 6;
    const rows = 12;
    const marginX = 24;
    const marginY = 24;
    const gapX = 4;
    const gapY = 4;
    const centerSplitGap = 16; // Central half-cut module string division

    const totalW = 1024 - marginX * 2;
    const cellW = (totalW - (cols - 1) * gapX) / cols;
    const totalH = 1024 - marginY * 2 - centerSplitGap;
    const cellH = totalH / rows;

    for (let c = 0; c < cols; c++) {
      const x0 = marginX + c * (cellW + gapX);

      for (let r = 0; r < rows; r++) {
        // Split rows between top 6 and bottom 6 for half-cut module design
        const isBottomHalf = r >= 6;
        const y0 = marginY + r * (cellH + gapY) + (isBottomHalf ? centerSplitGap : 0);

        // Silicon wafer background
        ctx.fillStyle = '#08172c';
        ctx.fillRect(x0, y0, cellW, cellH);

        // Chamfered Monocrystalline pseudo-square corners
        const cornerCut = 9;
        ctx.fillStyle = '#02050a'; // Dark composite backsheet in corner gaps
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + cornerCut, y0);
        ctx.lineTo(x0, y0 + cornerCut);
        ctx.closePath();
        ctx.fill();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x0 + cellW, y0);
        ctx.lineTo(x0 + cellW - cornerCut, y0);
        ctx.lineTo(x0 + cellW, y0 + cornerCut);
        ctx.closePath();
        ctx.fill();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x0, y0 + cellH);
        ctx.lineTo(x0 + cornerCut, y0 + cellH);
        ctx.lineTo(x0, y0 + cellH - cornerCut);
        ctx.closePath();
        ctx.fill();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x0 + cellW, y0 + cellH);
        ctx.lineTo(x0 + cellW - cornerCut, y0 + cellH);
        ctx.lineTo(x0 + cellW, y0 + cellH - cornerCut);
        ctx.closePath();
        ctx.fill();

        // 3. Ultra-Dense Silicon Micro-Fingers (horizontal conductive grid)
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.22)';
        ctx.lineWidth = 1;
        for (let fy = y0 + 3; fy < y0 + cellH - 2; fy += 4) {
          ctx.beginPath();
          ctx.moveTo(x0 + 1, fy);
          ctx.lineTo(x0 + cellW - 1, fy);
          ctx.stroke();
        }

        // 4. Multi-Busbar (MBB) Technology: 9 ultra-fine silver busbars per cell
        const busbars = 9;
        const busbarSpacing = cellW / (busbars + 1);
        ctx.strokeStyle = '#e2e8f0'; // Metallic silver conductor
        ctx.lineWidth = 1.6;

        for (let b = 1; b <= busbars; b++) {
          const bx = x0 + b * busbarSpacing;
          ctx.beginPath();
          ctx.moveTo(bx, y0);
          ctx.lineTo(bx, y0 + cellH);
          ctx.stroke();

          // Conductor solder bonding pads at cell borders
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(bx - 1.5, y0, 3, 3);
          ctx.fillRect(bx - 1.5, y0 + cellH - 3, 3, 3);
        }
      }
    }

    // 5. Central Half-Cut String Division Bridge
    const splitY = marginY + 6 * (cellH + gapY);
    ctx.fillStyle = '#030712';
    ctx.fillRect(marginX - 6, splitY, totalW + 12, centerSplitGap);

    // Silver bypass ribbon connectors across central division
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < cols; i++) {
      const ribbonX = marginX + i * (cellW + gapX) + cellW * 0.45;
      ctx.fillRect(ribbonX, splitY + 2, cellW * 0.1, centerSplitGap - 4);
    }

    // 6. Perimeter Anti-Reflective Margin Border inside Aluminum Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 1004, 1004);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
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
  cabinetWoodNicheMaterial: THREE.MeshStandardMaterial;
  brassHandleMaterial: THREE.MeshStandardMaterial;
  applianceGlassMaterial: THREE.MeshStandardMaterial;
  backsplashMaterial: THREE.MeshStandardMaterial;
  metalTrimMaterial: THREE.MeshStandardMaterial;
  furnitureFabricMaterial: THREE.MeshStandardMaterial;
  bedLinenMaterial: THREE.MeshStandardMaterial;
  bedDuvetMaterial: THREE.MeshStandardMaterial;
  bedAccentThrowMaterial: THREE.MeshStandardMaterial;
  nightstandWoodMaterial: THREE.MeshStandardMaterial;
  lampGlowMaterial: THREE.MeshStandardMaterial;
  sofaBoucleMaterial: THREE.MeshStandardMaterial;
  sofaWoodFrameMaterial: THREE.MeshStandardMaterial;
  sofaLegMaterial: THREE.MeshStandardMaterial;
  sofaCushionAccent1: THREE.MeshStandardMaterial;
  sofaCushionAccent2: THREE.MeshStandardMaterial;
  sofaThrowBlanketMaterial: THREE.MeshStandardMaterial;
  travertineTableMaterial: THREE.MeshStandardMaterial;
  ceramicVesselMaterial: THREE.MeshStandardMaterial;
  candleGlowMaterial: THREE.MeshStandardMaterial;
  solarFrameMaterial: THREE.MeshStandardMaterial;
  solarRailMaterial: THREE.MeshStandardMaterial;
  solarClampMaterial: THREE.MeshStandardMaterial;
  solarMicroinverterMaterial: THREE.MeshStandardMaterial;
  solarConduitMaterial: THREE.MeshStandardMaterial;
  solarStatusLedMaterial: THREE.MeshStandardMaterial;
  solarDecalMaterial: THREE.MeshStandardMaterial;
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
    default:
      if (activeOptions?.glassOpt?.color) {
        glassColor = activeOptions.glassOpt.color;
      }
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
    cabinetWoodNicheMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#92400e'),
      roughness: 0.6,
      metalness: 0.05,
    }),
    brassHandleMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2b36e'),
      roughness: 0.25,
      metalness: 0.85,
    }),
    applianceGlassMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.1,
      metalness: 0.8,
    }),
    backsplashMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.15,
      metalness: 0.05,
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
    bedLinenMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.82,
      metalness: 0.02,
    }),
    bedDuvetMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      roughness: 0.75,
      metalness: 0.03,
    }),
    bedAccentThrowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#78350f'),
      roughness: 0.88,
      metalness: 0.02,
    }),
    nightstandWoodMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#451a03'),
      roughness: 0.55,
      metalness: 0.05,
    }),
    lampGlowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fffbeb'),
      emissive: new THREE.Color('#fef08a'),
      emissiveIntensity: 0.75,
      roughness: 0.2,
    }),
    sofaBoucleMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2ded8'),
      roughness: 0.86,
      metalness: 0.02,
    }),
    sofaWoodFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3e2723'),
      roughness: 0.45,
      metalness: 0.05,
    }),
    sofaLegMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1e293b'),
      roughness: 0.35,
      metalness: 0.85,
    }),
    sofaCushionAccent1: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9a3412'),
      roughness: 0.55,
      metalness: 0.08,
    }),
    sofaCushionAccent2: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3f4f3e'),
      roughness: 0.78,
      metalness: 0.03,
    }),
    sofaThrowBlanketMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#475569'),
      roughness: 0.92,
      metalness: 0.02,
    }),
    travertineTableMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f5f0eb'),
      roughness: 0.65,
      metalness: 0.04,
    }),
    ceramicVesselMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#c2410c'),
      roughness: 0.88,
      metalness: 0.02,
    }),
    candleGlowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d97706'),
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.1,
    }),
    solarFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#18181b'),
      roughness: 0.32,
      metalness: 0.88,
    }),
    solarRailMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#475569'),
      roughness: 0.38,
      metalness: 0.82,
    }),
    solarClampMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.25,
      metalness: 0.95,
    }),
    solarMicroinverterMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334155'),
      roughness: 0.45,
      metalness: 0.70,
    }),
    solarConduitMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#09090b'),
      roughness: 0.55,
      metalness: 0.25,
    }),
    solarStatusLedMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22c55e'),
      emissive: new THREE.Color('#22c55e'),
      emissiveIntensity: 2.5,
      roughness: 0.1,
    }),
    solarDecalMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#eab308'),
      roughness: 0.5,
      metalness: 0.1,
    }),
  };
}
